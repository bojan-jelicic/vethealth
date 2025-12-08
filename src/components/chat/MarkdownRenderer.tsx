import { useMemo } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer = ({ content, className = '' }: MarkdownRendererProps) => {
  const parsedContent = useMemo(() => {
    // Split content into lines for processing
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];
    let listType: 'ul' | 'ol' | null = null;

    const flushList = () => {
      if (listItems.length > 0 && listType) {
        const ListTag = listType;
        elements.push(
          <ListTag key={`list-${elements.length}`} className={listType === 'ul' ? 'list-disc pl-4 space-y-1' : 'list-decimal pl-4 space-y-1'}>
            {listItems.map((item, idx) => (
              <li key={idx} className="text-sm">
                {parseInline(item)}
              </li>
            ))}
          </ListTag>
        );
        listItems = [];
        listType = null;
      }
    };

    const parseInline = (text: string): (string | JSX.Element)[] => {
      const result: (string | JSX.Element)[] = [];
      let remaining = text;
      let keyCounter = 0;

      // Process bold (**text** or __text__)
      while (remaining.length > 0) {
        // Bold pattern
        const boldMatch = remaining.match(/\*\*(.+?)\*\*|__(.+?)__/);
        if (boldMatch && boldMatch.index !== undefined) {
          // Add text before match
          if (boldMatch.index > 0) {
            result.push(remaining.slice(0, boldMatch.index));
          }
          // Add bold element
          result.push(
            <strong key={`bold-${keyCounter++}`} className="font-semibold">
              {boldMatch[1] || boldMatch[2]}
            </strong>
          );
          remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
          continue;
        }

        // Italic pattern (*text* or _text_) - but not ** or __
        const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)|(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/);
        if (italicMatch && italicMatch.index !== undefined) {
          if (italicMatch.index > 0) {
            result.push(remaining.slice(0, italicMatch.index));
          }
          result.push(
            <em key={`italic-${keyCounter++}`} className="italic">
              {italicMatch[1] || italicMatch[2]}
            </em>
          );
          remaining = remaining.slice(italicMatch.index + italicMatch[0].length);
          continue;
        }

        // Code pattern (`code`)
        const codeMatch = remaining.match(/`(.+?)`/);
        if (codeMatch && codeMatch.index !== undefined) {
          if (codeMatch.index > 0) {
            result.push(remaining.slice(0, codeMatch.index));
          }
          result.push(
            <code key={`code-${keyCounter++}`} className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
              {codeMatch[1]}
            </code>
          );
          remaining = remaining.slice(codeMatch.index + codeMatch[0].length);
          continue;
        }

        // No more matches, add remaining text
        result.push(remaining);
        break;
      }

      return result;
    };

    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim();

      // Check for unordered list (*, -, +)
      const ulMatch = trimmedLine.match(/^[\*\-\+]\s+(.+)$/);
      if (ulMatch) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        listItems.push(ulMatch[1]);
        return;
      }

      // Check for ordered list (1., 2., etc.)
      const olMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
      if (olMatch) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        listItems.push(olMatch[1]);
        return;
      }

      // Flush any pending list before processing other elements
      flushList();

      // Empty line
      if (trimmedLine === '') {
        elements.push(<br key={`br-${lineIndex}`} />);
        return;
      }

      // Heading (### text)
      const h3Match = trimmedLine.match(/^###\s+(.+)$/);
      if (h3Match) {
        elements.push(
          <h3 key={`h3-${lineIndex}`} className="font-semibold text-sm mt-2 mb-1">
            {parseInline(h3Match[1])}
          </h3>
        );
        return;
      }

      // Heading (## text)
      const h2Match = trimmedLine.match(/^##\s+(.+)$/);
      if (h2Match) {
        elements.push(
          <h2 key={`h2-${lineIndex}`} className="font-semibold text-base mt-2 mb-1">
            {parseInline(h2Match[1])}
          </h2>
        );
        return;
      }

      // Regular paragraph
      elements.push(
        <p key={`p-${lineIndex}`} className="text-sm">
          {parseInline(line)}
        </p>
      );
    });

    // Flush any remaining list
    flushList();

    return elements;
  }, [content]);

  return <div className={`space-y-1 ${className}`}>{parsedContent}</div>;
};
