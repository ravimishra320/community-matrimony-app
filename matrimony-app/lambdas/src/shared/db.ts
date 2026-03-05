import { Pool } from 'pg';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

let pool: Pool | null = null;

interface DBCredentials {
  username: string;
  password: string;
  host: string;
  port: number;
  dbname: string;
}

export async function getDbPool(): Promise<Pool> {
  if (pool) return pool;

  const secretsClient = new SecretsManagerClient({ region: process.env.AWS_REGION });
  const secretName = process.env.DB_SECRET_NAME!;

  const response = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: secretName })
  );

  const credentials: DBCredentials = JSON.parse(response.SecretString!);

  pool = new Pool({
    host: credentials.host,
    port: credentials.port,
    database: credentials.dbname,
    user: credentials.username,
    password: credentials.password,
    max: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  return pool;
}
