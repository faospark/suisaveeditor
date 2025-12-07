/**
 * Converts markdown syntax to HTML
 * Supports headers, bold, italic, links, code blocks, blockquotes, and GitHub-style alerts
 * 
 * @param {string} markdown - The markdown text to convert
 * @returns {string} - The converted HTML string
 */
export function markdownToHTML(markdown) {
  let html = markdown;

  // Convert code blocks first (to avoid processing their content)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`;
  });

  // Convert inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Convert headers (must be at start of line)
  html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

  // Convert bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Convert links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Convert blockquotes (GitHub alerts) - handle single line format
  html = html.replace(/^> \[!(\w+)\] (.+)$/gm, (match, type, content) => {
    const alertClass = type.toLowerCase();
    return `<div class="alert alert-${alertClass}"><strong>${type}:</strong> ${content}</div>`;
  });

  // Convert blockquotes (GitHub alerts) - handle multi-line format
  html = html.replace(/^> \[!(\w+)\]\n((?:^> .*$\n?)*)/gm, (match, type, content) => {
    const alertContent = content.replace(/^> /gm, '').trim();
    const alertClass = type.toLowerCase();
    return `<div class="alert alert-${alertClass}"><strong>${type}:</strong> ${alertContent}</div>`;
  });

  // Convert regular blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // Convert horizontal rules
  html = html.replace(/^---$/gm, '<hr>');

  // Add line break before list markers (-, *, +, 1., 2., etc.) for better spacing
  // Convert indentation spaces to non-breaking spaces for proper nesting
  // Don't add <br> if previous line ends with a heading tag
  const lines = html.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(\s*)([-*+]|\d+\.)\s+/);
    if (match) {
      const spaces = match[1];
      const marker = match[2];
      const indent = spaces.replace(/ /g, '&nbsp;');
      
      // Check if previous line ends with a heading tag
      const prevLineEndsWithHeading = i > 0 && lines[i - 1].match(/<\/h[1-6]>$/);
      
      if (prevLineEndsWithHeading) {
        lines[i] = lines[i].replace(/^(\s*)([-*+]|\d+\.)\s+/, `${indent}${marker} `);
      } else {
        lines[i] = lines[i].replace(/^(\s*)([-*+]|\d+\.)\s+/, `<br>${indent}${marker} `);
      }
    }
  }
  html = lines.join('\n');

  // Convert line breaks to paragraphs
  html = html.split('\n\n').map(para => {
    // Don't wrap if already wrapped in a tag
    if (para.match(/^<(h[1-6]|ul|ol|pre|blockquote|hr|div)/)) {
      return para;
    }
    // Don't wrap empty lines
    if (para.trim() === '') {
      return '';
    }
    return `<p>${para.replace(/\n/g, ' ')}</p>`;
  }).join('\n');

  return html;
}
