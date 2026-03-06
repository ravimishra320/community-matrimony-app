# Matrimony App - Documentation Index

## 🚀 Getting Started

**New to the project?** Start here:

1. **[README.md](./README.md)** - Project overview and quick introduction
2. **[QUICK_START.md](./QUICK_START.md)** - Deploy in 20 minutes
3. **[deployment-workflow.sh](./deployment-workflow.sh)** - See what deployment looks like (dry run)

## 📖 Core Documentation

### For Deployment
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide with troubleshooting
- **[QUICK_START.md](./QUICK_START.md)** - Fast-track deployment (20 min)
- **[deployment-workflow.sh](./deployment-workflow.sh)** - Visualize deployment process

### For Understanding
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design, diagrams, and data flows
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Complete feature list and status

### For Validation
- **[validate-project.sh](./validate-project.sh)** - Check all 61 files are present

## 🏗️ Component Documentation

### Infrastructure (Terraform)
- **[terraform/README.md](./terraform/README.md)** - Infrastructure setup and configuration
- **[terraform/main.tf](./terraform/main.tf)** - Main Terraform configuration
- **[terraform/variables.tf](./terraform/variables.tf)** - Configurable variables

### Backend (Lambda Functions)
- **[lambdas/README.md](./lambdas/README.md)** - API documentation and Lambda details
- **[lambdas/deploy.sh](./lambdas/deploy.sh)** - Lambda deployment script
- **[lambdas/package.json](./lambdas/package.json)** - Backend dependencies

### Database
- **[database/schema.sql](./database/schema.sql)** - PostgreSQL schema with JSONB

### Mobile App
- **[mobile/README.md](./mobile/README.md)** - Mobile app setup and development
- **[mobile/package.json](./mobile/package.json)** - Frontend dependencies
- **[mobile/App.tsx](./mobile/App.tsx)** - Root component

## 📊 Quick Reference

### File Counts
- **Terraform**: 11 files (Infrastructure as Code)
- **Database**: 1 file (Schema)
- **Lambda**: 14 files (Backend API)
- **Mobile**: 35 files (React Native app)
- **Documentation**: 10 files (Guides and references)
- **Total**: 71 files

### Key Features
✅ Exogamy matching (same Gotra excluded)  
✅ Admin verification workflow  
✅ Photo privacy with S3  
✅ Bumble-style swipe UI  
✅ Phone/OTP authentication  
✅ Progressive onboarding  

### Tech Stack
- **Infrastructure**: Terraform, AWS (Lambda, Aurora, Cognito, S3, API Gateway)
- **Backend**: Node.js, TypeScript, PostgreSQL
- **Frontend**: React Native, Expo, Zustand, TanStack Query, NativeWind

### Costs
~$80-150/month for 1000 active users

## 🎯 Common Tasks

### I want to...

**Deploy the app**
→ Follow [QUICK_START.md](./QUICK_START.md)

**Understand the architecture**
→ Read [ARCHITECTURE.md](./ARCHITECTURE.md)

**See deployment process without deploying**
→ Run `bash deployment-workflow.sh`

**Validate project structure**
→ Run `bash validate-project.sh`

