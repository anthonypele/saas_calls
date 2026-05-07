import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { formatDate, formatDuration, formatValue } from "../utils.js";

const columns = [
  { key: "fecha", label: "Fecha", sortable: true, type: "date" },
  { key: "duracion_segundos", label: "Duración", sortable: true, type: "duration" },
  { key: "telefono", label: "Teléfono" },
  { key: "agente", label: "Agente" },
  { key: "deudor", label: "Deudor" },
  { key: "sentimiento", label: "Sentimiento", type: "sentiment" },
  { key: "puntaje", label: "Puntaje", sortable: true, type: "number" },
  { key: "interes_pago", label: "Interés en Pago" },
  { key: "falta_recursos", label: "Falta de recursos" },
  { key: "actitud_deudor", label: "Actitud del Deudor" },
  { key: "actitud_agente", label: "Actitud del Agente" },
];

function sentimentClass(value) {
  const normalized = String(value || "").toLowerCase();

  if (["positivo", "positive"].includes(normalized)) {
    return "positive";
  }

  if (["negativo", "negative"].includes(normalized)) {
    return "negative";
  }

  return "neutral";
}

export default function ConversacionesPage() {
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [conversationsError, setConversationsError] = useState("");
  const [sortField, setSortField] = useState("fecha");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    setConversationsError("");
    setLoadingConversations(true);

    api("/api/conversations")
      .then((data) => setConversations(data.conversations || []))
      .catch((error) => {
        setConversations([]);
        setConversationsError(error.message);
      })
      .finally(() => setLoadingConversations(false));
  }, []);

  const visibleConversations = useMemo(() => {
    return [...conversations].sort((firstConversation, secondConversation) => {
      const firstValue = getSortValue(firstConversation, sortField);
      const secondValue = getSortValue(secondConversation, sortField);

      if (sortDirection === "asc") {
        return firstValue - secondValue;
      }

      return secondValue - firstValue;
    });
  }, [conversations, sortDirection, sortField]);

  function changeSort(nextSortField) {
    if (sortField === nextSortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      return;
    }

    setSortField(nextSortField);
    setSortDirection("desc");
  }

  function sortLabel(fieldName) {
    if (sortField !== fieldName) {
      return "";
    }

    return sortDirection === "asc" ? " asc" : " desc";
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Conversaciones</p>
          <h1>Conversaciones</h1>
          <p className="lede">Registros cargados desde la tabla PostgreSQL/Supabase conversations.</p>
        </div>
      </div>

      {loadingConversations ? (
        <p>Cargando conversaciones...</p>
      ) : conversationsError ? (
        <div className="empty-state error-state">
          <h2>No se pudieron cargar las conversaciones</h2>
          <p>{conversationsError}</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="empty-state">
          <h2>No hay conversaciones</h2>
          <p>La tabla conversations no devolvió registros.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="conversations-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>
                    {column.sortable ? (
                      <button className="sort-button" type="button" onClick={() => changeSort(column.key)}>
                        {column.label}{sortLabel(column.key)}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleConversations.map((conversation, index) => (
                <tr key={`${conversation.fecha || "sin-fecha"}-${conversation.telefono || "sin-telefono"}-${index}`}>
                  {columns.map((column) => (
                    <td key={column.key}>{renderCell(conversation, column)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function getSortValue(conversation, fieldName) {
  if (fieldName === "fecha") {
    return new Date(conversation.fecha || 0).getTime();
  }

  return Number(conversation[fieldName] || 0);
}

function renderCell(conversation, column) {
  const value = conversation[column.key];

  if (column.type === "date") {
    return formatDate(value);
  }

  if (column.type === "duration") {
    return formatDuration(value);
  }

  if (column.type === "sentiment") {
    return <span className={`pill ${sentimentClass(value)}`}>{formatValue(value)}</span>;
  }

  return formatValue(value);
}
