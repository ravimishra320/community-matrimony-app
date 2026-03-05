# Deployment Guide

Complete deployment instructions for the Matrimony App.

## Prerequisites

- AWS Account with appropriate permissions
- Terraform >= 1.5.0
- Node.js >= 18.x
- PostgreSQL client (psql)
- Expo CLI

## Step 1: Deploy Infrastructure

```bash
cd terraform

# Copy and configure variables
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars
# Set secure db_master_password
# Configure aws_region and environment

# Initialize Terraform
terraform init

# Review plan
terraform plan

# Deploy infrastructure
terraform apply

# Save outputs
terraform output > ../outputs.txt
```

## Step 2: Initialize Database

```bash
# Get Aurora endpoint from outputs
AURORA_ENDPOINT=$(terraform output -raw aurora_cluster_endpoint)

# Connect and run schema
psql -h $AURORA_ENDPOINT -U dbadmin -d matrimony -f ../database/schema.sql

# Verify tables
psql -h $AURORA_ENDPOINT -U dbadmin -d matrimony -c "\dt"
```

## Step 3: Build & Deploy Lambda Functions

```bash
cd ../lambdas

# Install dependencies
npm install

# Build TypeScript
npm run build

# Create deployment packages
chmod +x deploy.sh
./deploy.sh

# Deploy Lambdas with Terraform
cd ../terraform
terraform apply
```

## Step 4: Configure Mobile App

```bash
cd ../mobile

# Install dependencies
npm install

# Update AWS configuration
# Edit src/config/aws.ts with Terraform outputs:
# - userPoolId
# - userPoolClientId
# - baseUrl (API Gateway URL)
# - bucket (S3 bucket name)

# Start development server
npm start

# Run on device
npm run ios     # iOS
npm run android # Android
```

## Step 5: Test the Application

### Test Authentication Flow
1. Open app on device/simulator
2. Enter phone number
3. Check CloudWatch logs for OTP (dev only)
4. Verify OTP
5. Should see Wait Screen

### Test Admin Verification (Manual)
```sql
-- Connect to Aurora
psql -h $AURORA_ENDPOINT -U dbadmin -d matrimony

-- Approve verification
UPDATE verification_queue 
SET status = 'APPROVED', reviewed_at = NOW() 
WHERE user_id = '<user_id>';

-- Activate user account
UPDATE users 
SET account_status = 'ACTIVE' 
WHERE user_id = '<user_id>';
```

### Test Matching Algorithm
1. Create multiple test profiles with different Gotras
2. Mark profiles as verified
3. Test swipe functionality
4. Verify Exogamy rule (same Gotra excluded)

## Monitoring

### CloudWatch Logs
```bash
# View Lambda logs
aws logs tail /aws/lambda/matrimony-app-dev-recommendations-get --follow

# View API Gateway logs
aws logs tail /aws/apigateway/matrimony-app-dev --follow
```

### Database Queries
```sql
-- Check user counts
SELECT account_status, COUNT(*) FROM users GROUP BY account_status;

-- Check verification queue
SELECT status, COUNT(*) FROM verification_queue GROUP BY status;

-- Check swipe activity
SELECT action, COUNT(*) FROM swipe_history GROUP BY action;
```

## Production Checklist

- [ ] Change Aurora `skip_final_snapshot` to false
- [ ] Restrict S3 CORS to app domain
- [ ] Restrict API Gateway CORS
- [ ] Enable CloudWatch alarms
- [ ] Set up backup retention
- [ ] Configure custom domain for API
- [ ] Enable WAF for API Gateway
- [ ] Review IAM policies (least privilege)
- [ ] Enable VPC Flow Logs
- [ ] Set up monitoring dashboard
- [ ] Configure SNS for admin notifications
- [ ] Test disaster recovery procedures

## Cost Optimization

- Aurora Serverless v2: Scales 0.5-2 ACUs (~$50-200/month)
- Lambda: Pay per invocation (~$5-20/month for 100K requests)
- S3: Pay per storage + requests (~$5-10/month for 10GB)
- API Gateway: $1 per million requests
- Cognito: Free tier covers 50K MAU

Estimated monthly cost for 1000 active users: $80-150

## Troubleshooting

### Lambda can't connect to Aurora
- Check security group rules
- Verify Lambda is in correct VPC subnets
- Check NAT Gateway for internet access

### Cognito OTP not sending
- Verify SNS permissions in Cognito SMS role
- Check phone number format (+country code)
- Review CloudWatch logs

### S3 upload fails
- Verify CORS configuration
- Check pre-signed URL expiration
- Verify IAM permissions for Lambda

### Recommendations return empty
- Verify users have `account_status = 'ACTIVE'`
- Check profiles have `is_verified = true`
- Ensure Gotra is set in community_data
- Check swipe_history for already swiped profiles
