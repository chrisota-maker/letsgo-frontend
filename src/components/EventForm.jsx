import { useState } from "react";

// The five allowed values, matching the CHECK constraint in schema.sql.
const TIMES_OF_DAY = ["Sunrise", "Morning", "Mid-Day", "Afternoon", "Evening"];

// A pop-up form for adding or editing an event.
// MyDay owns the API call. This form only collects the values and hands them to onSave.
// If initialEvent is passed, the form opens already filled in (edit mode).
export default function EventForm({ heading, initialEvent, onSave, onCancel }) {
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Starting values: empty for add, the event's current values for edit.
  let defaultTitle = "";
  let defaultLocation = "";
  let defaultTimeOfDay = "";
  let defaultStartTime = "";

  if (initialEvent) {
    defaultTitle = initialEvent.title;
    defaultLocation = initialEvent.location;
    defaultTimeOfDay = initialEvent.time_of_day;
    if (initialEvent.start_time) {
      defaultStartTime = initialEvent.start_time.slice(0, 5); // "16:00:00" → "16:00" for the time input
    }
  }

  async function handleEventCommit(e) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.target);

    const values = {
      title: formData.get("title"),
      location: formData.get("location"),
      time_of_day: formData.get("time_of_day"),
      start_time: formData.get("start_time"),
    };

    setSaving(true);
    try {
      await onSave(values);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <>
      {/* Dimmed background. Clicking it closes the form. */}
      <div className="sheet-backdrop" onClick={onCancel}></div>

      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="event-form-heading">
        <div className="sheet-handle"></div>
        <h2 id="event-form-heading" className="sheet-heading">{heading}</h2>

        <form className="event-form" onSubmit={handleEventCommit}>
          <label htmlFor="title" className="form-label">What are you doing?</label>
          <input
            id="title"
            className="field"
            type="text"
            name="title"
            placeholder="Sunset hike"
            autoComplete="off"
            defaultValue={defaultTitle}
            required
          />

          <label htmlFor="location" className="form-label">Where?</label>
          <input
            id="location"
            className="field"
            type="text"
            name="location"
            placeholder="La Luz trailhead"
            autoComplete="off"
            defaultValue={defaultLocation}
            required
          />

          <fieldset className="pill-group">
            <legend className="form-label">When?</legend>
            {TIMES_OF_DAY.map((timeOfDay) => (
              <label key={timeOfDay} className="pill">
                <input
                  type="radio"
                  name="time_of_day"
                  value={timeOfDay}
                  defaultChecked={timeOfDay === defaultTimeOfDay}
                  required
                />
                <span>{timeOfDay}</span>
              </label>
            ))}
          </fieldset>

          <label htmlFor="start_time" className="form-label">Exact time (optional)</label>
          <input
            id="start_time"
            className="field"
            type="time"
            name="start_time"
            defaultValue={defaultStartTime}
          />

          {error && <p role="alert" className="alert">{error}</p>}

          <div className="sheet-buttons">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}