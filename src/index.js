const ASTERISK_ITALIC = '*';
const UNDERSCORE_ITALIC = '_';
const ASTERISK_BOLD = '**';
const UNDERSCORE_BOLD = '__';
const BACKTICK = '`';
const TRIPLE_BACKTICKS = '```';
const ESCAPED_UNDERSCORE = '\\_';
const ESCAPED_ASTERISK = '\\*'

const ESCAPED_ASTERISK_REGEXP = /\\\*/g;
const ASTERISK_PLACEHOLDER_REGEXP = /ASTERISKPLACEHOLDER/gm;

const ESCAPED_UNDERSCORE_REGEXP = /\\_/g;
const UNDERSCORE_PLACEHOLDER_REGEXP = /UNDERSCOREPLACEHOLDER/gm;

const UNDERSCORE_BOLD_PLACEHOLDER_REGEXP = /UNDERSCOREBOLDPLACEHOLDER/gm;
const UNDERSCORE_BOLD_REGEXP = /(__)(.*?)(__)/g;

const ASTERISK_BOLD_PLACEHOLDER_REGEXP = /ASTERISKBOLDPLACEHOLDER/gm;
const ASTERISK_BOLD_REGEXP = /(\*\*)(.*?)(\*\*)/g;

const UNDERSCORE_ITALIC_PLACEHOLDER_REGEXP = /UNDERSCOREITALICPLACEHOLDER/gm;
const UNDERSCORE_ITALIC_REGEXP = /(_)(.*?)(_)/g;

const ASTERISK_ITALIC_PLACEHOLDER_REGEXP = /ASTERISKITALICPLACEHOLDER/gm;
const ASTERISK_ITALIC_REGEXP = /(\*)(.*?)(\*)/g;

const TRIPLE_BACKTICKS_PLACEHOLDER_REGEXP = /TRIPLEBACKTICKSPLACEHOLDER/gm;
const TRIPLE_BACKTICKS_REGEXP = /(```)(.*?)(```)/gs;

const BACKTICK_PLACEHOLDER_REGEXP = /BACKTICKPLACEHOLDER/gm;
const BACKTICK_REGEXP = /(`)(.*?)(`)/gs;

const HYPERLINK = /^\[([^[]+)\]\(([^)]+)\)/;

const replaceFormatMarkersWithPlaceholders = text =>
  text
    .replace(ESCAPED_UNDERSCORE_REGEXP, UNDERSCORE_PLACEHOLDER_REGEXP.source)
    .replace(ESCAPED_ASTERISK_REGEXP, ASTERISK_PLACEHOLDER_REGEXP.source)
    .replace(
      UNDERSCORE_BOLD_REGEXP,
      `${UNDERSCORE_BOLD_PLACEHOLDER_REGEXP.source}$2${UNDERSCORE_BOLD_PLACEHOLDER_REGEXP.source}`
    )
    .replace(
      ASTERISK_BOLD_REGEXP,
      `${ASTERISK_BOLD_PLACEHOLDER_REGEXP.source}$2${ASTERISK_BOLD_PLACEHOLDER_REGEXP.source}`
    )
    .replace(
      UNDERSCORE_ITALIC_REGEXP,
      `${UNDERSCORE_ITALIC_PLACEHOLDER_REGEXP.source}$2${UNDERSCORE_ITALIC_PLACEHOLDER_REGEXP.source}`
    )
    .replace(
      ASTERISK_ITALIC_REGEXP,
      `${ASTERISK_ITALIC_PLACEHOLDER_REGEXP.source}$2${ASTERISK_ITALIC_PLACEHOLDER_REGEXP.source}`
    )
    .replace(
      TRIPLE_BACKTICKS_REGEXP,
      `${TRIPLE_BACKTICKS_PLACEHOLDER_REGEXP.source}$2${TRIPLE_BACKTICKS_PLACEHOLDER_REGEXP.source}`
    )
    .replace(
      BACKTICK_REGEXP,
      `${BACKTICK_PLACEHOLDER_REGEXP.source}$2${BACKTICK_PLACEHOLDER_REGEXP.source}`
    )

