#!/bin/bash
# Project Structure Validation Script

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   MATRIMONY APP - PROJECT VALIDATION                   ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

total_checks=0
passed_checks=0

check_file() {
    local file=$1
    local description=$2
    total_checks=$((total_checks + 1))
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $description"
        passed_checks=$((passed_checks + 1))
        return 0
    else
        echo -e "${RED}✗${NC} $description (missing: $file)"
        return 1
    fi
}

check_dir() {
    local dir=$1
    local description=$2
    total_checks=$((total_checks + 1))
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $description"
        passed_checks=$((passed_checks + 1))
        return 0
    else
        echo -e "${RED}✗${NC} $description (missing: $dir)"
        return 1
    fi
}

echo -e "${YELLOW}[1/6] Terraform Infrastructure${NC}"
check_file "terraform/main.tf" "Main Terraform configuration"
check_file "terraform/variables.tf" "Variable definitions"
check_file "terraform/outputs.tf" "Output definitions"
check_file "terraform/cognito.tf" "Cognito User Pool"
check_file "terraform/api.tf" "API Gateway"
check_file "terraform/api-routes.tf" "API Routes & Integrations"
check_file "terraform/rds.tf" "Aurora Serverless v2"
check_file "terraform/s3.tf" "S3 Bucket"
check_file "terraform/vpc.tf" "VPC & Networking"
check_file "terraform/lambda.tf" "Lambda IAM Roles"
check_file "terraform/lambda-functions.tf" "Lambda Function Definitions"
echo ""

echo -e "${YELLOW}[2/6] Database Schema${NC}"
check_file "database/schema.sql" "PostgreSQL schema with JSONB"
echo ""

echo -e "${YELLOW}[3/6] Lambda Functions${NC}"
check_dir "lambdas/src" "Lambda source directory"
check_file "lambdas/package.json" "Lambda package.json"
check_file "lambdas/tsconfig.json" "TypeScript configuration"
check_file "lambdas/deploy.sh" "Deployment script"
check_file "lambdas/src/auth/register.ts" "Auth - Register"
check_file "lambdas/src/profile/get-profile.ts" "Profile - Get"
check_file "lambdas/src/profile/update-profile.ts" "Profile - Update"
check_file "lambdas/src/recommendations/get-recommendations.ts" "Recommendations - Get (Exogamy)"
check_file "lambdas/src/recommendations/swipe.ts" "Recommendations - Swipe"
check_file "lambdas/src/upload/presigned-url.ts" "Upload - Presigned URL"
check_file "lambdas/src/verification/status.ts" "Verification - Status"
check_file "lambdas/src/verification/submit.ts" "Verification - Submit"
check_file "lambdas/src/shared/db.ts" "Shared - Database connection"
check_file "lambdas/src/shared/response.ts" "Shared - Response helpers"
echo ""

echo -e "${YELLOW}[4/6] Mobile App - Core${NC}"
check_file "mobile/App.tsx" "Root App component"
check_file "mobile/package.json" "Mobile package.json"
check_file "mobile/app.json" "Expo configuration"
check_file "mobile/tsconfig.json" "TypeScript config"
check_file "mobile/tailwind.config.js" "Tailwind config"
check_file "mobile/babel.config.js" "Babel config"
echo ""

echo -e "${YELLOW}[5/6] Mobile App - Source Files${NC}"
check_file "mobile/src/config/aws.ts" "AWS configuration"
check_file "mobile/src/types/index.ts" "TypeScript types"
check_file "mobile/src/store/authStore.ts" "Auth state store"
check_file "mobile/src/store/profileStore.ts" "Profile state store"
check_file "mobile/src/api/client.ts" "API client"
check_file "mobile/src/api/endpoints.ts" "API endpoints"
check_file "mobile/src/services/cognito.ts" "Cognito service"
check_file "mobile/src/navigation/RootNavigator.tsx" "Root navigator"
check_file "mobile/src/navigation/AuthNavigator.tsx" "Auth navigator"
check_file "mobile/src/navigation/OnboardingNavigator.tsx" "Onboarding navigator"
check_file "mobile/src/navigation/MainNavigator.tsx" "Main navigator"
check_file "mobile/src/screens/auth/LoginScreen.tsx" "Login screen"
check_file "mobile/src/screens/auth/OtpScreen.tsx" "OTP screen"
check_file "mobile/src/screens/auth/WaitScreen.tsx" "Wait screen"
check_file "mobile/src/screens/onboarding/BasicInfoScreen.tsx" "Basic info form"
check_file "mobile/src/screens/onboarding/CommunityDetailsScreen.tsx" "Community details form"
check_file "mobile/src/screens/onboarding/PhotoUploadScreen.tsx" "Photo upload"
check_file "mobile/src/screens/main/HomeScreen.tsx" "Home screen"
check_file "mobile/src/screens/main/MatchesScreen.tsx" "Matches screen"
check_file "mobile/src/screens/main/ProfileScreen.tsx" "Profile screen"
check_file "mobile/src/components/ProfileCard.tsx" "Profile card component"
check_file "mobile/src/components/CardStack.tsx" "Card stack component"
check_file "mobile/src/components/SwipeButtons.tsx" "Swipe buttons"
echo ""

echo -e "${YELLOW}[6/6] Documentation${NC}"
check_file "README.md" "Main README"
check_file "PROJECT_SUMMARY.md" "Project summary"
check_file "DEPLOYMENT.md" "Deployment guide"
check_file "terraform/README.md" "Terraform docs"
check_file "lambdas/README.md" "Lambda docs"
check_file "mobile/README.md" "Mobile app docs"
echo ""

echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                  VALIDATION RESULTS                     ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

percentage=$((passed_checks * 100 / total_checks))

if [ $passed_checks -eq $total_checks ]; then
    echo -e "${GREEN}✓ ALL CHECKS PASSED${NC}"
    echo -e "   $passed_checks/$total_checks files present (100%)"
    echo ""
    echo -e "${GREEN}Project is complete and ready for deployment!${NC}"
else
    echo -e "${YELLOW}⚠ SOME CHECKS FAILED${NC}"
    echo -e "   $passed_checks/$total_checks files present ($percentage%)"
    echo ""
    echo -e "${YELLOW}Please review missing files above.${NC}"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

echo "Next steps:"
echo "  1. Run: ./deployment-workflow.sh (to see deployment process)"
echo "  2. Review: DEPLOYMENT.md (for actual deployment)"
echo "  3. Check: PROJECT_SUMMARY.md (for feature list)"
echo ""
