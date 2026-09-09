export type InlineMarkdownToken = {
  type: "text" | "strong" | "emphasis";
  value: string;
};

const tokenPattern = /(\*{3}([^*\n]+)\*{3}|\*{2}([^*\n]+)\*{2}|\*([^*\n]+)\*|_{2}([^_\n]+)_{2}|_([^_\n]+)_)/g;

function plainText(value: string) {
  return value
    .replace(/\\([*_])/g, "$1")
    .replace(/\*{2,}|_{2,}/g, "");
}

export function parseInlineMarkdown(value: string | null | undefined): InlineMarkdownToken[] {
  if (!value) return [];
  const tokens: InlineMarkdownToken[] = [];
  let cursor = 0;

  for (const match of value.matchAll(tokenPattern)) {
    const raw = match[0];
    const start = match.index ?? cursor;
    if (start > cursor) {
      const text = plainText(value.slice(cursor, start));
      if (text) tokens.push({ type: "text", value: text });
    }

    const isStrong = raw.startsWith("**") || raw.startsWith("__");
    const markerLength = raw.startsWith("***") ? 3 : isStrong ? 2 : 1;
    const content = raw.slice(markerLength, -markerLength);
    if (content) {
      tokens.push({ type: raw.startsWith("***") || isStrong ? "strong" : "emphasis", value: plainText(content) });
    }
    cursor = start + raw.length;
  }

  const tail = plainText(value.slice(cursor));
  if (tail) tokens.push({ type: "text", value: tail });
  return tokens;
}

export function inlineMarkdownToText(value: string | null | undefined) {
  return parseInlineMarkdown(value).map((token) => token.value).join("");
}
