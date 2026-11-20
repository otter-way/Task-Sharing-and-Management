const MAX_TITLE_LENGTH = 200;

// A note's first line becomes the title and the rest its description, so
// "Veli toplantısı\nSalı 15:00" reads naturally as a task.
export function taskFromText(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const [first = "", ...rest] = lines;

  if (first.length <= MAX_TITLE_LENGTH) {
    return { title: first, description: rest.join("\n\n") };
  }

  return {
    title: `${first.slice(0, MAX_TITLE_LENGTH - 1).trimEnd()}…`,
    description: lines.join("\n\n"),
  };
}
