import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDbPool } from '../shared/db.js';
import { successResponse, errorResponse } from '../shared/response.js';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const cognitoSub = event.requestContext.authorizer?.jwt.claims.sub;
    const body = JSON.parse(event.body || '{}');

    if (!cognitoSub) {
      return errorResponse('Unauthorized', 401);
    }

    const pool = await getDbPool();
    
    // Get user_id
    const userResult = await pool.query(
      'SELECT user_id FROM users WHERE cognito_sub = $1',
      [cognitoSub]
    );

    if (userResult.rows.length === 0) {
      return errorResponse('User not found', 404);
    }

    const userId = userResult.rows[0].user_id;

    // Build update query dynamically
    const fields = [];
    const values = [userId];
    let paramCount = 2;

    if (body.displayName) {
      fields.push(`display_name = $${paramCount++}`);
      values.push(body.displayName);
    }
    if (body.gender) {
      fields.push(`gender = $${paramCount++}`);
      values.push(body.gender);
    }
    if (body.dob) {
      fields.push(`dob = $${paramCount++}`);
      values.push(body.dob);
    }
    if (body.city) {
      fields.push(`city = $${paramCount++}`);
      values.push(body.city);
    }
    if (body.communityData) {
      fields.push(`community_data = $${paramCount++}`);
      values.push(JSON.stringify(body.communityData));
    }
    if (body.preferences) {
      fields.push(`preferences = $${paramCount++}`);
      values.push(JSON.stringify(body.preferences));
    }

    const query = `
      INSERT INTO profiles (user_id, display_name, gender, dob, city, community_data, preferences)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id) DO UPDATE SET ${fields.join(', ')}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return successResponse({ profile: result.rows[0] });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return errorResponse(error.message || 'Failed to update profile', 500);
  }
}
