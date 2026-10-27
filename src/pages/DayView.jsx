import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { getTodayString, shiftDate, formatTime } from "../utils/dates";
import PeepsTabs from "../components/PeepsTabs";
import DateBar from "../components/DateBar";
import ResponseButtons from "../components/ResponseButtons";

// The five times of day, in the order they happen.
const TIMES_OF_DAY = ["Sunrise", "Morning", "Mid-Day", "Afternoon", "Evening"];

// Day View: every friend's shared events together, grouped by time of day.
export default function DayView() {
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

  // Group by time of day, in TIMES_OF_DAY order. Empty groups are skipped.
  const groups = [];
  for (const timeOfDay of TIMES_OF_DAY) {
    const matching = [];
    for (const event of events) {
      if (event.time_of_day === timeOfDay) {
        matching.push(event);
      }
    }
    if (matching.length > 0) {
      groups.push({ timeOfDay: timeOfDay, events: matching });
    }
  }

  const isPastDay = date < getTodayString();

  return (
    <>
      <PeepsTabs />
      <DateBar date={date} onPrevious={handlePreviousDay} onNext={handleNextDay} />

      {loading && <p className="status muted">Loading...</p>}
      {error && <p role="alert" className="alert status">{error}</p>}

      {!loading && !error && groups.length === 0 && (
        <p className="status muted">No one has shared this day with you yet.</p>
      )}

      {!loading && !error && groups.map((group) => (
        <section key={group.timeOfDay} className="section">
          <h2 className="section-title time-group">{group.timeOfDay}</h2>

          <ul className="event-list">
            {group.events.map((event) => (
              <li key={event.id} className="card no-number">
                <div className="card-body">
                  <p className="card-owner">{event.owner_display_name}</p>
                  <p className="card-title">{event.title}</p>
                  <p className="card-where">
                    {event.location}
                    {event.start_time && ` · ${formatTime(event.start_time)}`}
                  </p>
                  <ResponseButtons
                    eventId={event.id}
                    currentResponse={event.my_response}
                    readOnly={isPastDay}
                    onChange={(newResponse) => handleResponseChange(event.id, newResponse)}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}