const ASTERISK_ITALIC = '*';
const UNDERSCORE_ITALIC = '_';
const ASTERISK_BOLD = '**';
const UNDERSCORE_BOLD = '__';

const ASTERISK_PLACEHOLDER_REGEXP = /ASTERISKPLACEHOLDER/gm;
const UNDERSCORE_PLACEHOLDER_REGEXP = /UNDERSCOREPLACEHOLDER/gm;

const UNDERSCORE_BOLD_PLACEHOLDER_REGEXP = /UNDERSCOREBOLDPLACEHOLDER/gm;
const UNDERSCORE_BOLD_REGEXP = /__(.*)__/gim;

const ASTERISK_BOLD_PLACEHOLDER_REGEXP = /ASTERISKBOLDPLACEHOLDER/gm;
const ASTERISK_BOLD_REGEXP = /\*\*(.*)\*\*/gim;

const UNDERSCORE_ITALIC_PLACEHOLDER_REGEXP = /UNDERSCOREITALICPLACEHOLDER/gm;
const UNDERSCORE_ITALIC_REGEXP = /_(.*)_/gim;

const ASTERISK_ITALIC_PLACEHOLDER_REGEXP = /ASTERISKITALICPLACEHOLDER/gm;
const ASTERISK_ITALIC_REGEXP = /\*(.*)\*/gim;

const HYPERLINK = /^\[([^[]+)\]\(([^)]+)\)/;

const replaceFormatMarkersWithPlaceholders = text =>
  text
    .replace(
      UNDERSCORE_BOLD_REGEXP,
      `${UNDERSCORE_BOLD_PLACEHOLDER_REGEXP.source}$1${UNDERSCORE_BOLD_PLACEHOLDER_REGEXP.source}`
    )
    .replace(
      ASTERISK_BOLD_REGEXP,
      `${ASTERISK_BOLD_PLACEHOLDER_REGEXP.source}$1${ASTERISK_BOLD_PLACEHOLDER_REGEXP.source}`
    )
    .replace(
      UNDERSCORE_ITALIC_REGEXP,
      `${UNDERSCORE_ITALIC_PLACEHOLDER_REGEXP.source}$1${UNDERSCORE_ITALIC_PLACEHOLDER_REGEXP.source}`
    )
    .replace(
      ASTERISK_ITALIC_REGEXP,
      `${ASTERISK_ITALIC_PLACEHOLDER_REGEXP.source}$1${ASTERISK_ITALIC_PLACEHOLDER_REGEXP.source}`
    );

const replaceFormatPlaceholdersWithMarkers = text =>
  text
    .replace(UNDERSCORE_BOLD_PLACEHOLDER_REGEXP, UNDERSCORE_BOLD)
    .replace(ASTERISK_BOLD_PLACEHOLDER_REGEXP, ASTERISK_BOLD)
    .replace(UNDERSCORE_ITALIC_PLACEHOLDER_REGEXP, UNDERSCORE_ITALIC)
    .replace(ASTERISK_ITALIC_PLACEHOLDER_REGEXP, ASTERISK_ITALIC);

const formatMarkers = [
  ASTERISK_BOLD_PLACEHOLDER_REGEXP.source,
  UNDERSCORE_BOLD_PLACEHOLDER_REGEXP.source,
  ASTERISK_ITALIC_PLACEHOLDER_REGEXP.source,
  UNDERSCORE_ITALIC_PLACEHOLDER_REGEXP.source
];

const formatMarkerAhead = (text, formatStack) => {
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
      const formatMarker = formatMarkerAhead(text.substring(index), formatStack);
      if (formatMarker) {
        outputText += formatMarker;
        index += formatMarker.length;
        skipCountIncrement = true;
      }

      const hyperlinkAheadRegexp = new RegExp(HYPERLINK);
      const hyperlinkMatch = hyperlinkAheadRegexp.exec(text.substring(index));
      if (hyperlinkMatch) {
        const hyperlinkText = hyperlinkMatch[1];
        const hyperlinkUrl = hyperlinkMatch[2];

        outputText += `[${truncateString(hyperlinkText)}](${hyperlinkUrl})`;
        index += hyperlinkMatch[0].length;
        count += `(${hyperlinkUrl.length})`.length
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

    outputText = outputText.trimEnd()

    while (formatStack.length > 0) {
      outputText += formatStack.pop();
    }

    return outputText;
  };

  let outputText = truncateString(text);

  if (ellipsis && count >= limit) {
    outputText += '...';
  }

  return outputText;
};

module.exports = function (text = '', options = {}) {
  const { limit, ellipsis } = options || {}

 if (isNaN(parseInt(limit, 10)) || text.length <= limit) {
    return text;
  }

  let outputText = replaceFormatMarkersWithPlaceholders(text);
  outputText = truncate(outputText, limit, ellipsis);
  outputText = replaceFormatPlaceholdersWithMarkers(outputText);
  return outputText;
};
