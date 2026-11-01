/**
 * Converts markdown syntax to semantic HTML
 * Supports headers, bold, italic, links, code blocks, lists (unordered & ordered with nesting),
 * blockquotes, horizontal rules, and GitHub-style alerts.
 * 
 * @param {string} markdown - The markdown text to convert
 * @returns {string} - The converted HTML string
 */

function inlineFormat(text) {
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^\*]+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

export function markdownToHTML(markdown) {
  if (!markdown) return '';

  const codeBlocks = [];
  let text = markdown
    .replace(/\r\n/g, '\n')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      const idx = codeBlocks.length;
      const escaped = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .trim();
      codeBlocks.push(`<pre><code class="language-${lang || 'text'}">${escaped}</code></pre>`);
      return `___CODEBLOCK_${idx}___`;
    });

  const lines = text.split('\n');
  const result = [];
  const listStack = []; // stores { type: 'ul'|'ol', level: number }

  function closeLists(targetLevel = -1) {
    while (
      listStack.length > 0 &&
      (targetLevel === -1 || listStack[listStack.length - 1].level > targetLevel)
    ) {
      const closed = listStack.pop();
      result.push(`</li></${closed.type}>`);
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];

    // Code block placeholder
    if (rawLine.startsWith('___CODEBLOCK_')) {
      closeLists();
      result.push(rawLine);
      continue;
    }

    // Horizontal rule
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(rawLine.trim())) {
      closeLists();
      result.push('<hr>');
      continue;
    }

    // Headings
    const hMatch = rawLine.match(/^(#{1,6})\s+(.*)$/);
    if (hMatch) {
      closeLists();
      const level = hMatch[1].length;
      result.push(`<h${level}>${inlineFormat(hMatch[2].trim())}</h${level}>`);
      continue;
    }

    // GitHub alerts or blockquotes
    const alertMatch = rawLine.match(/^>\s*\[!(\w+)\]\s*(.*)$/);
    if (alertMatch) {
      closeLists();
      const type = alertMatch[1].toUpperCase();
      const alertContent = alertMatch[2] ? [alertMatch[2]] : [];
      while (i + 1 < lines.length && lines[i + 1].startsWith('>')) {
        i++;
        alertContent.push(lines[i].replace(/^>\s*/, ''));
      }
      result.push(
        `<div class="alert alert-${type.toLowerCase()}"><strong>${type}:</strong> ${inlineFormat(
          alertContent.join(' ').trim()
        )}</div>`
      );
      continue;
    }

    const bqMatch = rawLine.match(/^>\s+(.*)$/);
    if (bqMatch) {
      closeLists();
      const bqContent = [bqMatch[1]];
      while (i + 1 < lines.length && lines[i + 1].startsWith('>')) {
        i++;
        bqContent.push(lines[i].replace(/^>\s*/, ''));
      }
      result.push(`<blockquote>${inlineFormat(bqContent.join(' ').trim())}</blockquote>`);
      continue;
    }

    // List items (unordered or ordered)
    const listMatch = rawLine.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
    if (listMatch) {
      const indent = listMatch[1].length;
      const marker = listMatch[2];
      const content = inlineFormat(listMatch[3].trim());
      const isOrdered = /^\d+\./.test(marker);
      const listType = isOrdered ? 'ol' : 'ul';

      if (listStack.length === 0) {
        listStack.push({ type: listType, level: indent });
        result.push(`<${listType}><li>${content}`);
      } else {
        const current = listStack[listStack.length - 1];
        if (indent > current.level) {
          listStack.push({ type: listType, level: indent });
          result.push(`<${listType}><li>${content}`);
        } else if (indent < current.level) {
          closeLists(indent);
          if (listStack.length > 0 && listStack[listStack.length - 1].level === indent) {
            result.push(`</li><li>${content}`);
          } else {
            listStack.push({ type: listType, level: indent });
            result.push(`<${listType}><li>${content}`);
          }
        } else {
          result.push(`</li><li>${content}`);
        }
      }
      continue;
    }

    // Blank line
    if (rawLine.trim() === '') {
      closeLists();
      continue;
    }

    // Regular paragraph line
    closeLists();
    result.push(`<p>${inlineFormat(rawLine.trim())}</p>`);
  }

  closeLists();

  let finalHtml = result.join('\n');
  finalHtml = finalHtml.replace(/___CODEBLOCK_(\d+)___/g, (_, id) => codeBlocks[Number(id)]);
  return finalHtml;
}