const replaceFormatPlaceholdersWithMarkers = text =>
  text
    .replace(UNDERSCORE_PLACEHOLDER_REGEXP, ESCAPED_UNDERSCORE)
    .replace(ASTERISK_PLACEHOLDER_REGEXP, ESCAPED_ASTERISK)
    .replace(UNDERSCORE_BOLD_PLACEHOLDER_REGEXP, UNDERSCORE_BOLD)
    .replace(ASTERISK_BOLD_PLACEHOLDER_REGEXP, ASTERISK_BOLD)
    .replace(UNDERSCORE_ITALIC_PLACEHOLDER_REGEXP, UNDERSCORE_ITALIC)
    .replace(ASTERISK_ITALIC_PLACEHOLDER_REGEXP, ASTERISK_ITALIC)
    .replace(TRIPLE_BACKTICKS_PLACEHOLDER_REGEXP, TRIPLE_BACKTICKS)
    .replace(BACKTICK_PLACEHOLDER_REGEXP, BACKTICK);

const formatMarkers = [
  ASTERISK_BOLD_PLACEHOLDER_REGEXP.source,
  UNDERSCORE_BOLD_PLACEHOLDER_REGEXP.source,
  ASTERISK_ITALIC_PLACEHOLDER_REGEXP.source,
  UNDERSCORE_ITALIC_PLACEHOLDER_REGEXP.source,
  BACKTICK_PLACEHOLDER_REGEXP.source,
  TRIPLE_BACKTICKS_PLACEHOLDER_REGEXP.source,
];

const formatPlaceholdersMap = {
  [UNDERSCORE_PLACEHOLDER_REGEXP.source]: ESCAPED_UNDERSCORE.length,
  [ASTERISK_PLACEHOLDER_REGEXP.source]: ESCAPED_ASTERISK.length,
}

const findFormatPlaceholderAhead = (text) => {
  const formatPlaceholders = Object.keys(formatPlaceholdersMap);

  for (let i = 0, l = formatPlaceholders.length; i < l; i++) {
    if (text.startsWith(formatPlaceholders[i])) {
      return formatPlaceholders[i];
    }
  }

  return null;
}

const findFormatMarkerAhead = (text, formatStack) => {
  for (let i = 0, l = formatMarkers.length; i < l; i++) {
    if (text.startsWith(formatMarkers[i])) {
      if (formatStack[formatStack.length - 1] === formatMarkers[i]) {
        formatStack.pop();
      } else {
        formatStack.push(formatMarkers[i]);
      }
      return formatMarkers[i];
    }
  }

  return null;
};

const truncate = (text, limit, ellipsis) => {
  let count = 0;

  const truncateString = text => {
    let formatStack = [];
    let skipCountIncrement = false;
    let outputText = '';
    let index = 0;

    while (count < limit && index < text.length) {
      const formatMarker = findFormatMarkerAhead(text.substring(index), formatStack);
      if (formatMarker) {
        outputText += formatMarker;
        index += formatMarker.length;
        skipCountIncrement = true;
      }

      const formatPlaceholder = findFormatPlaceholderAhead(text.substring(index));
      if (formatPlaceholder) {
        outputText += formatPlaceholder;
        index += formatPlaceholder.length;
        skipCountIncrement = true;
        count += formatPlaceholdersMap[formatPlaceholder];
      }

      const hyperlinkAheadRegexp = new RegExp(HYPERLINK);
      const hyperlinkMatch = hyperlinkAheadRegexp.exec(text.substring(index));
      if (hyperlinkMatch) {
        const hyperlinkText = hyperlinkMatch[1];
        const hyperlinkUrl = hyperlinkMatch[2];

        outputText += `[${truncateString(hyperlinkText)}](${hyperlinkUrl})`;
        index += hyperlinkMatch[0].length;
        skipCountIncrement = true;
      }

      if (!formatMarker && !hyperlinkMatch) {
        outputText += text[index];
        index++;
      }

      if (!skipCountIncrement) {
        count++;
      }

      skipCountIncrement = false;
    }

    outputText = outputText.trimEnd();

    while (formatStack.length > 0) {
      outputText += formatStack.pop();
    }

    return outputText;
  };

  let outputText = truncateString(text);

  if (ellipsis && outputText.length < text.length) {
    outputText += '...';
  }

  return outputText;
};

module.exports = function (text = '', options = {}) {
  const { limit, ellipsis } = options || {};

  if (isNaN(parseInt(limit, 10)) || text.length <= limit) {
    return text;
  }

  let outputText = replaceFormatMarkersWithPlaceholders(text);
  outputText = truncate(outputText, limit, ellipsis);
  outputText = replaceFormatPlaceholdersWithMarkers(outputText);
  return outputText;
};
