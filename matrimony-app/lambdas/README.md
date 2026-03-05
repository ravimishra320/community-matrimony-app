# Lambda Functions

Backend serverless functions for the Matrimony App.

## Structure

```
src/
├── auth/
│   └── register.ts           # User registration
├── profile/
│   ├── get-profile.ts        # Get user profile
│   └── update-profile.ts     # Update profile
├── recommendations/
│   ├── get-recommendations.ts # Exogamy matching algorithm
│   └── swipe.ts              # Handle swipe actions
├── upload/
│   └── presigned-url.ts      # Generate S3 pre-signed URLs
├── verification/
│   ├── status.ts             # Check verification status
│   └── submit.ts             # Submit for verification
└── shared/
    ├── db.ts                 # Database connection pool
    └── response.ts           # Response helpers
```

## Key Features

### Exogamy Matching Algorithm
The `get-recommendations.ts` function implements the core business rule:
- Filters out profiles with the same Gotra
- Only shows verified, active profiles
- Excludes already swiped profiles
- Returns opposite gender matches

### Photo Privacy
Photos are stored in S3 with private access. The frontend receives:
- Only the first photo initially
- `isBlurred: true` flag for privacy
- Full access granted after mutual connection

## Build & Deploy

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Create deployment packages
chmod +x deploy.sh
./deploy.sh

# Deploy with Terraform
cd ../terraform
terraform apply
```

## Environment Variables

Each Lambda requires:
- `DB_SECRET_NAME`: Secrets Manager secret name for DB credentials
- `AWS_REGION`: AWS region
- `S3_BUCKET_NAME`: S3 bucket for uploads (upload function only)

## Database Connection

Lambdas use connection pooling with:
- Max 2 connections per Lambda instance
- 30s idle timeout
- 10s connection timeout
- Credentials from Secrets Manager

## API Endpoints

All endpoints require JWT authorization (except /auth/register):

- `POST /auth/register` - Register new user
- `GET /profile/me` - Get current user profile
- `PUT /profile/me` - Update profile
- `GET /recommendations` - Get match recommendations
- `POST /recommendations/swipe` - Swipe action
- `POST /upload/presigned-url` - Get S3 upload URL
- `GET /verification/status` - Check verification status
- `POST /verification/submit` - Submit for verification
