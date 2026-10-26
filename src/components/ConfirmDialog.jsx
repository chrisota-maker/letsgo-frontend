import { useState } from "react";

// A styled "are you sure?" pop-up that slides up like the event form.
// The parent decides what happens on confirm. This only asks the question.
export default function ConfirmDialog({ heading, message, confirmLabel, onConfirm, onCancel }) {
  const [working, setWorking] = useState(false);

  async function handleConfirm() {
    setWorking(true);
    await onConfirm();
  }

  return (
    <>
      {/* Dimmed background. Clicking it cancels. */}
      <div className="sheet-backdrop" onClick={onCancel}></div>

      <div className="sheet" role="alertdialog" aria-modal="true" aria-labelledby="confirm-heading">
        <div className="sheet-handle"></div>
        <h2 id="confirm-heading" className="sheet-heading">{heading}</h2>
        <p className="confirm-message">{message}</p>

        <div className="sheet-buttons">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={handleConfirm} disabled={working}>
            {working ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}