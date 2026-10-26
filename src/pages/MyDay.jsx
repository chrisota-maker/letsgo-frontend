import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import EventForm from "../components/EventForm";
import EventItem from "../components/EventItem";
import ConfirmDialog from "../components/ConfirmDialog";

// Builds today's date as "YYYY-MM-DD" in local time (same approach as the seed).
function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Turns "2026-10-25" into a local Date object (no timezone shift).
function toLocalDate(dateString) {
  const parts = dateString.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1; // JavaScript months start at 0
  const day = Number(parts[2]);
  return new Date(year, month, day);
}

// Turns a local Date object back into "YYYY-MM-DD".
function toDateString(localDate) {
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const day = String(localDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Moves a "YYYY-MM-DD" date forward or back by a number of days.
// shiftDate("2026-10-31", 1) → "2026-11-01"
function shiftDate(dateString, days) {
  const localDate = toLocalDate(dateString);
  localDate.setDate(localDate.getDate() + days); // handles month and year rollover
  return toDateString(localDate);
}

// Turns "2026-10-25" into "Sun, Oct 25" for display.
function formatDateLabel(dateString) {
  const localDate = toLocalDate(dateString);
  return localDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// Picks the small label above the date: Today, Yesterday, Tomorrow, Future, or Past.
function getEyebrow(dateString) {
  const selected = toLocalDate(dateString);
  const today = toLocalDate(getTodayString());

  const oneDay = 1000 * 60 * 60 * 24; // milliseconds in a day
  // Math.round smooths out the hour lost or gained on daylight saving days.
  const difference = Math.round((selected - today) / oneDay);

  if (difference === 0) {
    return "Today";
  } else if (difference === -1) {
    return "Yesterday";
  } else if (difference === 1) {
    return "Tomorrow";
  } else if (difference > 1) {
    return "Future";
  } else {
    return "Past";
  }
}

export default function MyDay() {
  const { token, logout } = useAuth();

  const [date, setDate] = useState(getTodayString());
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);               // problems loading the day
  const [actionError, setActionError] = useState(null);   // problems with move or delete
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);         // the "add" form
  const [editingEvent, setEditingEvent] = useState(null);   // the event being edited, or null
  const [deletingEvent, setDeletingEvent] = useState(null); // the event waiting for delete confirmation, or null

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      setError(null);
      setActionError(null);

      try {
        const data = await apiFetch(`/events?event_date=${date}`, { token: token });
        setEvents(data.events);
      } catch (err) {
        if (err.status === 401) {
          logout();
          return;
        }
        setError(err.message);
      }

      setLoading(false);
    }

    loadEvents();
  }, [date, token, logout]);

  // ---------- Date arrows ----------
  function handlePreviousDay() {
    setDate(shiftDate(date, -1));
  }

  function handleNextDay() {
    setDate(shiftDate(date, 1));
  }

  // ---------- Add ----------
  function handleOpenForm() {
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
  }

  // Called by EventForm with the values the user typed.
  // If this throws, EventForm catches it and shows the message.
  async function handleAddEvent(values) {
    const data = await apiFetch("/events", {
      method: "POST",
      token: token,
      body: {
        title: values.title,
        location: values.location,
        event_date: date, // the day currently on screen
        time_of_day: values.time_of_day,
        start_time: values.start_time,
      },
    });

    // Add the new event to the end of the list, then close the form.
    setEvents([...events, data.event]);
    setShowForm(false);
  }

  // ---------- Edit ----------
  function handleOpenEdit(event) {
    setEditingEvent(event);
  }

  function handleCloseEdit() {
    setEditingEvent(null);
  }

  async function handleEditEvent(values) {
    const data = await apiFetch(`/events/${editingEvent.id}`, {
      method: "PUT",
      token: token,
      body: {
        title: values.title,
        location: values.location,
        time_of_day: values.time_of_day,
        start_time: values.start_time,
      },
    });

    // Swap the old version of the event for the updated one.
    const updatedEvents = events.map((item) => {
      if (item.id === data.event.id) {
        return data.event;
      }
      return item;
    });

    setEvents(updatedEvents);
    setEditingEvent(null);
  }

  // ---------- Reorder ----------
  async function handleMove(event, direction) {
    setActionError(null);
    try {
      const data = await apiFetch(`/events/${event.id}/position`, {
        method: "PUT",
        token: token,
        body: { direction: direction },
      });
      // The backend sends back the whole day in its new order.
      setEvents(data.events);
    } catch (err) {
      setActionError(err.message);
    }
  }

  // ---------- Delete ----------
  // Step 1: the ✕ button opens the confirm dialog.
  function handleAskDelete(event) {
    setDeletingEvent(event);
  }

  function handleCancelDelete() {
    setDeletingEvent(null);
  }

  // Step 2: the dialog's Delete button actually deletes.
  async function handleConfirmDelete() {
    setActionError(null);
    try {
      await apiFetch(`/events/${deletingEvent.id}`, {
        method: "DELETE",
        token: token,
      });
      // Keep every event except the deleted one.
      const remainingEvents = events.filter((item) => item.id !== deletingEvent.id);
      setEvents(remainingEvents);
    } catch (err) {
      setActionError(err.message);
    }
    setDeletingEvent(null);
  }

  // "YYYY-MM-DD" strings sort like dates, so a simple < comparison works.
  // Past days are read-only: no adding, moving, editing, or deleting.
  const isPastDay = date < getTodayString();

  return (
    <>
      <div className="datebar">
        <button
          type="button"
          className="round-button"
          onClick={handlePreviousDay}
          aria-label="Previous day"
        >
          ‹
        </button>

        <div className="date-label">
          <p className="eyebrow">{getEyebrow(date)}</p>
          <h1>{formatDateLabel(date)}</h1>
        </div>

        <button
          type="button"
          className="round-button"
          onClick={handleNextDay}
          aria-label="Next day"
        >
          ›
        </button>
      </div>

      {loading && <p className="status muted">Loading...</p>}

      {error && <p role="alert" className="alert status">{error}</p>}

      {actionError && <p role="alert" className="alert action-error">{actionError}</p>}

      {!loading && !error && events.length === 0 && (
        <p className="status muted">Nothing planned yet.</p>
      )}

      {!loading && !error && events.length > 0 && (
        <ol className="event-list">
          {events.map((event, index) => (
            <EventItem
              key={event.id}
              event={event}
              isFirst={index === 0}
              isLast={index === events.length - 1}
              readOnly={isPastDay}
              onMoveUp={() => handleMove(event, "up")}
              onMoveDown={() => handleMove(event, "down")}
              onEdit={() => handleOpenEdit(event)}
              onDelete={() => handleAskDelete(event)}
            />
          ))}
        </ol>
      )}

      {!loading && !error && !isPastDay && (
        <button type="button" className="btn add-button" onClick={handleOpenForm}>
          + Add to my day
        </button>
      )}

      {showForm && (
        <EventForm
          heading="Add to my day"
          onSave={handleAddEvent}
          onCancel={handleCloseForm}
        />
      )}

      {editingEvent && (
        <EventForm
          heading="Edit event"
          initialEvent={editingEvent}
          onSave={handleEditEvent}
          onCancel={handleCloseEdit}
        />
      )}

      {deletingEvent && (
        <ConfirmDialog
          heading="Delete this event?"
          message={`"${deletingEvent.title}" will be removed from your day.`}
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </>
  );
}