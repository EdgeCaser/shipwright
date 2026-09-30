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
  const scan = raw => {
    // Classify without a trailing carriage return, so CRLF input reads like LF.
    const line = raw.replace(/\r$/, '');
    const blank = !line.trim();
    if (comment) {
      const end = line.indexOf('-->');
      if (end < 0) return { kind: 'comment', visible: '' };
      comment = false;
      return { kind: 'comment', visible: raw.slice(end + 3) };
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
    return { kind: 'visible', visible: raw };
  };
  return text.split('\n').map(line => {
    const entry = scan(line);
    previousBlank = !line.trim();
    previousHeading = /^ {0,3}#{1,6}(?:[ \t]|$)/.test(line);
    return entry;
  });
}

// Removes inline comments from one paragraph. Code spans (matching backtick
// runs) are skipped whole, so a comment marker inside one is literal text; an
// unmatched run is literal. Whichever construct starts first wins.
function stripInlineComments(paragraph) {
  let out = '';
  let i = 0;
  while (i < paragraph.length) {
    const character = paragraph[i];
    if (character === '<' && paragraph.startsWith('<!--', i)) {
      const end = paragraph.indexOf('-->', i + 4);
      if (end >= 0) {
        out += paragraph.slice(i, end + 3).replace(/[^\n]/g, '');
        i = end + 3;
        continue;
      }
    } else if (character === '\\') {
      out += paragraph.slice(i, i + 2);
      i += 2;
      continue;
    } else if (character === '`') {
      let run = i;
      while (paragraph[run] === '`') run++;
      const length = run - i;
      let close = -1;
      for (let j = run; j < paragraph.length;) {
        if (paragraph[j] !== '`') { j++; continue; }
        let k = j;
        while (paragraph[k] === '`') k++;
        if (k - j === length) { close = k; break; }
        j = k;
      }
      const stop = close >= 0 ? close : run;
      out += paragraph.slice(i, stop);
      i = stop;
      continue;
    }
    out += character;
    i++;
  }
  return out;
}

// Visible text with hidden comments and code examples blanked, preserving line numbers.
export function visibleMarkdown(text) {
  const blocks = scanMarkdownLines(text).map(entry => entry.visible).join('\n');
  return blocks.split(/(\r?\n[ \t]*\r?\n)/).map((part, index) => (index % 2 ? part : stripInlineComments(part))).join('');
}

// An envelope is JSON inside an HTML comment, so a `-->` inside a JSON string
// ends the comment early. The scanner then sees the block cut short, with the
// rest of the JSON left behind and a stray closer later on. `following` is the
// text after the closer that ended the block. Returns the message to report in
// place of the raw JSON error, or null when no early close is visible.
export function describeEarlyCommentClose(jsonError, following) {
  const closer = following.indexOf('-->');
  if (closer < 0 || following.slice(0, closer).includes('<!--')) return null;
  return 'The envelope contains "-->" before its end, which closes the HTML comment early. '
    + 'Write it as --\\u003e inside JSON strings. '
    + `(JSON error: ${jsonError})`;
}
