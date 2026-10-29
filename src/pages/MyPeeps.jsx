import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { getTodayString, shiftDate, formatTime } from "../utils/dates";
import PeepsTabs from "../components/PeepsTabs";
import DateBar from "../components/DateBar";
import ResponseButtons from "../components/ResponseButtons";

// What They're Up To: each friend's shared day, in their own order.
export default function MyPeeps() {
  const { token, logout } = useAuth();

  const [date, setDate] = useState(getTodayString());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadSharedDays() {
      setLoading(true);
      setError(null);

      try {
        const data = await apiFetch(`/day_shares/with-me?share_date=${date}`, { token: token });
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

    loadSharedDays();
  }, [date, token, logout]);

  function handlePreviousDay() {
    setDate(shiftDate(date, -1));
  }

  function handleNextDay() {
    setDate(shiftDate(date, 1));
  }

  // When I respond, update just that event's my_response.
  function handleResponseChange(eventId, newResponse) {
    const updatedEvents = events.map((event) => {
      if (event.id === eventId) {
        return { ...event, my_response: newResponse };
      }
      return event;
    });
    setEvents(updatedEvents);
  }

  // Group the events by friend: [{ owner_id, owner_display_name, events: [...] }, ...]
  // The backend already sorted them by friend, then by their order in the day.
  const days = [];
  for (const event of events) {
    let day = null;
    for (const existing of days) {
      if (existing.owner_id === event.owner_id) {
        day = existing;
      }
    }
    if (!day) {
      day = { owner_id: event.owner_id, owner_display_name: event.owner_display_name, events: [] };
      days.push(day);
    }
    day.events.push(event);
  }

  const isPastDay = date < getTodayString();

  return (
    <>
      <PeepsTabs />
      <DateBar date={date} onPrevious={handlePreviousDay} onNext={handleNextDay} />

      {loading && <p className="status muted">Loading...</p>}
      {error && <p role="alert" className="alert status">{error}</p>}

      {!loading && !error && days.length === 0 && (
        <p className="status muted">No one has shared this day with you yet.</p>
      )}

      {!loading && !error && days.map((day) => (
        <section key={day.owner_id} className="section">
          <div className="day-owner">
            <span className="avatar" aria-hidden="true">
              {day.owner_display_name.charAt(0).toUpperCase()}
            </span>
            <h2>{day.owner_display_name}'s day</h2>
          </div>

          <ol className="event-list">
            {day.events.map((event) => (
              <li key={event.id} className="card">
                <div className="card-body">
                  <p className="card-title">{event.title}</p>
                  <p className="card-where">{event.location}</p>
                  <span className="chip">
                    {event.time_of_day}
                    {event.start_time && ` · ${formatTime(event.start_time)}`}
                  </span>
                  <ResponseButtons
                    eventId={event.id}
                    currentResponse={event.my_response}
                    readOnly={isPastDay}
                    onChange={(newResponse) => handleResponseChange(event.id, newResponse)}
                  />
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </>
  );
}