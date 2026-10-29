import { getEyebrow, formatDateLabel } from "../utils/dates";

// The ‹ date › bar used on My Day, My Peeps, and Responses.
export default function DateBar({ date, onPrevious, onNext }) {
  return (
    <div className="datebar">
      <button type="button" className="round-button" onClick={onPrevious} aria-label="Previous day">
        ‹
      </button>

      <div className="date-label">
        <p className="eyebrow">{getEyebrow(date)}</p>
        <h1>{formatDateLabel(date)}</h1>
      </div>

      <button type="button" className="round-button" onClick={onNext} aria-label="Next day">
        ›
      </button>
    </div>
  );
}