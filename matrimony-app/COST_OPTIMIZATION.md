# Cost Optimization Guide

Complete guide to reducing AWS costs for the Matrimony App.

## Current Cost Breakdown (Zero Users)

```
┌─────────────────────────────────────────────────────────┐
│ Service              │ Monthly Cost │ Can Optimize?    │
├─────────────────────────────────────────────────────────┤
│ Aurora Serverless v2 │ $43-50       │ ✅ Yes (to $0)   │
│ NAT Gateway          │ $32          │ ⚠️ Difficult     │
│ S3 Storage           │ $0.23        │ ❌ Minimal       │
│ CloudWatch Logs      │ $0.50        │ ✅ Yes           │
│ Secrets Manager      │ $0.40        │ ❌ Required      │
│ Lambda (idle)        │ $0           │ ✅ Already free  │
│ API Gateway (idle)   │ $0           │ ✅ Already free  │
│ Cognito (idle)       │ $0           │ ✅ Already free  │
├─────────────────────────────────────────────────────────┤
│ TOTAL                │ ~$76-83      │                  │
└─────────────────────────────────────────────────────────┘
```

## Optimization Options

### 🥇 Option 1: Switch to Aurora v1 (RECOMMENDED)

**Savings: ~$43/month (57% reduction)**

Switch from Aurora Serverless v2 to v1 with auto-pause.

**Before First Deployment:**
```bash
cd matrimony-app/terraform
chmod +x switch-to-v1.sh
./switch-to-v1.sh
```

**Manual Method:**
```bash
cd matrimony-app/terraform
rm rds.tf
mv rds-v1-alternative.tf rds.tf
terraform apply
```

**Result:**
- Idle cost: ~$33/month (down from ~$76)
- Database pauses after 5 minutes of inactivity
- 30-60 second cold start when resuming
- Perfect for development/testing

**Trade-offs:**
- ✅ Huge cost savings
- ✅ Auto-pause when idle
- ⚠️ 30-60s cold start
- ⚠️ PostgreSQL 13.x (not 15.x)

---

### 🥈 Option 2: Reduce CloudWatch Retention

**Savings: ~$0.30/month**

Reduce log retention from 14 days to 3 days:

```hcl
# In terraform/lambda.tf
resource "aws_cloudwatch_log_group" "lambda_logs" {
  retention_in_days = 3  # Changed from 14
}

# In terraform/api.tf
resource "aws_cloudwatch_log_group" "api_logs" {
  retention_in_days = 3  # Changed from 14
}
```

---

### 🥉 Option 3: Use VPC Endpoints (Advanced)

**Savings: ~$32/month (NAT Gateway)**  
**Additional Cost: ~$7/month per endpoint**

Replace NAT Gateway with VPC Endpoints for AWS services.

⚠️ **Not recommended** - Complex setup, minimal net savings.

---

### 🏅 Option 4: Destroy When Not in Use

**Savings: 100% ($76/month)**

For development only - destroy everything when not using:

```bash
# Backup data first
pg_dump -h <endpoint> -U dbadmin matrimony > backup.sql

# Destroy everything
cd matrimony-app/terraform
terraform destroy

# Recreate when needed (~10 min)
terraform apply
psql -h <endpoint> -U dbadmin -d matrimony -f ../database/schema.sql
psql -h <endpoint> -U dbadmin -d matrimony -f backup.sql
```

---

## Cost Comparison Table

| Configuration | Idle Cost | Active (1K users) | Best For |
|--------------|-----------|-------------------|----------|
| **Current (v2)** | $76/month | $150/month | Production |
| **v1 Auto-Pause** | $33/month | $100/month | Development |
| **v1 + Short Logs** | $33/month | $100/month | Dev (optimized) |
| **Destroy/Recreate** | $0 | N/A | Testing only |

## Recommended Strategy

### Development Environment
```
✅ Use Aurora Serverless v1 (auto-pause)
✅ Reduce CloudWatch retention to 3 days
✅ Destroy when not actively developing
───────────────────────────────────────
Cost: $0-33/month
```

### Staging Environment
```
✅ Use Aurora Serverless v1 (auto-pause)
✅ Keep 7-day log retention
✅ Keep running 24/7
───────────────────────────────────────
Cost: $33-50/month
```

### Production Environment
```
✅ Use Aurora Serverless v2 (always-on)
✅ Keep 14-day log retention
✅ Enable backups and monitoring
───────────────────────────────────────
Cost: $76-150/month
```

## Step-by-Step: Implement All Optimizations

### 1. Switch to Aurora v1
```bash
cd matrimony-app/terraform
./switch-to-v1.sh
```

### 2. Reduce Log Retention
Edit `terraform/lambda.tf` and `terraform/api.tf`:
```hcl
retention_in_days = 3  # Changed from 14
```

### 3. Apply Changes
```bash
terraform apply
```

### 4. Verify Savings
```bash
# Check Aurora status (should pause after 5 min)
aws rds describe-db-clusters \
  --db-cluster-identifier matrimony-app-dev-cluster \
  --query 'DBClusters[0].Status'

# Monitor costs
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

## Cost Monitoring

### Set Up Billing Alerts

```bash
# Create SNS topic for alerts
aws sns create-topic --name billing-alerts

# Subscribe your email
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:ACCOUNT_ID:billing-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com

# Create budget alert
aws budgets create-budget \
  --account-id ACCOUNT_ID \
  --budget file://budget.json
```

**budget.json:**
```json
{
  "BudgetName": "matrimony-app-monthly",
  "BudgetLimit": {
    "Amount": "50",
    "Unit": "USD"
  },
  "TimeUnit": "MONTHLY",
  "BudgetType": "COST"
}
```

### View Current Costs

```bash
# This month's costs
aws ce get-cost-and-usage \
  --time-period Start=$(date -d "$(date +%Y-%m-01)" +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=SERVICE

# Forecast next month
aws ce get-cost-forecast \
  --time-period Start=$(date +%Y-%m-%d),End=$(date -d "+30 days" +%Y-%m-%d) \
  --metric BLENDED_COST \
  --granularity MONTHLY
```

## Additional Tips

### 1. Use AWS Free Tier
- Cognito: 50K MAU free
- Lambda: 1M requests/month free
- API Gateway: 1M requests/month free (first 12 months)
- S3: 5GB storage free (first 12 months)

### 2. Right-Size Resources
- Aurora: Start with min capacity, scale up as needed
- Lambda: Use 512MB memory (good balance)
- S3: Enable lifecycle policies

### 3. Clean Up Unused Resources
```bash
# List unused S3 objects
aws s3 ls s3://your-bucket --recursive | \
  awk '{if ($1 < "2024-01-01") print $4}'

# Delete old CloudWatch logs
aws logs describe-log-groups --query 'logGroups[*].logGroupName' | \
  xargs -I {} aws logs delete-log-group --log-group-name {}
```

## Summary

**Quick Wins:**
1. ✅ Switch to Aurora v1: Save $43/month
2. ✅ Reduce log retention: Save $0.30/month
3. ✅ Destroy when idle: Save $76/month

**Total Potential Savings: $43-76/month (57-100%)**

**Recommended for Development:**
- Aurora Serverless v1 with auto-pause
- 3-day log retention
- Destroy on weekends/holidays

**Result: $0-33/month instead of $76/month**
