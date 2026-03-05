# Community-Specific Matrimony App

A production-ready, serverless matrimony application with strict Exogamy matching rules, admin verification, and Bumble-style UI.

## 🎯 Project Status: COMPLETE ✅

Both Phase 1 (Infrastructure) and Phase 2 (Backend + UI) are fully implemented and ready for deployment.

## 📋 Quick Links

- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Complete feature list
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Step-by-step deployment guide
- [terraform/README.md](./terraform/README.md) - Infrastructure documentation
- [lambdas/README.md](./lambdas/README.md) - Backend API documentation
- [mobile/README.md](./mobile/README.md) - Mobile app setup

## 🏗️ Architecture

### Backend (AWS Serverless)
- **Auth**: AWS Cognito (Phone/OTP)
- **API**: API Gateway HTTP API with JWT authorization
- **Database**: Aurora Serverless v2 (PostgreSQL with JSONB)
- **Storage**: S3 with pre-signed URLs
- **Compute**: Lambda (Node.js/TypeScript)
- **Infrastructure**: Terraform

### Frontend (React Native)
- **Framework**: Expo (Managed Workflow)
- **State**: Zustand + TanStack Query
- **Navigation**: React Navigation v6
- **Styling**: NativeWind (Tailwind CSS)
- **Forms**: React Hook Form + Zod
- **Animations**: React Native Reanimated

## 🚀 Quick Start

### 1. Deploy Infrastructure
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with secure password
terraform init
terraform apply
# Save outputs
```

### 2. Initialize Database
```bash
psql -h <aurora-endpoint> -U dbadmin -d matrimony -f ../database/schema.sql
```

### 3. Build & Deploy Lambdas
```bash
cd ../lambdas
npm install
npm run build
chmod +x deploy.sh && ./deploy.sh
cd ../terraform && terraform apply
```

### 4. Run Mobile App
```bash
cd ../mobile
npm install
# Update src/config/aws.ts with Terraform outputs
npm start
```

## ✨ Key Features

### Core Business Logic
- ✅ **Exogamy Matching**: Filters out same Gotra (community_data->>'gotra')
- ✅ **Admin Verification**: Users locked until account_status = 'ACTIVE'
- ✅ **Photo Privacy**: Blurred images until mutual connection
- ✅ **One Question Per Screen**: Progressive onboarding flow

### Authentication
- ✅ Phone number + OTP via Cognito
- ✅ JWT-based API authorization
- ✅ Automatic session management
- ✅ Wait screen for pending verification

### Matching System
- ✅ Bumble-style card stack UI
- ✅ Swipe gestures (Pass/Connect)
- ✅ Mutual match detection
- ✅ Recommendation algorithm with filters

### Profile Management
- ✅ Multi-step onboarding with validation
- ✅ JSONB storage for flexible community data
- ✅ Photo upload to S3 with pre-signed URLs
- ✅ ID proof verification workflow

## 📁 Project Structure

```
matrimony-app/
├── terraform/              # AWS Infrastructure
│   ├── main.tf            # Provider configuration
│   ├── cognito.tf         # Phone/OTP auth
│   ├── api.tf             # API Gateway
│   ├── api-routes.tf      # Lambda integrations
│   ├── rds.tf             # Aurora Serverless v2
│   ├── s3.tf              # Photo storage
│   ├── lambda.tf          # IAM roles
│   ├── lambda-functions.tf # Lambda deployments
│   └── vpc.tf             # Network setup
├── database/
│   └── schema.sql         # PostgreSQL schema
├── lambdas/               # Backend Functions
│   ├── src/
│   │   ├── auth/          # Registration
│   │   ├── profile/       # Get/Update profile
│   │   ├── recommendations/ # Matching algorithm
│   │   ├── upload/        # S3 pre-signed URLs
│   │   ├── verification/  # Admin verification
│   │   └── shared/        # DB connection, helpers
│   └── package.json
└── mobile/                # React Native App
    ├── src/
    │   ├── api/           # API client
    │   ├── components/    # ProfileCard, CardStack
    │   ├── config/        # AWS configuration
    │   ├── navigation/    # Auth, Onboarding, Main
    │   ├── screens/       # All app screens
    │   ├── services/      # Cognito service
    │   ├── store/         # Zustand stores
    │   └── types/         # TypeScript definitions
    └── App.tsx
