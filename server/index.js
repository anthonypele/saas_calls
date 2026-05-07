import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { isDatabaseConfigured, query, verifyDatabaseConnection } from "./db.js";
import { mockCalls } from "./mockCalls.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);
app.use(express.json());

function formatCall(row) {
  return {
    ...row,
    duration_minutes: Math.round(row.duration_seconds / 60),
  };
}

function handleDatabaseError(res, error) {
  console.error("[database] Request failed", {
    message: error.message,
    code: error.code,
    hint: "Verify DATABASE_URL, database availability, and that server/schema.sql has been applied.",
  });

  res.status(503).json({
    error: "Database is unavailable. Check server logs for PostgreSQL connection details.",
  });
}

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/calls", async (req, res) => {
  if (!isDatabaseConfigured) {
    return res.json({ calls: mockCalls });
  }

  try {
    const result = await query("SELECT * FROM calls ORDER BY call_date DESC");
    res.json({ calls: result.rows.map(formatCall) });
  } catch (error) {
    handleDatabaseError(res, error);
  }
});

app.post("/api/calls", async (req, res) => {
  if (!isDatabaseConfigured) {
    return handleDatabaseError(res, new Error("Missing DATABASE_URL"));
  }

  const {
    customer_name,
    phone_number,
    call_date,
    duration_seconds,
    sentiment,
    status,
    summary,
    next_step,
  } = req.body;

  if (!customer_name || !phone_number || !call_date || !summary || !next_step) {
    return res.status(400).json({ error: "Please fill in all required fields" });
  }

  try {
    const result = await query(
      `
        INSERT INTO calls (
          customer_name,
          phone_number,
          call_date,
          duration_seconds,
          sentiment,
          status,
          summary,
          next_step
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `,
      [
        customer_name,
        phone_number,
        call_date,
        Number(duration_seconds || 0),
        sentiment || "Neutral",
        status || "New",
        summary,
        next_step,
      ]
    );

    res.status(201).json({ call: formatCall(result.rows[0]) });
  } catch (error) {
    handleDatabaseError(res, error);
  }
});

app.get("/api/calls/:id", async (req, res) => {
  if (!isDatabaseConfigured) {
    const call = mockCalls.find((item) => item.id === Number(req.params.id));

    if (!call) {
      return res.status(404).json({ error: "Call not found" });
    }

    return res.json({ call });
  }

  try {
    const result = await query("SELECT * FROM calls WHERE id = $1", [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Call not found" });
    }

    res.json({ call: formatCall(result.rows[0]) });
  } catch (error) {
    handleDatabaseError(res, error);
  }
});

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
  verifyDatabaseConnection();
});
