export function parseMentions(content: string): string[] {
  const matches = content.match(/@(\w+)/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map(m => m.slice(1))));
}
