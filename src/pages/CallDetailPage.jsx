import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api.js";
import { formatDate, formatDuration } from "../utils.js";

export default function CallDetailPage() {
  const { id } = useParams();
  const [call, setCall] = useState(null);
  const [loadingCall, setLoadingCall] = useState(true);

  useEffect(() => {
    api(`/api/calls/${id}`)
      .then((data) => setCall(data.call))
      .finally(() => setLoadingCall(false));
  }, [id]);

  if (loadingCall) {
    return <p>Loading call...</p>;
  }

  if (!call) {
    return <p>Call not found.</p>;
  }

  return (
    <section className="detail">
      <Link to="/calls">Back to calls</Link>
      <div className="page-header">
        <div>
          <p className="eyebrow">Call detail</p>
          <h1>{call.customer_name}</h1>
        </div>
        <span className={`pill ${call.sentiment.toLowerCase()}`}>{call.sentiment}</span>
      </div>

      <dl className="facts">
        <div>
          <dt>Phone</dt>
          <dd>{call.phone_number}</dd>
        </div>
        <div>
          <dt>Date</dt>
          <dd>{formatDate(call.call_date)}</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{formatDuration(call.duration_seconds)}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{call.status}</dd>
        </div>
      </dl>

      <article>
        <h2>Summary</h2>
        <p>{call.summary}</p>
      </article>

      <article>
        <h2>Next Step</h2>
        <p>{call.next_step}</p>
      </article>
    </section>
  );
}
