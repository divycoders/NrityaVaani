/**
 * Pure TypeScript Markdown Tokenizer & AST Builder.
 *
 * Designed to be zero-dependency, safe from XSS, and runnable
 * in both Node.js test environments and browser / Next.js runtimes.
 */

export type InlineToken =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; label: string; href: string; isInternal: boolean; isSafe: boolean };

export type MarkdownBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "blockquote"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "p"; text: string };

/**
 * Parses inline formatting:
 * - Links: [label](url)
 * - Bold: **text**
 * - Inline code: `code`
 * - Italic: *text* or _text_
 */
export function tokenizeInlineMarkdown(text: string): InlineToken[] {
  const tokenRegex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*|_([^_]+)_)/g;

  const tokens: InlineToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: "text",
        value: text.substring(lastIndex, match.index),
      });
    }

    const fullMatch = match[0];

    if (fullMatch.startsWith("[") && match[2] && match[3]) {
      const label = match[2];
      const rawUrl = match[3].trim();

      const isInternal = rawUrl.startsWith("/");
      const isSafeExternal = /^https?:\/\//i.test(rawUrl);
      const isDisallowed = /^(javascript|data|vbscript):/i.test(rawUrl);

      if (isDisallowed) {
        // Disallowed scheme -> emit safe plain text only
        tokens.push({ type: "text", value: label });
      } else {
        tokens.push({
          type: "link",
          label,
          href: rawUrl,
          isInternal,
          isSafe: isInternal || isSafeExternal,
        });
      }
    } else if (fullMatch.startsWith("**") && match[4]) {
      tokens.push({ type: "bold", value: match[4] });
    } else if (fullMatch.startsWith("`") && match[5]) {
      tokens.push({ type: "code", value: match[5] });
    } else if ((fullMatch.startsWith("*") && match[6]) || (fullMatch.startsWith("_") && match[7])) {
      tokens.push({ type: "italic", value: match[6] || match[7] });
    } else {
      tokens.push({ type: "text", value: fullMatch });
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({
      type: "text",
      value: text.substring(lastIndex),
    });
  }

  return tokens;
}

/**
 * Parses raw markdown content into structured block elements.
 */
export function parseMarkdownBlocks(content: string): MarkdownBlock[] {
  if (!content || !content.trim()) return [];

  const lines = content.replace(/\r\n/g, "\n").split("\n");

  const blocks: MarkdownBlock[] = [];
  let currentUl: string[] | null = null;
  let currentOl: string[] | null = null;
  let currentP: string[] = [];

  const flushListsAndP = () => {
    if (currentUl && currentUl.length > 0) {
      blocks.push({ type: "ul", items: currentUl });
      currentUl = null;
    }
    if (currentOl && currentOl.length > 0) {
      blocks.push({ type: "ol", items: currentOl });
      currentOl = null;
    }
    if (currentP.length > 0) {
      blocks.push({ type: "p", text: currentP.join(" ") });
      currentP = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushListsAndP();
      continue;
    }

    // 1. Headings (# Heading, ## Heading, ### Heading)
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      flushListsAndP();
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2],
      });
      continue;
    }

    // 2. Standalone bold header lines like "**Geometry**" or "**Safe Turnout**"
    const standaloneBoldMatch = trimmed.match(/^\*\*([^*]+)\*\*$/);
    if (standaloneBoldMatch) {
      flushListsAndP();
      blocks.push({
        type: "heading",
        level: 3,
        text: standaloneBoldMatch[1],
      });
      continue;
    }

    // 3. Blockquotes (> Quote)
    const quoteMatch = trimmed.match(/^>\s*(.*)$/);
    if (quoteMatch) {
      flushListsAndP();
      blocks.push({
        type: "blockquote",
        text: quoteMatch[1],
      });
      continue;
    }

    // 4. Unordered list items (-, *, •, +)
    const ulMatch = trimmed.match(/^[-*•+]\s+(.*)$/);
    if (ulMatch) {
      if (currentOl) {
        blocks.push({ type: "ol", items: currentOl });
        currentOl = null;
      }
      if (currentP.length > 0) {
        blocks.push({ type: "p", text: currentP.join(" ") });
        currentP = [];
      }
      if (!currentUl) currentUl = [];
      currentUl.push(ulMatch[1]);
      continue;
    }

    // 5. Ordered list items (1. Item, 2. Item)
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (currentUl) {
        blocks.push({ type: "ul", items: currentUl });
        currentUl = null;
      }
      if (currentP.length > 0) {
        blocks.push({ type: "p", text: currentP.join(" ") });
        currentP = [];
      }
      if (!currentOl) currentOl = [];
      currentOl.push(olMatch[2]);
      continue;
    }

    // 6. Regular paragraph text
    if (currentUl) {
      blocks.push({ type: "ul", items: currentUl });
      currentUl = null;
    }
    if (currentOl) {
      blocks.push({ type: "ol", items: currentOl });
      currentOl = null;
    }
    currentP.push(trimmed);
  }

  flushListsAndP();
  return blocks;
}
