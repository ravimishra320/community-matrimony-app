# Quick Start Guide

Get the Matrimony App running in 20 minutes.

## Prerequisites Checklist

- [ ] AWS Account with admin access
- [ ] AWS CLI configured (`aws configure`)
- [ ] Terraform >= 1.5.0 (`terraform --version`)
- [ ] Node.js >= 18.x (`node --version`)
- [ ] PostgreSQL client (`psql --version`)
- [ ] Expo CLI (`npm install -g expo-cli`)

## 5-Step Deployment

### Step 1: Deploy Infrastructure (10 min)

```bash
cd matrimony-app/terraform

# Configure variables
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars  # Set db_master_password

# Deploy
terraform init
terraform apply -auto-approve

# Save outputs
terraform output > outputs.txt
```

**Expected Output:**
```
Apply complete! Resources: 30 added, 0 changed, 0 destroyed.

Outputs:
cognito_user_pool_id = "us-east-1_XXXXXXXXX"
api_gateway_url = "https://xxxxx.execute-api.us-east-1.amazonaws.com/dev"
...
```

### Step 2: Initialize Database (2 min)

```bash
# Get endpoint
AURORA_ENDPOINT=$(terraform output -raw aurora_cluster_endpoint)

# Run schema
psql -h $AURORA_ENDPOINT -U dbadmin -d matrimony -f ../database/schema.sql

# Verify
psql -h $AURORA_ENDPOINT -U dbadmin -d matrimony -c "\dt"
```

**Expected Output:**
```
              List of relations
 Schema |        Name         | Type  |  Owner
--------+---------------------+-------+---------
 public | connections         | table | dbadmin
 public | messages            | table | dbadmin
 public | profiles            | table | dbadmin
 public | swipe_history       | table | dbadmin
 public | users               | table | dbadmin
 public | verification_queue  | table | dbadmin
```

### Step 3: Deploy Lambda Functions (5 min)

```bash
cd ../lambdas

# Install & build
npm install
npm run build

# Package & deploy
chmod +x deploy.sh
./deploy.sh

# Deploy to AWS
cd ../terraform
terraform apply -auto-approve
```

**Expected Output:**
```
Apply complete! Resources: 8 added, 0 changed, 0 destroyed.
```

### Step 4: Configure Mobile App (1 min)

```bash
cd ../mobile

# Edit AWS config
nano src/config/aws.ts
```

Update with your Terraform outputs:
```typescript
export const AWS_CONFIG = {
  region: 'us-east-1',
  cognito: {
    userPoolId: 'YOUR_USER_POOL_ID',      // From terraform output
    userPoolClientId: 'YOUR_CLIENT_ID',    // From terraform output
  },
  api: {
    baseUrl: 'YOUR_API_GATEWAY_URL',       // From terraform output
  },
  s3: {
    bucket: 'YOUR_S3_BUCKET_NAME',         // From terraform output
  },
};
```

### Step 5: Run Mobile App (2 min)

```bash
# Install dependencies
npm install

# Start development server
npm start

# In another terminal, run on device
npm run ios     # iOS
# OR
npm run android # Android
```

**Expected Output:**
```
Metro waiting on exp://192.168.1.x:19000
› Press a │ open Android
› Press i │ open iOS simulator
```

## Quick Test

### Test 1: Authentication
1. Open app on device
2. Enter phone: `+911234567890`
3. Check CloudWatch for OTP: `aws logs tail /aws/lambda/matrimony-app-dev-auth-register --follow`
4. Enter OTP
5. Should see "Verification in Progress" screen

### Test 2: Approve User (Manual)
```bash
# Connect to database
psql -h $AURORA_ENDPOINT -U dbadmin -d matrimony

# Find user
SELECT user_id, phone_number, account_status FROM users;

# Approve
UPDATE users SET account_status = 'ACTIVE' WHERE phone_number = '+911234567890';
\q
```

### Test 3: Create Profile
1. Restart app
2. Fill Basic Info
3. Fill Community Details (Gotra: "Bhardwaj")
4. Upload photo
5. Submit

### Test 4: Test Matching
```bash
# Create second test user with different Gotra
psql -h $AURORA_ENDPOINT -U dbadmin -d matrimony

INSERT INTO users (phone_number, cognito_sub, account_status) 
VALUES ('+919876543210', 'test-sub-2', 'ACTIVE');

INSERT INTO profiles (user_id, display_name, gender, dob, community_data, is_verified)
VALUES (
  (SELECT user_id FROM users WHERE phone_number = '+919876543210'),
  'Test User 2',
  'FEMALE',
  '1995-01-01',
  '{"gotra": "Kashyap"}',
  true
);
```

Now open Home screen - should see recommendations!

## Troubleshooting

### Issue: Terraform fails with "VPC limit exceeded"
**Solution:** Delete unused VPCs or request limit increase

### Issue: Lambda can't connect to Aurora
**Solution:** Check security group rules in `terraform/vpc.tf`

### Issue: Mobile app shows "Network Error"
**Solution:** Verify API Gateway URL in `mobile/src/config/aws.ts`

### Issue: OTP not received
**Solution:** Check Cognito SMS configuration and SNS permissions

### Issue: Photos won't upload
**Solution:** Verify S3 CORS configuration in `terraform/s3.tf`

## Useful Commands

### View Lambda Logs
```bash
aws logs tail /aws/lambda/matrimony-app-dev-recommendations-get --follow
```

### Check API Gateway
```bash
curl -X GET $(terraform output -raw api_gateway_url)/health
```

### Database Queries
```bash
# User stats
psql -h $AURORA_ENDPOINT -U dbadmin -d matrimony -c \
  "SELECT account_status, COUNT(*) FROM users GROUP BY account_status;"

# Swipe stats
psql -h $AURORA_ENDPOINT -U dbadmin -d matrimony -c \
  "SELECT action, COUNT(*) FROM swipe_history GROUP BY action;"
```

### Destroy Everything
```bash
cd terraform
terraform destroy -auto-approve
```

## Cost Monitoring

```bash
# Check current month costs
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=SERVICE
```

## Next Steps

1. ✅ Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
2. ✅ Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
3. ✅ Check [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for features
4. ✅ Run `./deployment-workflow.sh` to see full workflow
5. ✅ Run `./validate-project.sh` to verify all files

## Support

- **Architecture Questions**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Deployment Issues**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **API Documentation**: See [lambdas/README.md](./lambdas/README.md)
- **Mobile App**: See [mobile/README.md](./mobile/README.md)

---

**Total Setup Time: ~20 minutes**  
**Total Cost: ~$80-150/month for 1000 users**
