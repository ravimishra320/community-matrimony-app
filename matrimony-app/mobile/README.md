# Matrimony App - React Native Mobile

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Update AWS configuration:
   - After deploying Terraform infrastructure, copy the outputs
   - Update `src/config/aws.ts` with your values:
     - `userPoolId`
     - `userPoolClientId`
     - `baseUrl` (API Gateway URL)
     - `bucket` (S3 bucket name)

3. Start the development server:
```bash
npm start
```

4. Run on device/simulator:
```bash
npm run ios     # iOS
npm run android # Android
```

## Project Structure

```
mobile/
├── src/
│   ├── api/              # API client and endpoints
│   ├── config/           # AWS and app configuration
│   ├── navigation/       # React Navigation setup
│   ├── screens/          # Screen components
│   │   ├── auth/         # Login, OTP, Wait screens
│   │   ├── onboarding/   # Profile creation flow
│   │   └── main/         # Home, Matches, Profile
│   ├── services/         # Cognito and other services
│   ├── store/            # Zustand state management
│   └── types/            # TypeScript definitions
├── App.tsx               # Root component
└── package.json
```

## Tech Stack

- React Native (Expo)
- TypeScript
- Zustand (State Management)
- React Navigation v6
- TanStack Query (React Query)
- NativeWind (Tailwind CSS)
- AWS Cognito (Auth)
- Axios (HTTP Client)

## Next Steps

After infrastructure deployment:
1. Update AWS config
2. Test phone authentication flow
3. Implement remaining screens (next phase)
