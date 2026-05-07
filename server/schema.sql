CREATE TABLE IF NOT EXISTS conversations (
  fecha TIMESTAMP NOT NULL,
  duracion_segundos INTEGER NOT NULL,
  telefono TEXT,
  agente TEXT,
  deudor TEXT,
  sentimiento TEXT,
  puntaje NUMERIC,
  interes_pago BOOLEAN,
  falta_recursos BOOLEAN,
  actitud_deudor TEXT,
  actitud_agente TEXT
);
