import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { getTodayString, shiftDate } from "../utils/dates";
import DateBar from "../components/DateBar";
import EventForm from "../components/EventForm";
import EventItem from "../components/EventItem";
import ConfirmDialog from "../components/ConfirmDialog";
import ShareSheet from "../components/ShareSheet";

export default function MyDay() {
  const { token, logout } = useAuth();

  const [date, setDate] = useState(getTodayString());
  const [events, setEvents] = useState([]);
  const [shares, setShares] = useState([]);               // friends this day is shared with
  const [responses, setResponses] = useState([]);         // friends' responses to my events
  const [error, setError] = useState(null);               // problems loading the day
  const [actionError, setActionError] = useState(null);   // problems with move or delete
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);         // the "add" form
  const [editingEvent, setEditingEvent] = useState(null);   // the event being edited, or null
  const [deletingEvent, setDeletingEvent] = useState(null); // the event waiting for delete confirmation, or null
  const [showShare, setShowShare] = useState(false);       // the share sheet
  const [refreshCount, setRefreshCount] = useState(0);     // bump this to reload everything

  useEffect(() => {
    async function loadDay() {
      setLoading(true);
      setError(null);
      setActionError(null);

      try {
        const eventsData = await apiFetch(`/events?event_date=${date}`, { token: token });
        setEvents(eventsData.events);

        const sharesData = await apiFetch(`/day_shares?share_date=${date}`, { token: token });
        setShares(sharesData.shares);

        const responsesData = await apiFetch(`/responses/coming?event_date=${date}`, { token: token });
        setResponses(responsesData.responses);
      } catch (err) {
        if (err.status === 401) {
          logout();
          return;
        }
        setError(err.message);
      }

      setLoading(false);
    }

    loadDay();
  }, [date, token, logout, refreshCount]);

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

  async function handleAddEvent(values) {
    const data = await apiFetch("/events", {
      method: "POST",
      token: token,
      body: {
        title: values.title,
        location: values.location,
        event_date: date,
        time_of_day: values.time_of_day,
        start_time: values.start_time,
      },
    });

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
      setEvents(data.events);
    } catch (err) {
      setActionError(err.message);
    }
  }

  // ---------- Delete ----------
  function handleAskDelete(event) {
    setDeletingEvent(event);
  }

  function handleCancelDelete() {
    setDeletingEvent(null);
  }

  async function handleConfirmDelete() {
    setActionError(null);
    try {
      await apiFetch(`/events/${deletingEvent.id}`, {
        method: "DELETE",
        token: token,
      });
      const remainingEvents = events.filter((item) => item.id !== deletingEvent.id);
      setEvents(remainingEvents);
    } catch (err) {
      setActionError(err.message);
    }
    setDeletingEvent(null);
  }

  // ---------- Share ----------
  function handleOpenShare() {
    setShowShare(true);
  }

  function handleCloseShare() {
    setShowShare(false);
  }

  function handleShareSaved() {
    setShowShare(false);
    setRefreshCount(refreshCount + 1); // reload so "Shared with" is up to date
  }

  // ---------- Helpers for the page ----------
  const isPastDay = date < getTodayString();

  // Names for "Shared with: Mom, Dani", and ids to pre-check the share sheet.
  const sharedNames = [];
  const sharedFriendIds = [];
  for (const share of shares) {
    sharedNames.push(share.friend_display_name);
    sharedFriendIds.push(share.friend_id);
  }

  // Only the responses that belong to one event.
  function getResponsesForEvent(eventId) {
    const matching = [];
    for (const response of responses) {
      if (response.event_id === eventId) {
        matching.push(response);
      }
    }
    return matching;
  }

  return (
    <>
      <DateBar date={date} onPrevious={handlePreviousDay} onNext={handleNextDay} />

      {!loading && !error && (
        <div className="shared-bar">
          {sharedNames.length > 0 ? (
            <span>Shared with <b>{sharedNames.join(", ")}</b></span>
          ) : (
            <span className="muted">Not shared yet</span>
          )}
          {!isPastDay && (
            <button type="button" className="link-button" onClick={handleOpenShare}>
              Share my day
            </button>
          )}
        </div>
      )}

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
              responses={getResponsesForEvent(event.id)}
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
        <EventForm heading="Add to my day" onSave={handleAddEvent} onCancel={handleCloseForm} />
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

      {showShare && (
        <ShareSheet
          date={date}
          sharedFriendIds={sharedFriendIds}
          onSaved={handleShareSaved}
          onCancel={handleCloseShare}
        />
      )}
    </>
  );
}