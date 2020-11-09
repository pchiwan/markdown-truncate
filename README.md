# Markdown Truncate

[![npm version](https://badge.fury.io/js/markdown-truncate.svg)](https://badge.fury.io/js/markdown-truncate)

A zero-dependency, vanilla JavaScript utility to truncate markdown text.

It's like `substring` but with superpowers, since it respects your input text'ss markdown emphasis markers.

Check the [demo](#demo)

## Installation

```
npm install markdown-truncate
```

or

```
yarn add markdown-truncate
```

## Usage

Import the truncate function from `markdown-truncate`; this is its signature:

```javascript
function truncateMarkdown (inputText: string, options: object)
```

### Options

These are the option flags you can provide to `markdown-truncate`:

| Flag     | Description                                                      | Default value | Required |
|----------|------------------------------------------------------------------|---------------|----------|
| limit    | The max number of characters the output string should have       | -             | Yes      |
| ellipsis | Specifies whether to append ellipsis `...` to the truncated text | `false`       | No       |

### Example

```javascript
import truncateMarkdown from 'markdown-truncate'

truncateMarkdown('markdown *is* __properly__ truncated', {
  limit: 15,
  ellipsis: true
}) // returns 'markdown *is* __pro__...'
```

## Demo

Check out the live demo [here](https://vkv5b.csb.app/).