```

## 🎨 UI/UX Design

### Color Palette
- Primary: Royal Gold (#FFD700)
- Background: White/Light Grey (#F5F5F5)
- Text: Dark (#1A1A1A)
- Border Radius: 20px

### Key Screens
1. **Login**: Phone input → OTP verification
2. **Wait Screen**: Verification pending state
3. **Onboarding**: BasicInfo → CommunityDetails → PhotoUpload
4. **Home**: Full-screen card stack with swipe gestures
5. **Matches**: Connection list
6. **Profile**: Edit user details

## 🔒 Security

- S3 buckets block all public access
- Aurora in private VPC subnets
- API Gateway JWT authorization
- Phone verification required
- Pre-signed URLs for temporary S3 access
- Secrets Manager for credentials
- Security groups restrict network access

## 💰 Cost Estimate

For 1000 active users/month:
- Aurora Serverless v2: $50-200
- Lambda: $5-20
- S3: $5-10
- API Gateway: $1-5
- Cognito: Free tier

**Total: ~$80-150/month**

## 📊 Database Schema

Key tables:
- `users`: Cognito integration, account status
- `profiles`: User details with JSONB community_data
- `verification_queue`: Admin verification workflow
- `connections`: Match relationships
- `swipe_history`: Recommendation tracking
- `messages`: Chat (future)

GIN indexes on JSONB for fast Gotra queries.

## 🧪 Testing

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete testing procedures.

Quick test:
```bash
# Test authentication
curl -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+911234567890","cognitoSub":"test-sub"}'

# Test recommendations (requires JWT)
curl -X GET $API_URL/recommendations \
  -H "Authorization: Bearer $JWT_TOKEN"
```

## 📚 API Endpoints

All endpoints require JWT authorization (except /auth/register):

- `POST /auth/register` - Register new user
- `GET /profile/me` - Get current user profile
- `PUT /profile/me` - Update profile
- `GET /recommendations` - Get match recommendations
- `POST /recommendations/swipe` - Swipe action (PASS/CONNECT)
- `POST /upload/presigned-url` - Get S3 upload URL
- `GET /verification/status` - Check verification status
- `POST /verification/submit` - Submit for verification

## 🛠️ Tech Stack

**Infrastructure**: Terraform, AWS (Lambda, API Gateway, Aurora, S3, Cognito)  
**Backend**: Node.js, TypeScript, PostgreSQL  
**Frontend**: React Native, Expo, TypeScript, Zustand, TanStack Query  
**Styling**: NativeWind (Tailwind CSS)  
**Forms**: React Hook Form + Zod  
**Animations**: React Native Reanimated

## 🎉 What's Included

✅ Complete AWS serverless infrastructure  
✅ PostgreSQL schema with JSONB for flexibility  
✅ 8 Lambda functions with business logic  
✅ Exogamy matching algorithm  
✅ Phone/OTP authentication  
✅ Bumble-style swipe UI  
✅ Photo upload with S3  
✅ Admin verification workflow  
✅ Form validation  
✅ State management  
✅ API caching  
✅ Error handling  
✅ Security best practices  

## 📝 Next Steps (Optional Enhancements)

- Admin dashboard for verification queue
- Real-time chat with WebSocket
- Push notifications
- Advanced preference filters
- Payment integration for premium
- Video profiles
- AI-based matching scores
- Multi-language support

## 📖 Documentation

Each directory has its own README with detailed information:
- Infrastructure setup and configuration
- Lambda function documentation
- Mobile app development guide
- Database schema details
- API endpoint specifications

## 🤝 Support

For deployment issues, see [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section.

---

**Built with ❤️ using AWS Serverless + React Native**
