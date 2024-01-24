const truncateMarkdown = require('.');

describe('truncateMarkdown test suite', () => {
  test.each([
    [
      'strings are not truncated if limit is not specified',
      'strings are not truncated if limit is not specified',
      null,
    ],
    [
      'strings are not truncated if the specified limit is not a valid integer',
      'strings are not truncated if the specified limit is not a valid integer',
      { limit: 'mandarina' },
    ],
    [
      'strings are not truncated if the specified limit is higher than the input text length',
      'strings are not truncated if the specified limit is higher than the input text length',
      { limit: 200 },
    ],
    ['strings are truncated to the specified limit', 'strings are tru', { limit: 15 }],
    ['strings are truncated adding ellipsis when "ellipsis" is true', 'strings ar...', { limit: 10, ellipsis: true }],
    [`line breaks\nmake it through\ntruncation`, `line breaks\nmak...`, { limit: 15, ellipsis: true }],
    [
      `line breaks
      make it through
      truncation`,
      `line breaks
      ma...`,
      { limit: 20, ellipsis: true },
    ],
    ['markdown *is* __properly__ truncated', 'markdown *is* __pro__', { limit: 15 }],
    [
      'this is _another **example**_ of markdown truncation',
      'this is _another **exam**_...',
      { limit: 20, ellipsis: true },
    ],
    [
      'underscores must _be\\_wrapped\\_in\\_italics_ to be truncated correctly',
      'underscores must _be\\_wrapped\\_in\\_ita_...',
      { limit: 34, ellipsis: true },
    ],
    [
      'asterisks must **be\\*wrapped\\*in\\*bold** to be truncated correctly',
      'asterisks must **be\\*wrapped\\*in\\*b**...',
      { limit: 30, ellipsis: true },
    ],
    [
      'truncation trims **trailing     spaces**',
      'truncation trims **trailing**...',
      { limit: 25, ellipsis: true },
    ],
    [
      'a [hyperlink is also truncated](https://google.com) including the link',
      'a [hyperlink is](https://google.com)...',
      { limit: 15, ellipsis: true },
    ],
    [
      'in hyperlinks [only the label counts towards truncate limit](https://google.com)',
      'in hyperlinks [only the label counts towards truncate limit](https://google.com)',
      { limit: 58, ellipsis: true },
    ],
    ['this www.google.com is also properly truncated', 'this www.goo...', { limit: 12, ellipsis: true }],
    [
      '"quotes" and other special <characters> remain unchanged',
      '"quotes" and other special <charact...',
      { limit: 35, ellipsis: true },
    ],
    [
      '_[**italics wrapping links with bold text**](https://google.com)_ are also truncated',
      '_[**italics wrapping lin**](https://google.com)_',
      { limit: 20 },
    ],
    [
      'Enter some *markdown text* **here**, change the **character _limit_**, and check that the text is __properly__ truncated',
      'Enter some *markdown text* **here**, change the **character _lim_**',
      { limit: 55 }
    ],
    [
      'add some backticked code `const foo = "bar"` and check that it is truncated',
      'add some backticked code `const`',
      { limit: 30 }
    ],
    [
      'add some triple-backticks code ```const foo = "bar```',
      'add some triple-backticks code ```const foo = "b```',
      { limit: 45 }
    ],
    [
      `handles multiline 
triple-backticks code \`\`\`const foo
= "bar\`\`\`
      `,
      `handles multiline 
triple-backticks code \`\`\`const f\`\`\``,
      { limit: 48 }
    ]
  ])('%s is truncated correctly', (input, expected, options) => {
    const output = truncateMarkdown(input, options);
    expect(output).toEqual(expected);
  });
});
