"use client";

import React from "react";
import Link from "next/link";
import {
  tokenizeInlineMarkdown,
  parseMarkdownBlocks,
  type InlineToken,
} from "@/lib/guru/markdownParser";

interface GuruMarkdownProps {
  content: string;
  className?: string;
}

function renderTokens(tokens: InlineToken[]): React.ReactNode[] {
  return tokens.map((t, i) => {
    switch (t.type) {
      case "bold":
        return (
          <strong key={`b-${i}`} className="font-semibold text-foreground/95">
            {t.value}
          </strong>
        );
      case "italic":
        return (
          <em key={`it-${i}`} className="italic text-foreground/85">
            {t.value}
          </em>
        );
      case "code":
        return (
          <code
            key={`cd-${i}`}
            className="mono text-[0.85em] px-1.5 py-0.5 rounded bg-foreground/10 text-primary border border-foreground/10"
          >
            {t.value}
          </code>
        );
      case "link":
        if (t.isInternal) {
          return (
            <Link
              key={`lk-${i}`}
              href={t.href}
              className="text-primary hover:text-primary/80 font-medium underline underline-offset-2 decoration-primary/40 transition-colors"
            >
              {t.label}
            </Link>
          );
        }
        if (t.isSafe) {
          return (
            <a
              key={`lk-${i}`}
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 font-medium underline underline-offset-2 decoration-primary/40 transition-colors"
            >
              {t.label}
            </a>
          );
        }
        return <span key={`lk-${i}`}>{t.label}</span>;
      default:
        return t.value;
    }
  });
}

/**
 * Safe, zero-dependency Markdown renderer for Guru chat responses.
 *
 * Supports:
 * - Bold, italic, inline code, and safe links
 * - Headings (###, ##, #)
 * - Standalone bold lines styled as section headers
 * - Unordered bullet lists (-, *, •, +)
 * - Numbered lists (1., 2.)
 * - Blockquotes (>)
 * - Spaced paragraphs with responsive typography
 *
 * 100% XSS safe: does not use dangerouslySetInnerHTML.
 */
export default function GuruMarkdown({ content, className = "" }: GuruMarkdownProps) {
  if (!content || !content.trim()) return null;

  const blocks = parseMarkdownBlocks(content);

  return (
    <div className={`guru-markdown space-y-2.5 text-[0.93rem] leading-[1.65] text-foreground/90 break-words ${className}`}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading": {
            const tokens = tokenizeInlineMarkdown(block.text);
            if (block.level === 1) {
              return (
                <h3
                  key={`h1-${index}`}
                  className="serif text-[1.12rem] font-bold text-primary tracking-wide pt-2 pb-0.5 border-b border-primary/20"
                >
                  {renderTokens(tokens)}
                </h3>
              );
            }
            if (block.level === 2) {
              return (
                <h4
                  key={`h2-${index}`}
                  className="serif text-[1.05rem] font-semibold text-primary pt-1.5 pb-0.5"
                >
                  {renderTokens(tokens)}
                </h4>
              );
            }
            return (
              <h5
                key={`h3-${index}`}
                className="serif text-[0.98rem] font-semibold text-foreground/95 pt-1 text-primary/90 flex items-center gap-1.5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary/60 inline-block" />
                <span>{renderTokens(tokens)}</span>
              </h5>
            );
          }

          case "blockquote":
            return (
              <blockquote
                key={`quote-${index}`}
                className="border-l-2 border-primary/50 bg-primary/[0.04] pl-3 py-1.5 my-2 italic text-foreground/80 rounded-r text-[0.88rem]"
              >
                {renderTokens(tokenizeInlineMarkdown(block.text))}
              </blockquote>
            );

          case "ul":
            return (
              <ul key={`ul-${index}`} className="space-y-1.5 my-1.5 pl-1">
                {block.items.map((item, i) => (
                  <li key={`ul-item-${i}`} className="flex items-start gap-2 text-foreground/88">
                    <span className="text-primary font-bold text-xs select-none mt-1 shrink-0">
                      •
                    </span>
                    <span className="flex-1">
                      {renderTokens(tokenizeInlineMarkdown(item))}
                    </span>
                  </li>
                ))}
              </ul>
            );

          case "ol":
            return (
              <ol key={`ol-${index}`} className="space-y-1.5 my-1.5 pl-1">
                {block.items.map((item, i) => (
                  <li key={`ol-item-${i}`} className="flex items-start gap-2.5 text-foreground/88">
                    <span className="mono text-[10px] font-semibold px-1.5 py-0.2 rounded bg-primary/15 text-primary border border-primary/20 shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="flex-1">
                      {renderTokens(tokenizeInlineMarkdown(item))}
                    </span>
                  </li>
                ))}
              </ol>
            );

          case "p":
            return (
              <p key={`p-${index}`} className="text-foreground/90 leading-[1.68]">
                {renderTokens(tokenizeInlineMarkdown(block.text))}
              </p>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
