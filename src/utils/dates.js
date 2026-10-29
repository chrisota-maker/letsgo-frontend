// Date helpers shared by every page with a date bar.

// Today's date as "YYYY-MM-DD" in local time.
export function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Turns "2026-10-25" into a local Date object (no timezone shift).
export function toLocalDate(dateString) {
  const parts = dateString.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1; // JavaScript months start at 0
  const day = Number(parts[2]);
  return new Date(year, month, day);
}

// Turns a local Date object back into "YYYY-MM-DD".
export function toDateString(localDate) {
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const day = String(localDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Moves a "YYYY-MM-DD" date forward or back by a number of days.
export function shiftDate(dateString, days) {
  const localDate = toLocalDate(dateString);
  localDate.setDate(localDate.getDate() + days); // handles month and year rollover
  return toDateString(localDate);
}

// Turns "2026-10-25" into "Sun, Oct 25".
export function formatDateLabel(dateString) {
  const localDate = toLocalDate(dateString);
  return localDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// The small label above the date: Today, Yesterday, Tomorrow, Future, or Past.
export function getEyebrow(dateString) {
  const selected = toLocalDate(dateString);
  const today = toLocalDate(getTodayString());

  const oneDay = 1000 * 60 * 60 * 24; // milliseconds in a day
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

// Turns "16:00:00" into "4:00 PM".
export function formatTime(timeString) {
  const parts = timeString.split(":");
  const hours = Number(parts[0]);
  const minutes = parts[1];

  let period = "AM";
  if (hours >= 12) {
    period = "PM";
  }

  let displayHours = hours % 12;
  if (displayHours === 0) {
    displayHours = 12;
  }

  return `${displayHours}:${minutes} ${period}`;
}