TRUNCATE TABLE conversations;

INSERT INTO conversations (
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
)
VALUES
('2026-05-01 09:15:00', 482, '+52 55 0101 0101', 'Ana Lopez', 'Carlos Ruiz', 'Positivo', 86, TRUE, FALSE, 'Colaborador', 'Empatica'),
('2026-05-02 11:30:00', 319, '+52 55 0102 0102', 'Luis Garcia', 'Mariana Soto', 'Neutral', 62, FALSE, TRUE, 'Reservada', 'Profesional'),
('2026-05-03 14:05:00', 742, '+52 55 0103 0103', 'Sofia Perez', 'Jorge Medina', 'Negativo', 38, FALSE, TRUE, 'Frustrado', 'Paciente');
