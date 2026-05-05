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

if (pool) {
  pool.on("error", (error) => {
    console.error("[database] Unexpected idle PostgreSQL client error", {
      message: error.message,
      code: error.code,
    });
  });
}

export async function query(sql, params = []) {
  if (!pool) {
    throw new Error("DATABASE_URL is not configured");
  }

  const result = await pool.query(sql, params);
  return result;
}

export async function verifyDatabaseConnection() {
  if (!pool) {
    console.warn("[database] DATABASE_URL is not configured. Local mock data will be used for read-only calls.");
    return;
  }

  try {
    await pool.query("SELECT 1");
    console.log("[database] PostgreSQL connection verified");
  } catch (error) {
    console.error("[database] PostgreSQL connection failed", {
      message: error.message,
      code: error.code,
      hint: "Verify DATABASE_URL, network access, database credentials, and that the schema has been applied.",
    });
  }
}
