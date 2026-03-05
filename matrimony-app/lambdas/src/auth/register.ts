import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDbPool } from '../shared/db.js';
import { successResponse, errorResponse } from '../shared/response.js';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const { phoneNumber, cognitoSub } = JSON.parse(event.body || '{}');

    if (!phoneNumber || !cognitoSub) {
      return errorResponse('Phone number and Cognito sub are required');
    }

    const pool = await getDbPool();
    
    const result = await pool.query(
      `INSERT INTO users (phone_number, cognito_sub, account_status, membership_tier)
       VALUES ($1, $2, 'PENDING_VERIFICATION', 'FREE')
       ON CONFLICT (phone_number) DO UPDATE SET cognito_sub = $2
       RETURNING user_id, phone_number, account_status, membership_tier, created_at`,
      [phoneNumber, cognitoSub]
    );

    return successResponse({ user: result.rows[0] }, 201);
  } catch (error: any) {
    console.error('Registration error:', error);
    return errorResponse(error.message || 'Registration failed', 500);
  }
}
