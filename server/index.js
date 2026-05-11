import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { query, verifyDatabaseConnection } from "./db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);
app.use(express.json());

function formatConversation(row) {
  return {
    ...row,
    duracion_minutos: Math.round(Number(row.duracion_segundos || 0) / 60),
  };
}

function handleDatabaseError(res, error) {
  console.error("[database] Request failed", {
    message: error.message,
    code: error.code,
    hint: "Verify DATABASE_URL, database availability, and that the conversations table exists.",
  });

  res.status(503).json({
    error: "No se pudieron cargar conversaciones desde PostgreSQL.",
    details: error.message,
  });
}

const conversationColumns = `
  fecha,
  duracion_segundos,
  telefono,
  agente,
  deudor,
  sentimiento,
  puntaje,
  interes_pago,
  falta_recursos,
  actitud_deudor,
  actitud_agente
`;

const filterColumns = [
  "fecha",
  "agente",
  "sentimiento",
  "interes_pago",
  "falta_recursos",
  "actitud_deudor",
  "actitud_agente",
];

const optionColumns = filterColumns.filter((column) => column !== "fecha");
const dateFilterPattern = /^\d{4}-\d{2}-\d{2}$/;

function buildConversationFilters(queryParams) {
  const conditions = [];
  const values = [];

  filterColumns.forEach((column) => {
    const rawValue = queryParams[column];
    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;

    if (value === undefined || value === null || String(value).trim() === "") {
      return;
    }

    const normalizedValue = String(value).trim();

    if (column === "fecha") {
      if (!dateFilterPattern.test(normalizedValue)) {
        return;
      }

      values.push(normalizedValue);
      conditions.push(`${column} >= $${values.length}::date AND ${column} < $${values.length}::date + INTERVAL '1 day'`);
      return;
    }

    values.push(normalizedValue);
    conditions.push(`${column}::text = $${values.length}`);
  });

  return {
    whereClause: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    values,
  };
}

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/conversations/filter-options", async (req, res) => {
  try {
    const optionSelects = optionColumns.map(
      (column) => `
        COALESCE(
          jsonb_agg(DISTINCT ${column}::text ORDER BY ${column}::text)
            FILTER (WHERE ${column} IS NOT NULL AND btrim(${column}::text) <> ''),
          '[]'::jsonb
        ) AS ${column}
      `
    );

    const result = await query(`
      SELECT
        ${optionSelects.join(",")}
      FROM conversations
    `);

    res.json(result.rows[0] || {});
  } catch (error) {
    handleDatabaseError(res, error);
  }
});

app.get("/api/conversations", async (req, res) => {
  try {
    const { whereClause, values } = buildConversationFilters(req.query);
    const result = await query(
      `
      SELECT
        ${conversationColumns}
      FROM conversations
      ${whereClause}
      ORDER BY fecha DESC
    `,
      values
    );

    res.json(result.rows.map(formatConversation));
  } catch (error) {
    handleDatabaseError(res, error);
  }
});

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
  verifyDatabaseConnection();
});
