# Switch to Aurora Serverless v1 (Cost Savings)

This guide shows how to switch from Aurora Serverless v2 to v1 to reduce idle costs from ~$76/month to ~$33/month.

## Cost Comparison

| Configuration | Idle Cost | Active Cost | Cold Start |
|--------------|-----------|-------------|------------|
| Aurora v2 (current) | ~$76/month | ~$76-150/month | Instant |
| Aurora v1 (auto-pause) | ~$33/month | ~$33-100/month | 30-60 seconds |

**Savings: ~$43/month when idle**

## Prerequisites

⚠️ **IMPORTANT:** This will destroy and recreate your database. Backup any data first!

```bash
# If you have existing data, backup first
pg_dump -h <aurora-endpoint> -U dbadmin matrimony > backup.sql
```

## Step-by-Step Migration

### Option A: Before First Deployment (Recommended)

If you haven't deployed yet, simply replace the RDS configuration:

```bash
cd matrimony-app/terraform

# Remove the v2 configuration
rm rds.tf

# Rename v1 alternative to be the active config
mv rds-v1-alternative.tf rds.tf

# Deploy as normal
terraform init
terraform apply
```

### Option B: After Deployment (Requires Destroy/Recreate)

If you've already deployed with v2:

```bash
cd matrimony-app/terraform

# 1. Backup your data (if any)
AURORA_ENDPOINT=$(terraform output -raw aurora_cluster_endpoint)
pg_dump -h $AURORA_ENDPOINT -U dbadmin matrimony > backup.sql

# 2. Destroy only the RDS resources
terraform destroy -target=aws_rds_cluster.main -target=aws_rds_cluster_instance.main

# 3. Replace the configuration
mv rds.tf rds-v2.tf.backup
mv rds-v1-alternative.tf rds.tf

# 4. Apply the new configuration
terraform apply

# 5. Restore your data (if any)
NEW_ENDPOINT=$(terraform output -raw aurora_cluster_endpoint)
psql -h $NEW_ENDPOINT -U dbadmin -d matrimony -f ../database/schema.sql
psql -h $NEW_ENDPOINT -U dbadmin -d matrimony -f backup.sql
```

## What Changes

### Technical Differences

**Aurora Serverless v2 (Current):**
```hcl
engine_mode             = "provisioned"
engine_version          = "15.4"

serverlessv2_scaling_configuration {
  max_capacity = 2.0
  min_capacity = 0.5  # Never goes to 0
}

# Requires cluster instance
resource "aws_rds_cluster_instance" "main" {
  instance_class = "db.serverless"
}
```

**Aurora Serverless v1 (New):**
```hcl
engine_mode    = "serverless"
engine_version = "13.12"  # v1 max is 13.x

scaling_configuration {
  auto_pause               = true
  seconds_until_auto_pause = 300  # Pauses after 5 min
  min_capacity             = 2
  max_capacity             = 4
}

# No cluster instance needed
```

### Behavioral Differences

| Feature | v2 | v1 |
|---------|----|----|
| Minimum cost when idle | $43/month | $0 |
| Auto-pause | ❌ No | ✅ Yes (after 5 min) |
| Cold start time | Instant | 30-60 seconds |
| PostgreSQL version | 15.4 | 13.12 |
| HTTP Data API | ✅ Yes | ❌ No |
| Performance | More predictable | Less predictable |

## Testing the Auto-Pause

After deployment, test that auto-pause works:

```bash
# 1. Connect to database
psql -h <endpoint> -U dbadmin -d matrimony

# 2. Run a query
SELECT NOW();

# 3. Disconnect and wait 5 minutes

# 4. Check cluster status
aws rds describe-db-clusters \
  --db-cluster-identifier matrimony-app-dev-cluster \
  --query 'DBClusters[0].Status'

# Should show "available" when active, or paused after 5 min

# 5. Connect again (will take 30-60 seconds to resume)
psql -h <endpoint> -U dbadmin -d matrimony
```

## Reverting Back to v2

If you need to switch back:

```bash
cd matrimony-app/terraform

# Backup data
pg_dump -h <endpoint> -U dbadmin matrimony > backup.sql

# Destroy v1
terraform destroy -target=aws_rds_cluster.main

# Restore v2 config
mv rds.tf rds-v1.tf.backup
mv rds-v2.tf.backup rds.tf

# Apply v2
terraform apply

# Restore data
psql -h <new-endpoint> -U dbadmin -d matrimony -f ../database/schema.sql
psql -h <new-endpoint> -U dbadmin -d matrimony -f backup.sql
```

## Recommendations

### Use v1 (Auto-Pause) For:
- ✅ Development environments
- ✅ Testing/staging
- ✅ Low-traffic applications
- ✅ Cost-sensitive projects
- ✅ Apps with predictable usage patterns

### Use v2 (Always-On) For:
- ✅ Production with consistent traffic
- ✅ Apps requiring instant response
- ✅ High-performance requirements
- ✅ Latest PostgreSQL features
- ✅ When cost is not primary concern

## Troubleshooting

### Issue: "Cold start is too slow"
**Solution:** Increase `seconds_until_auto_pause` to 600 (10 min) or 1800 (30 min)

```hcl
scaling_configuration {
  seconds_until_auto_pause = 1800  # 30 minutes
}
```

### Issue: "Database keeps pausing during development"
**Solution:** Keep a connection open or increase pause timeout

```bash
# Keep connection alive
while true; do
  psql -h <endpoint> -U dbadmin -d matrimony -c "SELECT 1" > /dev/null 2>&1
  sleep 240  # Every 4 minutes
done
```

### Issue: "Need PostgreSQL 15 features"
**Solution:** Stay with v2. v1 only supports up to PostgreSQL 13.x

## Cost Monitoring

After switching, monitor your costs:

```bash
# Check current month costs
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=SERVICE \
  --filter file://filter.json

# filter.json
{
  "Dimensions": {
    "Key": "SERVICE",
    "Values": ["Amazon Relational Database Service"]
  }
}
```

## Summary

**Before (v2):**
- Idle cost: ~$76/month
- Always ready
- Best for production

**After (v1):**
- Idle cost: ~$33/month
- 30-60s cold start
- Best for development

**Savings: ~$43/month (~57% reduction)**
