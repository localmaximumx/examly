import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  block?: boolean;
}

/**
 * Renders text containing LaTeX math formulas.
 * Supports:
 * - Block math: $$...$$ or \[...\]
 * - Inline math: $...$ or \(...\)
 * - Standalone LaTeX commands if text starts with \
 */
export const LatexText: React.FC<LatexTextProps> = ({ text, className, style, block = false }) => {
  const renderedHtml = useMemo(() => {
    if (!text) return '';

    // If the entire text is a math expression wrapped in $$ or \[
    if (text.startsWith('$$') && text.endsWith('$$') && text.length > 4) {
      const math = text.slice(2, -2).trim();
      try {
        return katex.renderToString(math, { displayMode: true, throwOnError: false });
      } catch {
        return text;
      }
    }

    // Split text by block math ($$...$$) first, then inline math ($...$)
    // Match $$...$$ or $...$ or \(...\) or \[...\]
    const regex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^\$\n]+?\$|\\\([\s\S]+?\\\))/g;

    const parts = text.split(regex);

    return parts
      .map(part => {
        if (!part) return '';

        // Block math $$...$$
        if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
          const math = part.slice(2, -2).trim();
          try {
            return katex.renderToString(math, { displayMode: true, throwOnError: false });
          } catch {
            return part;
          }
        }

        // Block math \[...\]
        if (part.startsWith('\\[') && part.endsWith('\\]') && part.length > 4) {
          const math = part.slice(2, -2).trim();
          try {
            return katex.renderToString(math, { displayMode: true, throwOnError: false });
          } catch {
            return part;
          }
        }

        // Inline math $...$
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          const math = part.slice(1, -1).trim();
          try {
            return katex.renderToString(math, { displayMode: false, throwOnError: false });
          } catch {
            return part;
          }
        }

        // Inline math \(...\)
        if (part.startsWith('\\(') && part.endsWith('\\)') && part.length > 4) {
          const math = part.slice(2, -2).trim();
          try {
            return katex.renderToString(math, { displayMode: false, throwOnError: false });
          } catch {
            return part;
          }
        }

        // Auto-detect unwrapped common LaTeX commands like \frac, \sqrt, \int, \alpha, etc.
        if (part.includes('\\frac') || part.includes('\\sqrt') || part.includes('\\pm') || part.includes('\\times')) {
          try {
            return katex.renderToString(part, { displayMode: false, throwOnError: false });
          } catch {
            // fallback to plain text escape
          }
        }

        // Plain text: escape HTML entities
        return part
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      })
      .join('');
  }, [text]);

  const Tag = block ? 'div' : 'span';

  return (
    <Tag
      className={`latex-text ${className || ''}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
