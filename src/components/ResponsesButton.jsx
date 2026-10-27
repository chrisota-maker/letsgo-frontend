import { useState } from "react";
import { apiFetch } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { RESPONSE_OPTIONS, getResponseLabel } from "../utils/responses";

// I'm in / On my way / I'll text you, for one friend's event.
// This component saves the response itself, then tells the page with onChange(newValue).
// onChange(null) means the response was removed.
export default function ResponseButtons({ eventId, currentResponse, readOnly, onChange }) {
  const { token } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Past days: just show what you said, if anything.
  if (readOnly) {
    if (!currentResponse) {
      return null;
    }
    return <span className="tag response-readonly">{getResponseLabel(currentResponse)}</span>;
  }

  async function handlePick(value) {
    if (value === currentResponse) {
      return; // already picked, nothing to do
    }
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/responses/${eventId}`, {
        method: "PUT",
        token: token,
        body: { response: value },
      });
      onChange(value);
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  async function handleRemove() {
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/responses/${eventId}`, {
        method: "DELETE",
        token: token,
      });
      onChange(null);
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  return (
    <div className="response-row">
      {RESPONSE_OPTIONS.map((option) => {
        const isSelected = option.value === currentResponse;

        let className = "response-pill";
        if (isSelected) {
          className = "response-pill selected";
        }

        return (
          <button
            key={option.value}
            type="button"
            className={className}
            onClick={() => handlePick(option.value)}
            disabled={saving}
            aria-pressed={isSelected}
          >
            {option.label}
            {isSelected && " ✓"}
          </button>
        );
      })}

      {currentResponse && (
        <button type="button" className="response-remove" onClick={handleRemove} disabled={saving}>
          remove
        </button>
      )}

      {error && <p role="alert" className="alert response-error">{error}</p>}
    </div>
  );
}