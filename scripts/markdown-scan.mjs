// Line-level Markdown block scan shared by the validator and the structured
// artifact extractor, so both agree on what is code, comment, or visible text.
//
// One scan decides block structure, so whichever starts first wins: `<!--`
// inside a fence is code, and a fence marker inside a comment is hidden.
// A comment that starts a line opens an HTML block that runs to its closing
// marker, or to the end of the document when unclosed. An inline comment must
// close within its paragraph; otherwise `<!--` renders as text (for example in
// a code span). Fences may be indented or open on a list-item line; a closer
// may be indented at most three columns past the fence's container.
// Outside a list, a line indented four spaces or a tab after a blank line or a
// heading opens an indented code block, as Markdown renders it; it runs until a
// less-indented non-blank line. Inside a list, indentation continues the item.

function columns(whitespace) {
  return [...whitespace].reduce((width, character) => (character === '\t' ? width + 4 - (width % 4) : width + 1), 0);
}

// Returns one entry per '\n'-separated line: { kind, visible }, where kind is
// 'visible', 'fence' (fenced code, markers included), 'code' (indented code) or
// 'comment' (an HTML comment block). `visible` is the line's visible text.
export function scanMarkdownLines(text) {
  let fence = null;
  let comment = false;
  let indentedCode = false;
  let inList = false;
  let previousBlank = true;
  let previousHeading = false;
  const scan = line => {
    const blank = !line.trim();
    if (comment) {
      const end = line.indexOf('-->');
      if (end < 0) return { kind: 'comment', visible: '' };
      comment = false;
      return { kind: 'comment', visible: line.slice(end + 3) };
    }
    if (fence) {
      const marker = line.match(/^([ \t]*)(\x60{3,}|~{3,})(.*)$/);
      if (marker && columns(marker[1]) <= fence.base + 3 && marker[2][0] === fence.marker[0]
        && marker[2].length >= fence.marker.length && !marker[3].trim()) fence = null;
      return { kind: 'fence', visible: '' };
    }
    const codeIndent = /^(?: {4}|\t)/.test(line);
    if (indentedCode) {
      if (blank || codeIndent) return { kind: 'code', visible: '' };
      indentedCode = false;
    }
    const thematicBreak = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/.test(line);
    // Only a column-0 heading or break ends a list; an indented one belongs to the item.
    if (/^(?:#{1,6}(?:[ \t]|$)|([-*_])(?:[ \t]*\1){2,}[ \t]*$)/.test(line)) inList = false;
    else if (!thematicBreak && /^ {0,3}(?:[-*+]|\d{1,9}[.)])(?:[ \t]|$)/.test(line)) inList = true;
    else if (!blank && !/^[ \t]/.test(line) && previousBlank) inList = false;
    if (!blank && codeIndent && !inList && (previousBlank || previousHeading)) {
      indentedCode = true;
      return { kind: 'code', visible: '' };
    }
    const opener = line.match(/^([ \t]*)((?:(?:[-*+]|\d{1,9}[.)])[ \t]+)?)(\x60{3,}|~{3,})(.*)$/);
    if (opener && (opener[3][0] === '~' || !opener[4].includes('\x60'))) {
      const column = columns(opener[1] + opener[2]);
      fence = { marker: opener[3], base: opener[2] || inList ? column : 0 };
      return { kind: 'fence', visible: '' };
    }
    // A same-line close is left to the inline pass in visibleMarkdown.
    if (/^ {0,3}<!--/.test(line) && !line.slice(line.indexOf('<!--') + 4).includes('-->')) {
      comment = true;
      return { kind: 'comment', visible: '' };
    }
    return { kind: 'visible', visible: line };
  };
  return text.split('\n').map(line => {
    const entry = scan(line);
    previousBlank = !line.trim();
    previousHeading = /^ {0,3}#{1,6}(?:[ \t]|$)/.test(line);
    return entry;
  });
}

// Visible text with hidden comments and code examples blanked, preserving line numbers.
export function visibleMarkdown(text) {
  const blocks = scanMarkdownLines(text).map(entry => entry.visible).join('\n');
  return blocks.replace(/<!--(?:(?!\r?\n[ \t]*\r?\n)[\s\S])*?-->/g, hidden => hidden.replace(/[^\n]/g, ''));
}
