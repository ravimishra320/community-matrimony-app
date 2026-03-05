import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDbPool } from '../shared/db.js';
import { successResponse, errorResponse } from '../shared/response.js';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const cognitoSub = event.requestContext.authorizer?.jwt.claims.sub;
    const limit = parseInt(event.queryStringParameters?.limit || '10');

    if (!cognitoSub) {
      return errorResponse('Unauthorized', 401);
    }

    const pool = await getDbPool();
    
    // Get current user's profile
    const userResult = await pool.query(
      `SELECT u.user_id, p.gender, p.community_data, p.preferences
       FROM users u
       JOIN profiles p ON u.user_id = p.user_id
       WHERE u.cognito_sub = $1 AND u.account_status = 'ACTIVE'`,
      [cognitoSub]
    );

    if (userResult.rows.length === 0) {
      return errorResponse('User profile not found or not verified', 403);
    }

    const currentUser = userResult.rows[0];
    const currentGotra = currentUser.community_data?.gotra;

    if (!currentGotra) {
      return errorResponse('Gotra information required', 400);
    }

    // EXOGAMY MATCHING ALGORITHM
    // Exclude: same gotra, already swiped, opposite gender
    const oppositeGender = currentUser.gender === 'MALE' ? 'FEMALE' : 'MALE';

    const query = `
      SELECT 
        p.profile_id, p.user_id, p.display_name, p.gender, p.dob,
        p.city, p.state, p.height_cm, p.education, p.occupation,
        p.bio, p.community_data, p.photos, p.is_verified,
        EXTRACT(YEAR FROM AGE(p.dob)) as age
      FROM profiles p
      JOIN users u ON p.user_id = u.user_id
      WHERE u.account_status = 'ACTIVE'
        AND p.is_verified = true
        AND p.gender = $1
        AND p.user_id != $2
        AND p.community_data->>'gotra' != $3
        AND p.user_id NOT IN (
          SELECT target_user_id FROM swipe_history WHERE user_id = $2
        )
      ORDER BY RANDOM()
      LIMIT $4
    `;

    const recommendations = await pool.query(query, [
      oppositeGender,
      currentUser.user_id,
      currentGotra,
      limit
    ]);

    // Blur photos for privacy (return only first photo, blurred flag)
    const profiles = recommendations.rows.map(profile => ({
      ...profile,
      photos: profile.photos?.length > 0 ? [profile.photos[0]] : [],
      isBlurred: true, // Frontend will apply blur
    }));

    return successResponse({ recommendations: profiles });
  } catch (error: any) {
    console.error('Get recommendations error:', error);
    return errorResponse(error.message || 'Failed to fetch recommendations', 500);
  }
}
