import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;
const databaseUrl = process.env.DATABASE_URL?.trim();

export const isDatabaseConfigured = Boolean(databaseUrl);

export const pool = isDatabaseConfigured
  ? new Pool({
      connectionString: databaseUrl,
    })
  : null;

export async function query(sql, params = []) {
  if (!pool) {
    throw new Error("DATABASE_URL is not configured");
  }

  const result = await pool.query(sql, params);
  return result;
}
