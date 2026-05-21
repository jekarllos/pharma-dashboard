import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt: true, // Recomendado para Azure/Cloud
    trustServerCertificate: true, // Necessário para desenvolvimento local
  },
  pool: {
    max: 10, // Máximo de conexões simultâneas
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Singleton para o Pool de Conexões
let pool: sql.ConnectionPool | null = null;

export const getConnection = async () => {
  try {
    if (pool) return pool;

    pool = await new sql.ConnectionPool(dbConfig).connect();
    console.log('✅ [DATABASE]: Conectado ao SQL Server com sucesso!');
    return pool;
  } catch (error) {
    console.error('❌ [DATABASE]: Erro ao conectar ao SQL Server:', error);
    throw error;
  }
};

export { sql };