import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDbPool } from '../shared/db.js';
import { successResponse, errorResponse } from '../shared/response.js';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const cognitoSub = event.requestContext.authorizer?.jwt.claims.sub;
    const { idProofKey, selfieKey } = JSON.parse(event.body || '{}');

    if (!cognitoSub || !idProofKey) {
      return errorResponse('ID proof is required');
    }

    const pool = await getDbPool();
    
    const userResult = await pool.query(
      'SELECT user_id FROM users WHERE cognito_sub = $1',
      [cognitoSub]
    );

    if (userResult.rows.length === 0) {
      return errorResponse('User not found', 404);
    }

    const userId = userResult.rows[0].user_id;

    const result = await pool.query(
      `INSERT INTO verification_queue (user_id, id_proof_s3_key, selfie_s3_key, status)
       VALUES ($1, $2, $3, 'PENDING')
       RETURNING ticket_id, status, created_at`,
      [userId, idProofKey, selfieKey || null]
    );

    return successResponse({ 
      ticket: result.rows[0],
      message: 'Verification submitted successfully'
    }, 201);
  } catch (error: any) {
    console.error('Verification submit error:', error);
    return errorResponse(error.message || 'Failed to submit verification', 500);
  }
}
