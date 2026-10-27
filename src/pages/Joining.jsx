import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { getTodayString, shiftDate, formatTime } from "../utils/dates";
import ResponsesTabs from "../components/ResponsesTabs";
import DateBar from "../components/DateBar";
import ResponseButtons from "../components/ResponseButtons";

// I'm Joining: friends' events I've responded to. I can change or remove my response here.
export default function Joining() {
  const { token, logout } = useAuth();

  const [date, setDate] = useState(getTodayString());
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadJoining() {
      setLoading(true);
      setError(null);

      try {
        const data = await apiFetch(`/responses/joining?event_date=${date}`, { token: token });
        setResponses(data.responses);
      } catch (err) {
        if (err.status === 401) {
          logout();
          return;
        }
        setError(err.message);
      }

      setLoading(false);
    }

    loadJoining();
  }, [date, token, logout]);

  function handlePreviousDay() {
    setDate(shiftDate(date, -1));
  }

  function handleNextDay() {
    setDate(shiftDate(date, 1));
  }

  // Changed: update it in the list. Removed (null): take it off the list.
  function handleResponseChange(eventId, newResponse) {
    if (newResponse === null) {
      const remaining = responses.filter((item) => item.event_id !== eventId);
      setResponses(remaining);
      return;
    }

    const updated = responses.map((item) => {
      if (item.event_id === eventId) {
        return { ...item, response: newResponse };
      }
      return item;
    });
    setResponses(updated);
  }

  const isPastDay = date < getTodayString();

  return (
    <>
      <ResponsesTabs />
      <DateBar date={date} onPrevious={handlePreviousDay} onNext={handleNextDay} />

      {loading && <p className="status muted">Loading...</p>}
      {error && <p role="alert" className="alert status">{error}</p>}

      {!loading && !error && responses.length === 0 && (
        <p className="status muted">You haven't joined anything this day.</p>
      )}

      {!loading && !error && responses.length > 0 && (
        <ul className="event-list">
          {responses.map((item) => (
            <li key={item.event_id} className="card no-number">
              <div className="card-body">
                <p className="card-owner">{item.owner_display_name}</p>
                <p className="card-title">{item.title}</p>
                <p className="card-where">{item.location}</p>
                <span className="chip">
                  {item.time_of_day}
                  {item.start_time && ` · ${formatTime(item.start_time)}`}
                </span>
                <ResponseButtons
                  eventId={item.event_id}
                  currentResponse={item.response}
                  readOnly={isPastDay}
                  onChange={(newResponse) => handleResponseChange(item.event_id, newResponse)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}