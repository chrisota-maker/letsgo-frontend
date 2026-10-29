// The three responses, with the words shown on screen.
// "value" matches the CHECK in schema.sql.
export const RESPONSE_OPTIONS = [
  { value: "in", label: "I'm in" },
  { value: "on_my_way", label: "On my way" },
  { value: "will_text", label: "I'll text you" },
];

// Turns "on_my_way" into "On my way".
export function getResponseLabel(value) {
  for (const option of RESPONSE_OPTIONS) {
    if (option.value === value) {
      return option.label;
    }
  }
  return value;
}