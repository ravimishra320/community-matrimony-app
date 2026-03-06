# Matrimony App - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          MOBILE APP (React Native)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   Auth Flow  │  │  Onboarding  │  │  Main Tabs   │                  │
│  │  Login→OTP   │  │  Profile     │  │  Home/Match  │                  │
│  │  →Wait       │  │  Creation    │  │  /Profile    │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│         │                  │                  │                          │
│         └──────────────────┴──────────────────┘                          │
│                            │                                             │
│                    ┌───────▼────────┐                                    │
│                    │  Zustand Store │                                    │
│                    │  + React Query │                                    │
│                    └───────┬────────┘                                    │
└────────────────────────────┼──────────────────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │   Axios Client   │
                    │  (JWT Headers)   │
                    └────────┬─────────┘
                             │
┌────────────────────────────┼──────────────────────────────────────────────┐
│                            │         AWS CLOUD                            │
│                            │                                              │
│                    ┌───────▼────────┐                                     │
│                    │  AWS Cognito   │                                     │
│                    │  Phone/OTP     │                                     │
│                    │  JWT Tokens    │                                     │
│                    └───────┬────────┘                                     │
│                            │                                              │
│                    ┌───────▼────────┐                                     │
│                    │  API Gateway   │                                     │
│                    │  HTTP API      │                                     │
│                    │  JWT Authorizer│                                     │
│                    └───────┬────────┘                                     │
│                            │                                              │
│         ┌──────────────────┼──────────────────┐                          │
│         │                  │                  │                          │
│    ┌────▼─────┐      ┌────▼─────┐      ┌────▼─────┐                    │
│    │ Lambda   │      │ Lambda   │      │ Lambda   │                    │
│    │ Auth     │      │ Profile  │      │ Recommend│                    │
│    │ Register │      │ Get/Put  │      │ Get/Swipe│                    │
│    └────┬─────┘      └────┬─────┘      └────┬─────┘                    │
│         │                  │                  │                          │
│         │         ┌────────┴──────────┐       │                          │
│         │         │                   │       │                          │
│    ┌────▼─────┐   │   ┌───────▼───────▼───────▼──┐                      │
│    │ Lambda   │   │   │   Aurora Serverless v2   │                      │
│    │ Upload   │   │   │   PostgreSQL             │                      │
│    │ Presigned│   │   │   ┌──────────────────┐   │                      │
│    └────┬─────┘   │   │   │ users            │   │                      │
│         │         │   │   │ profiles (JSONB) │   │                      │
│    ┌────▼─────┐   │   │   │ verification_q   │   │                      │
│    │   S3     │   │   │   │ connections      │   │                      │
│    │  Bucket  │   │   │   │ swipe_history    │   │                      │
│    │  Photos  │   │   │   │ messages         │   │                      │
│    │  ID Proof│   │   │   └──────────────────┘   │                      │
│    └──────────┘   │   └──────────────────────────┘                      │
│                   │              │                                       │
│              ┌────▼──────┐  ┌────▼────────┐                             │
│              │ Lambda    │  │  Secrets    │                             │
│              │ Verify    │  │  Manager    │                             │
│              │ Status    │  │  DB Creds   │                             │
│              └───────────┘  └─────────────┘                             │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                    VPC (10.0.0.0/16)                            │    │
│  │  ┌──────────────┐              ┌──────────────┐                │    │
│  │  │ Private      │              │ Public       │                │    │
│  │  │ Subnets      │              │ Subnets      │                │    │
│  │  │ (Aurora)     │              │ (NAT GW)     │                │    │
│  │  └──────────────┘              └──────────────┘                │    │
│  └────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Authentication Flow
```
User → Mobile App → Cognito (Phone/OTP)
                  ↓
            JWT Token Generated
                  ↓
     Stored in Zustand + SecureStore
                  ↓
     Used in API requests (Authorization header)
```

### 2. Profile Creation Flow
```
User fills form → Mobile App validates (Zod)
                       ↓
              API Gateway (JWT check)
                       ↓
              Lambda: update-profile
                       ↓
              Aurora: INSERT/UPDATE profiles
                       ↓
              Return updated profile
```

### 3. Photo Upload Flow
```
User selects photo → Lambda: presigned-url
                            ↓
                    Generate S3 pre-signed URL
                            ↓
                    Mobile uploads directly to S3
                            ↓
                    Lambda: update-profile (save S3 key)
                            ↓
                    Aurora: UPDATE profiles.photos
```

