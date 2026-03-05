import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDbPool } from '../shared/db.js';
import { successResponse, errorResponse } from '../shared/response.js';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const cognitoSub = event.requestContext.authorizer?.jwt.claims.sub;
    const { targetUserId, action } = JSON.parse(event.body || '{}');

    if (!cognitoSub || !targetUserId || !action) {
      return errorResponse('Missing required fields');
    }

    if (!['PASS', 'CONNECT'].includes(action)) {
      return errorResponse('Invalid action');
    }

    const pool = await getDbPool();
    
    // Get current user
    const userResult = await pool.query(
      'SELECT user_id FROM users WHERE cognito_sub = $1',
      [cognitoSub]
    );

    if (userResult.rows.length === 0) {
      return errorResponse('User not found', 404);
    }

    const userId = userResult.rows[0].user_id;

    // Record swipe
    await pool.query(
      `INSERT INTO swipe_history (user_id, target_user_id, action)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, target_user_id) DO UPDATE SET action = $3`,
      [userId, targetUserId, action]
    );

    let isMatch = false;

    // If CONNECT, create connection and check for mutual match
    if (action === 'CONNECT') {
      await pool.query(
        `INSERT INTO connections (initiator_id, receiver_id, status)
         VALUES ($1, $2, 'PENDING')
         ON CONFLICT (initiator_id, receiver_id) DO NOTHING`,
        [userId, targetUserId]
      );

      // Check if target user also swiped CONNECT
      const mutualCheck = await pool.query(
        `SELECT 1 FROM swipe_history
         WHERE user_id = $1 AND target_user_id = $2 AND action = 'CONNECT'`,
        [targetUserId, userId]
      );

      if (mutualCheck.rows.length > 0) {
        isMatch = true;
        // Update both connections to ACCEPTED
        await pool.query(
          `UPDATE connections SET status = 'ACCEPTED'
           WHERE (initiator_id = $1 AND receiver_id = $2)
              OR (initiator_id = $2 AND receiver_id = $1)`,
          [userId, targetUserId]
        );
      }
    }

    return successResponse({ 
      success: true, 
      isMatch,
      message: isMatch ? "It's a match!" : 'Swipe recorded'
    });
  } catch (error: any) {
    console.error('Swipe error:', error);
    return errorResponse(error.message || 'Failed to process swipe', 500);
  }
}
