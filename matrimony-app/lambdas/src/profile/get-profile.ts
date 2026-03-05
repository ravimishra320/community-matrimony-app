import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDbPool } from '../shared/db.js';
import { successResponse, errorResponse } from '../shared/response.js';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const cognitoSub = event.requestContext.authorizer?.jwt.claims.sub;
    
    if (!cognitoSub) {
      return errorResponse('Unauthorized', 401);
    }

    const pool = await getDbPool();
    
    const result = await pool.query(
      `SELECT u.user_id, u.phone_number, u.account_status, u.membership_tier,
              p.profile_id, p.display_name, p.gender, p.dob, p.city, p.state, p.country,
              p.height_cm, p.education, p.occupation, p.bio, p.community_data,
              p.preferences, p.photos, p.is_verified, p.profile_completion
       FROM users u
       LEFT JOIN profiles p ON u.user_id = p.user_id
       WHERE u.cognito_sub = $1`,
      [cognitoSub]
    );

    if (result.rows.length === 0) {
      return errorResponse('User not found', 404);
    }

    return successResponse({ profile: result.rows[0] });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return errorResponse(error.message || 'Failed to fetch profile', 500);
  }
}
