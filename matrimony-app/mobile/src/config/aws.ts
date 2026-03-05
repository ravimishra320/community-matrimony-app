// AWS Configuration
// Replace these with your Terraform outputs after deployment

export const AWS_CONFIG = {
  region: 'us-east-1',
  cognito: {
    userPoolId: 'YOUR_USER_POOL_ID', // From terraform output
    userPoolClientId: 'YOUR_CLIENT_ID', // From terraform output
  },
  api: {
    baseUrl: 'YOUR_API_GATEWAY_URL', // From terraform output
  },
  s3: {
    bucket: 'YOUR_S3_BUCKET_NAME', // From terraform output
  },
};
