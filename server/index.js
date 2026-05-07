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

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/conversations", async (req, res) => {
  try {
    const result = await query(`
      SELECT
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
      FROM conversations
      ORDER BY fecha DESC
    `);

    res.json({ conversations: result.rows.map(formatConversation) });
  } catch (error) {
    handleDatabaseError(res, error);
  }
});

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
  verifyDatabaseConnection();
});