### 4. Matching Algorithm (Exogamy Rule)
```
User opens Home → Lambda: get-recommendations
                        ↓
                  Query Aurora with filters:
                  - account_status = 'ACTIVE'
                  - is_verified = true
                  - gender = opposite
                  - community_data->>'gotra' != current_user_gotra
                  - NOT IN swipe_history
                        ↓
                  Return 10 profiles (randomized)
                        ↓
                  Mobile displays in CardStack
```

### 5. Swipe Flow
```
User swipes → Lambda: swipe
                   ↓
         INSERT INTO swipe_history
                   ↓
         IF action = 'CONNECT':
           INSERT INTO connections
           CHECK for mutual match
           IF mutual:
             UPDATE connections.status = 'ACCEPTED'
             RETURN { isMatch: true }
```

## Security Layers

### Layer 1: Network
- VPC with private subnets for Aurora
- Security groups restrict access
- NAT Gateway for Lambda internet access

### Layer 2: Authentication
- Cognito phone verification
- JWT tokens with expiration
- API Gateway JWT authorizer

### Layer 3: Authorization
- Lambda checks user permissions
- Row-level security via user_id
- S3 pre-signed URLs (5 min expiration)

### Layer 4: Data
- Aurora encryption at rest
- S3 encryption (AES256)
- Secrets Manager for credentials
- No public S3 access

## Scalability

### Auto-Scaling Components
1. **Aurora Serverless v2**: 0.5 → 2 ACUs
2. **Lambda**: Concurrent executions (up to 1000)
3. **API Gateway**: Unlimited requests
4. **S3**: Unlimited storage

### Performance Optimizations
1. **Database**:
   - GIN indexes on JSONB columns
   - Connection pooling in Lambda
   - Read replicas (Aurora reader endpoint)

2. **API**:
   - React Query caching (5 min stale time)
   - Zustand for local state
   - Optimistic updates

3. **Mobile**:
   - Image lazy loading
   - Pagination for recommendations
   - Gesture-based interactions

## Cost Breakdown

### Fixed Costs (per month)
- Aurora minimum: ~$50 (0.5 ACU × 730 hours)
- NAT Gateway: ~$32

### Variable Costs (1000 active users)
- Lambda invocations: ~$5-10
- API Gateway: ~$1-3
- S3 storage (10GB): ~$0.23
- S3 requests: ~$1-2
- Data transfer: ~$5-10

**Total: $80-150/month**

## Monitoring & Logging

### CloudWatch Logs
- `/aws/lambda/<function-name>` - Lambda execution logs
- `/aws/apigateway/<api-name>` - API Gateway access logs

### Metrics to Monitor
- Lambda duration & errors
- API Gateway 4xx/5xx errors
- Aurora CPU & connections
- S3 request rate

### Alarms (Production)
- Lambda error rate > 5%
- API Gateway latency > 2s
- Aurora CPU > 80%
- Failed authentication attempts > 100/min

## Disaster Recovery

### Backup Strategy
- Aurora: Automated backups (7 days retention)
- S3: Versioning enabled (30 day lifecycle)
- Terraform state: Remote backend (S3)

### Recovery Procedures
1. **Database**: Restore from automated backup
2. **Infrastructure**: `terraform apply` from state
3. **Lambda**: Redeploy from CI/CD
4. **S3**: Restore from version history

## Development Workflow

```
Developer → Git Push → CI/CD Pipeline
                            ↓
                    Run Tests
                            ↓
                    Build Lambdas
                            ↓
                    Terraform Plan
                            ↓
                    Manual Approval
                            ↓
                    Terraform Apply
                            ↓
                    Deploy to AWS
```

## Key Design Decisions

### 1. Why Aurora Serverless v2?
- Auto-scaling based on load
- Pay only for what you use
- PostgreSQL compatibility
- JSONB for flexible schema

### 2. Why Lambda over ECS/EC2?
- No server management
- Auto-scaling built-in
- Pay per invocation
- Perfect for API workloads

### 3. Why JSONB for community_data?
- Flexible schema for different communities
- Fast queries with GIN indexes
- No schema migrations needed
- Easy to add new fields

### 4. Why Cognito?
- Built-in phone/OTP support
- JWT token generation
- User management
- Integrates with API Gateway

### 5. Why React Native + Expo?
- Single codebase for iOS/Android
- Fast development
- OTA updates
- Rich ecosystem

## Future Enhancements

### Phase 3 (Optional)
1. **Real-time Chat**: WebSocket API + DynamoDB
2. **Push Notifications**: SNS + FCM/APNS
3. **Admin Dashboard**: React web app
4. **Analytics**: Kinesis + QuickSight
5. **CDN**: CloudFront for photos
6. **Search**: OpenSearch for advanced filters
7. **ML Matching**: SageMaker for compatibility scores
8. **Video Profiles**: MediaConvert + CloudFront
