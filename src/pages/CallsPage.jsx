import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { formatDate, formatDuration } from "../utils.js";

const sentimentOptions = ["All", "Positive", "Neutral", "Negative"];
const statusOptions = ["All", "Reviewed", "New", "Follow up"];

export default function CallsPage() {
  const [calls, setCalls] = useState([]);
  const [loadingCalls, setLoadingCalls] = useState(true);
  const [callsError, setCallsError] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    setCallsError("");
    setLoadingCalls(true);

    api("/api/calls")
      .then((data) => setCalls(data.calls))
      .catch((error) => {
        setCalls([]);
        setCallsError(error.message);
      })
      .finally(() => setLoadingCalls(false));
  }, []);

  const visibleCalls = useMemo(() => {
    const filteredCalls = calls.filter((call) => {
      const matchesSentiment =
        sentimentFilter === "All" || call.sentiment === sentimentFilter;
      const matchesStatus = statusFilter === "All" || call.status === statusFilter;
      return matchesSentiment && matchesStatus;
    });

    return [...filteredCalls].sort((firstCall, secondCall) => {
      const firstValue =
        sortField === "date"
          ? new Date(firstCall.call_date).getTime()
          : firstCall.duration_seconds;
      const secondValue =
        sortField === "date"
          ? new Date(secondCall.call_date).getTime()
          : secondCall.duration_seconds;

      if (sortDirection === "asc") {
        return firstValue - secondValue;
      }

      return secondValue - firstValue;
    });
  }, [calls, sentimentFilter, sortDirection, sortField, statusFilter]);

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

    return sortDirection === "asc" ? " up" : " down";
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Calls</p>
          <h1>Call Review Queue</h1>
        </div>
        <Link className="button" to="/calls/new">Add call</Link>
      </div>

      <div className="filters">
        <label>
          Sentiment
          <select
            value={sentimentFilter}
            onChange={(event) => setSentimentFilter(event.target.value)}
          >
            {sentimentOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>

        <label>
          Status
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>

      {loadingCalls ? (
        <p>Loading calls...</p>
      ) : callsError ? (
        <div className="empty-state">
          <h2>Calls are not available yet</h2>
          <p>{callsError}</p>
        </div>
      ) : calls.length === 0 ? (
        <div className="empty-state">
          <h2>No calls yet</h2>
          <p>Add a call once the database has been seeded or configured.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>
                  <button className="sort-button" type="button" onClick={() => changeSort("date")}>
                    Date{sortLabel("date")}
                  </button>
                </th>
                <th>
                  <button className="sort-button" type="button" onClick={() => changeSort("duration")}>
                    Duration{sortLabel("duration")}
                  </button>
                </th>
                <th>Sentiment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleCalls.map((call) => (
                <tr key={call.id}>
                  <td>
                    <Link to={`/calls/${call.id}`}>{call.customer_name}</Link>
                    <span>{call.phone_number}</span>
                  </td>
                  <td>{formatDate(call.call_date)}</td>
                  <td>{formatDuration(call.duration_seconds)}</td>
                  <td><span className={`pill ${call.sentiment.toLowerCase()}`}>{call.sentiment}</span></td>
                  <td>{call.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleCalls.length === 0 && (
            <p className="table-message">No calls match these filters.</p>
          )}
        </div>
      )}
    </section>
  );
}
