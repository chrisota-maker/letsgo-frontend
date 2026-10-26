// Turns "16:00:00" into "4:00 PM".
function formatTime(timeString) {
  const parts = timeString.split(":");
  const hours = Number(parts[0]);
  const minutes = parts[1];

  let period = "AM";
  if (hours >= 12) {
    period = "PM";
  }

  let displayHours = hours % 12; // 13 → 1, 16 → 4, 12 → 0
  if (displayHours === 0) {
    displayHours = 12;           // midnight and noon show as 12, not 0
  }

  return `${displayHours}:${minutes} ${period}`;
}

// One event card with its move, edit, and delete buttons.
// The card only reports clicks. MyDay decides what each click does.
// readOnly hides the buttons (used for past days).
export default function EventItem({ event, isFirst, isLast, readOnly, onMoveUp, onMoveDown, onEdit, onDelete }) {
  return (
    <li className="card">
      <div className="card-body">
        <p className="card-title">{event.title}</p>
        <p className="card-where">{event.location}</p>
        <span className="chip">
          {event.time_of_day}
          {event.start_time && ` · ${formatTime(event.start_time)}`}
        </span>
      </div>

      {!readOnly && (
        <div className="card-actions">
          <button
            type="button"
            className="icon-button"
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label={`Move ${event.title} up`}
          >
            ▲
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={onMoveDown}
            disabled={isLast}
            aria-label={`Move ${event.title} down`}
          >
            ▼
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={onEdit}
            aria-label={`Edit ${event.title}`}
          >
            ✎
          </button>
          <button
            type="button"
            className="icon-button danger"
            onClick={onDelete}
            aria-label={`Delete ${event.title}`}
          >
            ✕
          </button>
        </div>
      )}
    </li>
  );
}