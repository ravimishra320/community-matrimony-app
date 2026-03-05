import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { successResponse, errorResponse } from '../shared/response.js';
import { randomUUID } from 'crypto';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const cognitoSub = event.requestContext.authorizer?.jwt.claims.sub;
    const { fileType, purpose } = JSON.parse(event.body || '{}');

    if (!cognitoSub || !fileType || !purpose) {
      return errorResponse('Missing required fields');
    }

    if (!['PHOTO', 'ID_PROOF'].includes(purpose)) {
      return errorResponse('Invalid purpose');
    }

    const bucketName = process.env.S3_BUCKET_NAME!;
    const fileExtension = fileType.split('/')[1] || 'jpg';
    const key = `${purpose.toLowerCase()}/${cognitoSub}/${randomUUID()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    return successResponse({ 
      uploadUrl, 
      key,
      expiresIn: 300 
    });
  } catch (error: any) {
    console.error('Presigned URL error:', error);
    return errorResponse(error.message || 'Failed to generate upload URL', 500);
  }
}
