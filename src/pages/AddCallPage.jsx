import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { api } from "../api.js";

const initialForm = {
  customer_name: "",
  phone_number: "",
  call_date: "",
  duration_seconds: 300,
  sentiment: "Neutral",
  status: "New",
  summary: "",
  next_step: "",
};

export default function AddCallPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function updateField(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function submitForm(event) {
    event.preventDefault();
    setError("");

    try {
      const data = await api("/api/calls", {
        method: "POST",
        body: JSON.stringify(form),
      });
      navigate(`/calls/${data.call.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="narrow">
      <p className="eyebrow">New call</p>
      <h1>Add Call</h1>

      <form className="form" onSubmit={submitForm}>
        {error && <p className="error">{error}</p>}

        <label>
          Customer name
          <input name="customer_name" value={form.customer_name} onChange={updateField} required />
        </label>

        <label>
          Phone number
          <input name="phone_number" value={form.phone_number} onChange={updateField} required />
        </label>

        <label>
          Call date
          <input name="call_date" type="datetime-local" value={form.call_date} onChange={updateField} required />
        </label>

        <label>
          Duration in seconds
          <input name="duration_seconds" type="number" min="0" value={form.duration_seconds} onChange={updateField} />
        </label>

        <label>
          Sentiment
          <select name="sentiment" value={form.sentiment} onChange={updateField}>
            <option>Positive</option>
            <option>Neutral</option>
            <option>Negative</option>
          </select>
        </label>

        <label>
          Status
          <select name="status" value={form.status} onChange={updateField}>
            <option>New</option>
            <option>Reviewed</option>
            <option>Follow up</option>
          </select>
        </label>

        <label>
          Summary
          <textarea name="summary" value={form.summary} onChange={updateField} required />
        </label>

        <label>
          Next step
          <textarea name="next_step" value={form.next_step} onChange={updateField} required />
        </label>

        <button className="button" type="submit">Create call</button>
      </form>
    </section>
  );
}
