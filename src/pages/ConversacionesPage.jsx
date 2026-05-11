import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
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

const initialFilters = {
  fecha: "",
  agente: "",
  sentimiento: "",
  interes_pago: "",
  falta_recursos: "",
  actitud_deudor: "",
  actitud_agente: "",
};

const filterFields = [
  { key: "fecha", label: "Fecha", type: "date" },
  { key: "agente", label: "Agente" },
  { key: "sentimiento", label: "Sentimiento" },
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [conversationsError, setConversationsError] = useState("");
  const [filterOptions, setFilterOptions] = useState({});
  const [sortField, setSortField] = useState("fecha");
  const [sortDirection, setSortDirection] = useState("desc");

  const filters = useMemo(() => {
    return filterFields.reduce((currentFilters, field) => {
      const value = searchParams.get(field.key) || "";

      return {
        ...currentFilters,
        [field.key]: field.type === "date" ? normalizeDateFilter(value) : value,
      };
    }, initialFilters);
  }, [searchParams]);

  useEffect(() => {
    api("/api/conversations/filter-options")
      .then((data) => setFilterOptions(data || {}))
      .catch(() => {
        setFilterOptions({});
        setConversationsError("No se pudieron cargar las opciones de filtros.");
      });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([fieldName, value]) => {
      if (value) {
        params.set(fieldName, value);
      }
    });

    const queryString = params.toString();
    const conversationsPath = `/api/conversations${queryString ? `?${queryString}` : ""}`;

    setConversationsError("");
    setLoadingConversations(true);

    api(conversationsPath)
      .then((data) => setConversations(Array.isArray(data) ? data : []))
      .catch((error) => {
        setConversations([]);
        setConversationsError(error.message || "No se pudieron cargar las conversaciones.");
      })
      .finally(() => setLoadingConversations(false));
  }, [filters]);

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

  const hasActiveFilters = Object.values(filters).some(Boolean);

  function updateFilter(fieldName, value) {
    const nextSearchParams = new URLSearchParams(searchParams);

    if (value) {
      nextSearchParams.set(fieldName, value);
    } else {
      nextSearchParams.delete(fieldName);
    }

    setSearchParams(nextSearchParams);
  }

  function clearFilters() {
    setSearchParams({});
  }

  function openDatePicker(event) {
    event.currentTarget.showPicker?.();
  }

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

      <div className="filters">
        {filterFields.map((field) => (
          <label key={field.key}>
            {field.label}
            {field.type === "date" ? (
              <input
                type="date"
                value={filters[field.key]}
                onClick={openDatePicker}
                onChange={(event) => updateFilter(field.key, event.target.value)}
              />
            ) : (
              <select value={filters[field.key]} onChange={(event) => updateFilter(field.key, event.target.value)}>
                <option value="">Todos</option>
                {(filterOptions[field.key] || []).map((option) => (
                  <option key={option} value={option}>
                    {formatFilterOption(option)}
                  </option>
                ))}
              </select>
            )}
          </label>
        ))}

        <div className="filter-actions">
          <button className="secondary-button" type="button" onClick={clearFilters} disabled={!hasActiveFilters}>
            Limpiar filtros
          </button>
        </div>
      </div>

      {loadingConversations ? (
        <p className="table-message">Cargando conversaciones...</p>
      ) : conversationsError ? (
        <div className="empty-state error-state">
          <h2>No se pudieron cargar las conversaciones</h2>
          <p>{conversationsError}</p>
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
              {visibleConversations.length === 0 ? (
                <tr>
                  <td className="empty-table-cell" colSpan={columns.length}>
                    <h2>{hasActiveFilters ? "No hay resultados" : "No hay conversaciones"}</h2>
                    <p>
                      {hasActiveFilters
                        ? "No hay conversaciones que coincidan con los filtros seleccionados."
                        : "La tabla conversations no devolvió registros."}
                    </p>
                  </td>
                </tr>
              ) : (
                visibleConversations.map((conversation, index) => (
                  <tr key={`${conversation.fecha || "sin-fecha"}-${conversation.telefono || "sin-telefono"}-${index}`}>
                    {columns.map((column) => (
                      <td key={column.key}>{renderCell(conversation, column)}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function normalizeDateFilter(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function getSortValue(conversation, fieldName) {
  if (fieldName === "fecha") {
    return new Date(conversation.fecha || 0).getTime();
  }

  return Number(conversation[fieldName] || 0);
}

function formatFilterOption(value) {
  if (value === "true") {
    return "Sí";
  }

  if (value === "false") {
    return "No";
  }

  return formatValue(value);
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
