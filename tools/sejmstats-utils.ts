export function getActName(title: string): string {
  let trimmed = title.split("jednolitego tekstu ustawy")[1].trim();
  if (trimmed.startsWith("o ")) return "Ustawa " + trimmed;
  return trimmed;
}
