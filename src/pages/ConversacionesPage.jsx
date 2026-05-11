import { useEffect, useMemo, useRef, useState } from "react";
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
  agente: "",
  sentimiento: "",
  interes_pago: "",
  falta_recursos: "",
  actitud_deudor: "",
  actitud_agente: "",
};

const filterFields = [
  { key: "agente", label: "Agente" },
  { key: "sentimiento", label: "Sentimiento" },
  { key: "interes_pago", label: "Interés en Pago" },
  { key: "falta_recursos", label: "Falta de recursos" },
  { key: "actitud_deudor", label: "Actitud del Deudor" },
  { key: "actitud_agente", label: "Actitud del Agente" },
];

const quickRanges = [
  { label: "Todo", days: null },
  { label: "90", days: 90 },
  { label: "60", days: 60 },
  { label: "30", days: 30 },
  { label: "14", days: 14 },
  { label: "7", days: 7 },
  { label: "3", days: 3 },
  { label: "1", days: 1 },
];

const monthLabels = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const weekdayLabels = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];

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
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(getDefaultCalendarMonth);
  const [pendingRangeStart, setPendingRangeStart] = useState("");
  const datePickerRef = useRef(null);

  const filters = useMemo(() => {
    return filterFields.reduce((currentFilters, field) => {
      const value = searchParams.get(field.key) || "";

      return {
        ...currentFilters,
        [field.key]: value,
      };
    }, initialFilters);
  }, [searchParams]);

  const dateRange = useMemo(() => {
    const from = normalizeDateFilter(searchParams.get("from") || "");
    const to = normalizeDateFilter(searchParams.get("to") || "");

    return { from, to };
  }, [searchParams]);

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (!datePickerRef.current || datePickerRef.current.contains(event.target)) {
        return;
      }

      setDatePickerOpen(false);
      setPendingRangeStart("");
    }

    if (datePickerOpen) {
      document.addEventListener("mousedown", closeOnOutsideClick);
    }

    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [datePickerOpen]);

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

    if (dateRange.from) {
      params.set("from", dateRange.from);
    }

    if (dateRange.to) {
      params.set("to", dateRange.to);
    }

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
  }, [dateRange.from, dateRange.to, filters]);

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

  const hasActiveFilters = Object.values(filters).some(Boolean) || Boolean(dateRange.from || dateRange.to);
  const activeQuickRange = getActiveQuickRange(dateRange);

  function updateFilter(fieldName, value) {
    const nextSearchParams = new URLSearchParams(searchParams);

    if (value) {
      nextSearchParams.set(fieldName, value);
    } else {
      nextSearchParams.delete(fieldName);
    }

    setSearchParams(nextSearchParams);
  }

  function updateDateRange(from, to) {
    const nextSearchParams = new URLSearchParams(searchParams);

    if (from && to) {
      nextSearchParams.set("from", from);
      nextSearchParams.set("to", to);
    } else {
      nextSearchParams.delete("from");
      nextSearchParams.delete("to");
    }

    nextSearchParams.delete("fecha");
    setSearchParams(nextSearchParams);
  }

  function selectQuickRange(range) {
    setPendingRangeStart("");
    setDatePickerOpen(false);

    if (range.days === null) {
      setCalendarMonth(getDefaultCalendarMonth());
      updateDateRange("", "");
      return;
    }

    const today = new Date();
    updateDateRange(formatDateValue(addDays(today, -range.days)), formatDateValue(today));
  }

  function selectCalendarDate(value) {
    if (!pendingRangeStart) {
      setPendingRangeStart(value);
      updateDateRange(value, value);
      return;
    }

    const [from, to] = sortDateRange(pendingRangeStart, value);
    updateDateRange(from, to);
    setPendingRangeStart("");
    setDatePickerOpen(false);
  }

  function clearFilters() {
    setPendingRangeStart("");
    setCalendarMonth(getDefaultCalendarMonth());
    setSearchParams({});
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
    <section className="conversations-dashboard">
      <div className="dashboard-controls">
        <div className="filters">
          <div className="date-filter-line">
            <div className="quick-ranges" aria-label="Rangos rapidos de fecha">
              {quickRanges.map((range) => (
                <button
                  className={`quick-range-button${activeQuickRange === range.label ? " active" : ""}`}
                  key={range.label}
                  type="button"
                  onClick={() => selectQuickRange(range)}
                >
                  {range.label}
                </button>
              ))}
            </div>

            <div className="date-range-wrap" ref={datePickerRef}>
              <button
                className={`date-range-button${dateRange.from && dateRange.to ? " selected" : ""}`}
                type="button"
                onClick={() => setDatePickerOpen((isOpen) => !isOpen)}
              >
                <CalendarIcon />
                <span>{formatDateRangeLabel(dateRange)}</span>
              </button>

              {datePickerOpen ? (
                <div className="date-popover">
                  <div className="calendar-nav">
                    <button type="button" aria-label="Mes anterior" onClick={() => setCalendarMonth(addMonths(calendarMonth, -1))}>
                      &lt;
                    </button>
                    <button type="button" aria-label="Mes siguiente" onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}>
                      &gt;
                    </button>
                  </div>
                  <div className="calendar-months">
                    {[addMonths(calendarMonth, -1), calendarMonth].map((month) => (
                      <CalendarMonth
                        key={formatDateValue(month)}
                        month={month}
                        pendingRangeStart={pendingRangeStart}
                        range={dateRange}
                        onSelectDate={selectCalendarDate}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {filterFields.map((field) => (
            <label key={field.key}>
              {field.label}
              <select value={filters[field.key]} onChange={(event) => updateFilter(field.key, event.target.value)}>
                <option value="">Todos</option>
                {(filterOptions[field.key] || []).map((option) => (
                  <option key={option} value={option}>
                    {formatFilterOption(option)}
                  </option>
                ))}
              </select>
            </label>
          ))}

          <div className="filter-actions">
            <button className="secondary-button" type="button" onClick={clearFilters} disabled={!hasActiveFilters}>
              Limpiar filtros
            </button>
          </div>
        </div>

        <div className="kpi-grid" aria-label="Resumen de conversaciones">
          <article className="kpi-card">
            <div className="kpi-icon" aria-hidden="true">
              <PhoneIcon />
            </div>
            <div>
              <strong>{visibleConversations.length}</strong>
              <span>Conversaciones</span>
            </div>
          </article>
        </div>
      </div>

      <div className="table-panel">
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
      </div>
    </section>
  );
}

function normalizeDateFilter(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path
        d="M8 2v4m8-4v4M3.5 9.2h17M5.5 4.5h13A2 2 0 0 1 20.5 6.5v12A2 2 0 0 1 18.5 20.5h-13A2 2 0 0 1 3.5 18.5v-12A2 2 0 0 1 5.5 4.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="22" viewBox="0 0 24 24" width="22">
      <path
        d="M6.6 3.6 9 3a1.5 1.5 0 0 1 1.7.9l1 2.5a1.5 1.5 0 0 1-.4 1.7L10 9.3a11.2 11.2 0 0 0 4.7 4.7l1.2-1.3a1.5 1.5 0 0 1 1.7-.4l2.5 1a1.5 1.5 0 0 1 .9 1.7l-.6 2.4a2.2 2.2 0 0 1-2.2 1.7A15.2 15.2 0 0 1 4.9 5.8a2.2 2.2 0 0 1 1.7-2.2Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CalendarMonth({ month, pendingRangeStart, range, onSelectDate }) {
  const days = getCalendarDays(month);

  return (
    <div className="calendar-month">
      <h3>
        {monthLabels[month.getMonth()]} {month.getFullYear()}
      </h3>
      <div className="calendar-weekdays">
        {weekdayLabels.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>
      <div className="calendar-grid">
        {days.map((day, index) => {
          if (!day) {
            return <span aria-hidden="true" className="calendar-day placeholder" key={`placeholder-${index}`} />;
          }

          const value = formatDateValue(day);
          const isRangeStart = value === range.from;
          const isRangeEnd = value === range.to;
          const isInRange = range.from && range.to && value >= range.from && value <= range.to;
          const isPending = value === pendingRangeStart;

          return (
            <button
              className={[
                "calendar-day",
                isInRange ? "in-range" : "",
                isRangeStart || isRangeEnd || isPending ? "selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              key={value}
              type="button"
              onClick={() => onSelectDate(value)}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function getActiveQuickRange(range) {
  if (!range.from && !range.to) {
    return "Todo";
  }

  if (!range.from || !range.to) {
    return "";
  }

  const today = new Date();
  const todayValue = formatDateValue(today);

  if (range.to !== todayValue) {
    return "";
  }

  const activeRange = quickRanges.find((quickRange) => {
    return quickRange.days !== null && range.from === formatDateValue(addDays(today, -quickRange.days));
  });

  return activeRange?.label || "";
}

function formatDateRangeLabel(range) {
  if (!range.from || !range.to) {
    return "Seleccionar fechas";
  }

  return `${formatShortDate(range.from)} - ${formatShortDate(range.to)}`;
}

function formatShortDate(value) {
  const date = parseDateValue(value);
  return `${String(date.getDate()).padStart(2, "0")} ${monthLabels[date.getMonth()]} ${date.getFullYear()}`;
}

function getCalendarDays(month) {
  const firstDay = startOfMonth(month);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(firstDay.getFullYear(), firstDay.getMonth() + 1, 0).getDate();
  const monthDays = Array.from({ length: daysInMonth }, (_, index) => addDays(firstDay, index));
  const leadingPlaceholders = Array.from({ length: mondayOffset }, () => null);
  const trailingPlaceholders = Array.from({ length: 42 - leadingPlaceholders.length - monthDays.length }, () => null);

  return [...leadingPlaceholders, ...monthDays, ...trailingPlaceholders];
}

function parseDateValue(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function addMonths(date, months) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months, 1);
  return startOfMonth(nextDate);
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getDefaultCalendarMonth() {
  return startOfMonth(new Date());
}

function sortDateRange(firstDate, secondDate) {
  return firstDate <= secondDate ? [firstDate, secondDate] : [secondDate, firstDate];
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