**Troubleshoot deployment issues**
→ Check [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section

**Understand the matching algorithm**
→ See [lambdas/src/recommendations/get-recommendations.ts](./lambdas/src/recommendations/get-recommendations.ts)

**Modify the UI**
→ Check [mobile/src/components/](./mobile/src/components/) and [mobile/src/screens/](./mobile/src/screens/)

**Add a new Lambda function**
→ See [lambdas/README.md](./lambdas/README.md) and [terraform/lambda-functions.tf](./terraform/lambda-functions.tf)

**Change database schema**
→ Edit [database/schema.sql](./database/schema.sql) and run migration

**Configure AWS resources**
→ Edit [terraform/variables.tf](./terraform/variables.tf) and [terraform/*.tf](./terraform/)

## 📁 Directory Structure

```
matrimony-app/
├── README.md                    # Project overview
├── INDEX.md                     # This file
├── QUICK_START.md              # 20-minute deployment
├── DEPLOYMENT.md               # Complete deployment guide
├── ARCHITECTURE.md             # System design
├── PROJECT_SUMMARY.md          # Feature list
├── deployment-workflow.sh      # Deployment visualization
├── validate-project.sh         # Project validation
│
├── terraform/                  # Infrastructure as Code
│   ├── README.md
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── cognito.tf
│   ├── api.tf
│   ├── api-routes.tf
│   ├── rds.tf
│   ├── s3.tf
│   ├── vpc.tf
│   ├── lambda.tf
│   └── lambda-functions.tf
│
├── database/                   # Database schema
│   └── schema.sql
│
├── lambdas/                    # Backend functions
│   ├── README.md
│   ├── package.json
│   ├── tsconfig.json
│   ├── deploy.sh
│   └── src/
│       ├── auth/
│       │   └── register.ts
│       ├── profile/
│       │   ├── get-profile.ts
│       │   └── update-profile.ts
│       ├── recommendations/
│       │   ├── get-recommendations.ts
│       │   └── swipe.ts
│       ├── upload/
│       │   └── presigned-url.ts
│       ├── verification/
│       │   ├── status.ts
│       │   └── submit.ts
│       └── shared/
│           ├── db.ts
│           └── response.ts
│
└── mobile/                     # React Native app
    ├── README.md
    ├── package.json
    ├── app.json
    ├── App.tsx
    └── src/
        ├── api/
        │   ├── client.ts
        │   └── endpoints.ts
        ├── components/
        │   ├── CardStack.tsx
        │   ├── ProfileCard.tsx
        │   └── SwipeButtons.tsx
        ├── config/
        │   └── aws.ts
        ├── navigation/
        │   ├── RootNavigator.tsx
        │   ├── AuthNavigator.tsx
        │   ├── OnboardingNavigator.tsx
        │   └── MainNavigator.tsx
        ├── screens/
        │   ├── auth/
        │   │   ├── LoginScreen.tsx
        │   │   ├── OtpScreen.tsx
        │   │   └── WaitScreen.tsx
        │   ├── onboarding/
        │   │   ├── BasicInfoScreen.tsx
        │   │   ├── CommunityDetailsScreen.tsx
        │   │   └── PhotoUploadScreen.tsx
        │   └── main/
        │       ├── HomeScreen.tsx
        │       ├── MatchesScreen.tsx
        │       └── ProfileScreen.tsx
        ├── services/
        │   └── cognito.ts
        ├── store/
        │   ├── authStore.ts
        │   └── profileStore.ts
        └── types/
            └── index.ts
```

## 🔍 Search by Topic

### Authentication
- [mobile/src/services/cognito.ts](./mobile/src/services/cognito.ts)
- [mobile/src/screens/auth/](./mobile/src/screens/auth/)
- [terraform/cognito.tf](./terraform/cognito.tf)
- [lambdas/src/auth/register.ts](./lambdas/src/auth/register.ts)

### Matching Algorithm
- [lambdas/src/recommendations/get-recommendations.ts](./lambdas/src/recommendations/get-recommendations.ts)
- [lambdas/src/recommendations/swipe.ts](./lambdas/src/recommendations/swipe.ts)
- [database/schema.sql](./database/schema.sql) (swipe_history, connections)

### UI Components
- [mobile/src/components/CardStack.tsx](./mobile/src/components/CardStack.tsx)
- [mobile/src/components/ProfileCard.tsx](./mobile/src/components/ProfileCard.tsx)
- [mobile/src/screens/main/HomeScreen.tsx](./mobile/src/screens/main/HomeScreen.tsx)

### Photo Upload
- [lambdas/src/upload/presigned-url.ts](./lambdas/src/upload/presigned-url.ts)
- [mobile/src/screens/onboarding/PhotoUploadScreen.tsx](./mobile/src/screens/onboarding/PhotoUploadScreen.tsx)
- [terraform/s3.tf](./terraform/s3.tf)

### Verification
- [lambdas/src/verification/](./lambdas/src/verification/)
- [mobile/src/screens/auth/WaitScreen.tsx](./mobile/src/screens/auth/WaitScreen.tsx)
- [database/schema.sql](./database/schema.sql) (verification_queue)

## 📞 Support

### Documentation Issues
If you find any documentation unclear or missing:
1. Check [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
3. Run `bash deployment-workflow.sh` to see the process

### Technical Issues
1. **Infrastructure**: See [terraform/README.md](./terraform/README.md)
2. **Backend**: See [lambdas/README.md](./lambdas/README.md)
3. **Mobile**: See [mobile/README.md](./mobile/README.md)

## ✅ Project Status

**Phase 1 & 2: COMPLETE**
- ✅ All 61 core files created
- ✅ Infrastructure code ready
- ✅ Backend functions implemented
- ✅ Mobile app with UI complete
- ✅ Documentation comprehensive

**Ready for deployment!**

---

**Last Updated**: Phase 2 Complete  
**Total Files**: 71  
**Lines of Code**: ~5,000+  
**Deployment Time**: ~20 minutes  
**Monthly Cost**: ~$80-150 (1000 users)
