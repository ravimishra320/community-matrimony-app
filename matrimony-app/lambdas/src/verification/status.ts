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
      `SELECT vq.ticket_id, vq.status, vq.admin_notes, vq.created_at, vq.reviewed_at
       FROM verification_queue vq
       JOIN users u ON vq.user_id = u.user_id
       WHERE u.cognito_sub = $1
       ORDER BY vq.created_at DESC
       LIMIT 1`,
      [cognitoSub]
    );

    if (result.rows.length === 0) {
      return successResponse({ status: 'NOT_SUBMITTED' });
    }

    return successResponse({ verification: result.rows[0] });
  } catch (error: any) {
    console.error('Verification status error:', error);
    return errorResponse(error.message || 'Failed to fetch verification status', 500);
  }
}
