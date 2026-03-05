# Matrimony App - Terraform Infrastructure

## Overview
This Terraform configuration provisions the complete AWS serverless infrastructure for the Community-Specific Matrimony App.

## Architecture Components
- **AWS Cognito**: Phone/OTP authentication
- **API Gateway**: HTTP API with JWT authorization
- **Aurora Serverless v2**: PostgreSQL database with auto-scaling
- **AWS Lambda**: Serverless compute (Node.js/TypeScript)
- **S3**: Private storage for photos and ID proofs
- **VPC**: Isolated network for database security

## Prerequisites
- Terraform >= 1.5.0
- AWS CLI configured with appropriate credentials
- AWS account with necessary permissions

## Setup Instructions

1. Copy the example variables file:
```bash
cp terraform.tfvars.example terraform.tfvars
```

2. Edit `terraform.tfvars` with your values:
```hcl
aws_region = "us-east-1"
environment = "dev"
db_master_password = "YourSecurePassword123!"
```

3. Initialize Terraform:
```bash
terraform init
```

4. Review the plan:
```bash
terraform plan
```

5. Apply the configuration:
```bash
terraform apply
```

## Outputs
After successful deployment, note these outputs for mobile app configuration:
- `cognito_user_pool_id`
- `cognito_user_pool_client_id`
- `api_gateway_url`
- `s3_bucket_name`

## Database Schema
After infrastructure is provisioned, connect to Aurora and run:
```sql
-- See ../database/schema.sql
```

## Cost Optimization
- Aurora Serverless v2 scales from 0.5 to 2 ACUs
- Lambda functions are pay-per-invocation
- S3 lifecycle policies delete old versions after 30 days

## Security Notes
- All S3 buckets have public access blocked
- Aurora is in private subnets only
- Cognito uses phone number verification
- API Gateway uses JWT authorization
