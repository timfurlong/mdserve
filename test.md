# mdserve Test Document

This document tests all GitHub Flavored Markdown features supported by mdserve.

## Table of Contents

- [Headers](#headers)
- [Emphasis](#emphasis)
- [Lists](#lists)
- [Links](#links)
- [Images](#images)
- [Code](#code)
- [Tables](#tables)
- [Task Lists](#task-lists)
- [Blockquotes](#blockquotes)
- [Horizontal Rules](#horizontal-rules)
- [Inline HTML](#inline-html)

## Headers

# H1 Header
## H2 Header
### H3 Header
#### H4 Header
##### H5 Header
###### H6 Header

## Emphasis

*This text is italicized with asterisks*

_This text is italicized with underscores_

**This text is bold with asterisks**

__This text is bold with underscores__

***This text is bold and italic***

~~This text is strikethrough~~

## Lists

### Unordered List

- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
    - Deeply nested item 2.2.1
- Item 3

### Ordered List

1. First item
2. Second item
   1. Nested item 2.1
   2. Nested item 2.2
3. Third item

### Mixed List

1. First ordered item
2. Second ordered item
   - Unordered nested item
   - Another unordered item
3. Third ordered item

## Links

[External link to GitHub](https://github.com)

[External link with title](https://github.com "GitHub Homepage")

[Relative link to README](./README.md)

[Anchor link to headers section](#headers)

Autolink: https://github.com

Email autolink: test@example.com

## Images

### Inline Image Syntax

![Placeholder Image](https://via.placeholder.com/150)

### Image with Title

![Placeholder with Title](https://via.placeholder.com/200 "This is a placeholder image")

### Relative Image Path

If you have a local image in the same directory:
```markdown
![Local Image](./image.png)
```

## Code

### Inline Code

Use `inline code` with backticks.

The `renderMarkdown()` function processes markdown files.

### Fenced Code Blocks

#### JavaScript

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
  return true;
}

const result = greet('World');
```

#### Python

```python
def calculate_sum(numbers):
    """Calculate the sum of a list of numbers."""
    return sum(numbers)

result = calculate_sum([1, 2, 3, 4, 5])
print(f"Sum: {result}")
```

#### Bash

```bash
#!/bin/bash

# Install dependencies
npm install

# Start the server
mdserve README.md --watch --open
```

#### JSON

```json
{
  "name": "mdserve",
  "version": "1.0.0",
  "description": "Lightweight CLI markdown renderer",
  "keywords": ["markdown", "cli", "github"]
}
```

#### HTML

```html
<!DOCTYPE html>
<html>
<head>
  <title>Example</title>
</head>
<body>
  <h1>Hello, World!</h1>
</body>
</html>
```

#### CSS

```css
.markdown-body {
  max-width: 980px;
  margin: 0 auto;
  padding: 45px;
}

@media (max-width: 767px) {
  .markdown-body {
    padding: 15px;
  }
}
```

#### Code Without Language

```
Plain text code block
No syntax highlighting
```

## Tables

### Simple Table

| Feature | Supported | Notes |
|---------|-----------|-------|
| Tables | ✓ | Full support |
| Task lists | ✓ | GitHub style |
| Strikethrough | ✓ | Use ~~ |

### Alignment

| Left-aligned | Center-aligned | Right-aligned |
|:-------------|:--------------:|--------------:|
| Left | Center | Right |
| Text | Text | Text |
| 1 | 2 | 3 |

### Complex Table

| Syntax | Description | Example |
|--------|-------------|---------|
| `**bold**` | Bold text | **This is bold** |
| `*italic*` | Italic text | *This is italic* |
| `~~strike~~` | Strikethrough | ~~This is deleted~~ |
| `[link](url)` | Link | [GitHub](https://github.com) |
| `` `code` `` | Inline code | `console.log()` |

## Task Lists

### To-Do List

- [x] Implement markdown renderer
- [x] Add syntax highlighting
- [x] Support tables
- [x] Add live reload
- [ ] Add PDF export
- [ ] Add dark mode
- [ ] Support Mermaid diagrams

### Nested Task List

- [x] Phase 1: Core Features
  - [x] Basic rendering
  - [x] GFM support
  - [x] Syntax highlighting
- [x] Phase 2: Server
  - [x] HTTP server
  - [x] Asset serving
  - [x] Live reload
- [ ] Phase 3: Future Enhancements
  - [ ] Themes
  - [ ] PDF export

## Blockquotes

> This is a simple blockquote.
> It can span multiple lines.

> **Note:** Blockquotes can contain other markdown elements.
>
> - List item 1
> - List item 2
>
> ```javascript
> console.log('Code in blockquote');
> ```

### Nested Blockquotes

> This is the first level of quoting.
>
> > This is nested blockquote.
> >
> > > And this is a third level.

## Horizontal Rules

---

***

___

## Inline HTML

GitHub allows some inline HTML:

<div align="center">
  <strong>This is centered and bold using HTML</strong>
</div>

<kbd>Ctrl</kbd> + <kbd>C</kbd>

<details>
<summary>Click to expand</summary>

This content is hidden by default and can be expanded.

- Item 1
- Item 2
- Item 3

</details>

## Special Characters

### Escaping

\*This is not italic\*

\[This is not a link\]

\`This is not code\`

### Emojis

:smile: :heart: :thumbsup: :rocket: :tada:

Note: Emoji support depends on the rendering engine.

## Mathematical Expressions

Inline math is not supported by default in GFM, but you can use superscript and subscript with HTML:

E = mc<sup>2</sup>

H<sub>2</sub>O

## Footnotes

Here's a sentence with a footnote[^1].

Another footnote reference[^2].

[^1]: This is the first footnote.
[^2]: This is the second footnote with more details.

## Definition Lists

Note: Definition lists are not part of standard GFM, but may work with extensions.

First Term
: This is the definition of the first term.

Second Term
: This is the definition of the second term.

## Long Content Test

### Lorem Ipsum

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

### Multiple Paragraphs

First paragraph with some text. This paragraph contains multiple sentences. Each sentence adds to the overall content of the paragraph.

Second paragraph separated by a blank line. Markdown requires blank lines between paragraphs. This is standard behavior.

Third paragraph with a bit more content. You can have as many paragraphs as you need in your document.

---

## Testing Complete

This document covers all major GitHub Flavored Markdown features:

✓ Headers (H1-H6) with auto-IDs
✓ Emphasis (bold, italic, strikethrough)
✓ Lists (ordered, unordered, nested, mixed)
✓ Links (external, relative, anchors, autolinks)
✓ Images (inline, with titles, relative paths)
✓ Code (inline, fenced blocks with highlighting)
✓ Tables (simple, aligned, complex)
✓ Task lists (checked, unchecked, nested)
✓ Blockquotes (simple, nested)
✓ Horizontal rules
✓ Inline HTML (limited support)

**Thank you for testing mdserve!**
