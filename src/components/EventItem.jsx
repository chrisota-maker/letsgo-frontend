import { formatTime } from "../utils/dates";
import { getResponseLabel } from "../utils/responses";

// One of MY event cards, with move, edit, and delete buttons,
// plus who responded ("Mom: I'm in").
// readOnly hides the buttons (used for past days).
export default function EventItem({ event, responses, isFirst, isLast, readOnly, onMoveUp, onMoveDown, onEdit, onDelete }) {
  return (
    <li className="card">
      <div className="card-body">
        <p className="card-title">{event.title}</p>
        <p className="card-where">{event.location}</p>
        <span className="chip">
          {event.time_of_day}
          {event.start_time && ` · ${formatTime(event.start_time)}`}
        </span>

        {responses.length > 0 && (
          <div className="response-list">
            {responses.map((response) => (
              <span key={response.responder_id} className="response-chip">
                {response.responder_display_name}: {getResponseLabel(response.response)}
              </span>
            ))}
          </div>
        )}
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