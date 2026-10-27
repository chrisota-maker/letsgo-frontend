import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { getTodayString, shiftDate, formatTime } from "../utils/dates";
import { getResponseLabel } from "../utils/responses";
import ResponsesTabs from "../components/ResponsesTabs";
import DateBar from "../components/DateBar";

// Coming to Mine: who responded to my events, grouped by event.
export default function ComingToMine() {
  const { token, logout } = useAuth();

  const [date, setDate] = useState(getTodayString());
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadResponses() {
      setLoading(true);
      setError(null);

      try {
        const data = await apiFetch(`/responses/coming?event_date=${date}`, { token: token });
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

    loadResponses();
  }, [date, token, logout]);

  function handlePreviousDay() {
    setDate(shiftDate(date, -1));
  }

  function handleNextDay() {
    setDate(shiftDate(date, 1));
  }

  // One row per response comes back. Group them by event:
  // [{ event_id, title, ..., responders: [...] }, ...]
  const groupedEvents = [];
  for (const response of responses) {
    let group = null;
    for (const existing of groupedEvents) {
      if (existing.event_id === response.event_id) {
        group = existing;
      }
    }
    if (!group) {
      group = {
        event_id: response.event_id,
        title: response.title,
        location: response.location,
        time_of_day: response.time_of_day,
        start_time: response.start_time,
        responders: [],
      };
      groupedEvents.push(group);
    }
    group.responders.push(response);
  }

  return (
    <>
      <ResponsesTabs />
      <DateBar date={date} onPrevious={handlePreviousDay} onNext={handleNextDay} />

      {loading && <p className="status muted">Loading...</p>}
      {error && <p role="alert" className="alert status">{error}</p>}

      {!loading && !error && groupedEvents.length === 0 && (
        <p className="status muted">No one has responded to this day yet.</p>
      )}

      {!loading && !error && groupedEvents.length > 0 && (
        <ul className="event-list">
          {groupedEvents.map((group) => (
            <li key={group.event_id} className="card no-number">
              <div className="card-body">
                <p className="card-title">{group.title}</p>
                <p className="card-where">{group.location}</p>
                <span className="chip">
                  {group.time_of_day}
                  {group.start_time && ` · ${formatTime(group.start_time)}`}
                </span>

                <ul className="responder-list">
                  {group.responders.map((responder) => (
                    <li key={responder.responder_id} className="responder">
                      <span className="person-name">{responder.responder_display_name}</span>
                      <span className="response-chip">{getResponseLabel(responder.response)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}