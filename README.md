# mdserve

A lightweight CLI tool that renders markdown files as **GitHub-flavored HTML** with live reload support.

## Features

- **GitHub-Flavored Markdown** - Full GFM support including tables, task lists, strikethrough, and autolinks
- **Authentic GitHub Styling** - Renders markdown visually identical to GitHub README files
- **Syntax Highlighting** - Code blocks with automatic language detection
- **Live Reload** - Auto-refresh on file changes with Server-Sent Events
- **Relative Path Resolution** - Images and links work correctly relative to your markdown file
- **Lightweight** - Minimal dependencies, fast startup, no build tools required
- **Secure** - HTML sanitization and path traversal protection built-in

## Installation

### From Source

```bash
# Clone or navigate to the project directory
cd mdserve

# Install dependencies
npm install

# Link the CLI globally
npm link
```

After linking, the `mdserve` command will be available globally.

### Local Development

```bash
# Install dependencies
npm install

# Run directly without linking
node bin/mdserve.js your-file.md
```

## Usage

### Basic Usage

Serve a markdown file on the default port (3000):

```bash
mdserve README.md
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### With Custom Port

```bash
mdserve README.md --port 8080
```

### With Live Reload

Watch for file changes and auto-reload the browser:

```bash
mdserve README.md --watch
```

### Auto-Open Browser

Automatically open the browser on startup:

```bash
mdserve README.md --open
```

### Combined Options

```bash
mdserve docs/guide.md --port 8080 --watch --open
```

### Help

```bash
mdserve --help
```

## CLI Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `<file>` | - | Path to the markdown file (required) | - |
| `--port <number>` | `-p` | Port to listen on | `3000` |
| `--watch` | `-w` | Enable live reload on file changes | `false` |
| `--open` | `-o` | Open browser automatically | `false` |
| `--version` | `-V` | Show version number | - |
| `--help` | `-h` | Show help message | - |

## Requirements

- **Node.js** 18.0.0 or higher
- Modern web browser with EventSource support (for live reload)

## How It Works

### Architecture

mdserve uses a modular architecture with clear separation of concerns:

```
CLI Entry Point (bin/mdserve.js)
         ↓
   HTTP Server (src/server.js)
         ↓
    ┌────┴────┐
    ↓         ↓
Renderer  Watcher
(src/renderMarkdown.js)  (src/fileWatcher.js)
```

### Rendering Pipeline

Markdown is processed through a unified/remark/rehype pipeline:

1. **remark-parse** - Parse markdown to AST
2. **remark-gfm** - Add GitHub Flavored Markdown support
3. **Custom plugin** - Resolve relative paths for images/links
4. **remark-rehype** - Convert markdown AST to HTML AST
5. **rehype-slug** - Add IDs to headings for anchor links
6. **rehype-highlight** - Syntax highlighting for code blocks
7. **rehype-sanitize** - Sanitize HTML to prevent XSS
8. **rehype-stringify** - Serialize to HTML string

### Live Reload

When `--watch` is enabled:
- Server establishes Server-Sent Events (SSE) connection with browser
- File watcher monitors the markdown file using chokidar
- On file change, server re-renders markdown and sends reload signal
- Browser automatically refreshes to show updated content

### Security

- **HTML Sanitization** - `rehype-sanitize` prevents XSS attacks
- **Path Traversal Protection** - Asset requests are validated to stay within markdown directory
- **File Size Limit** - 10MB maximum to prevent memory exhaustion
- **No Code Execution** - Server only reads and serves files

## GitHub Flavored Markdown Support

mdserve supports all GitHub Flavored Markdown features:

- ✓ Headers with auto-generated IDs
- ✓ **Bold** and *italic* text
- ✓ Tables
- ✓ Task lists
- ✓ ~~Strikethrough~~
- ✓ Autolinks (https://example.com)
- ✓ Fenced code blocks with syntax highlighting
- ✓ Inline `code`
- ✓ Blockquotes
- ✓ Ordered and unordered lists
- ✓ Horizontal rules
- ✓ Images (including relative paths)
- ✓ Links (including relative paths and anchors)

## Examples

### Simple README Preview

```bash
mdserve README.md --open
```

### Documentation with Live Editing

```bash
mdserve docs/api-reference.md --watch
```

Perfect for writing documentation - save your changes and see them instantly in the browser.

### Present Markdown in a Meeting

```bash
mdserve presentation.md --port 8080 --open
```

Share the URL with others on your network to present markdown content.

## Troubleshooting

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**: Use a different port with the `--port` flag:

```bash
mdserve README.md --port 8080
```

### File Not Found

**Error**: `File not found or not readable`

**Solution**: Check that the file path is correct and the file exists:

```bash
# Use absolute path
mdserve /absolute/path/to/file.md

# Or relative path from current directory
mdserve ./docs/README.md
```

### Images Not Loading

**Problem**: Images show as broken links

**Solution**: Ensure image paths in your markdown are relative to the markdown file:

```markdown
<!-- Correct -->
![Logo](./images/logo.png)
![Icon](../assets/icon.png)

<!-- Won't work (absolute paths to local files) -->
![Logo](/Users/username/images/logo.png)
```

### Live Reload Not Working

**Problem**: Browser doesn't refresh when file changes

**Solution**:
1. Ensure you're using the `--watch` flag
2. Check browser console for SSE connection errors
3. Some text editors create temporary files - mdserve only watches the specific file you specified

### Styling Doesn't Match GitHub

**Problem**: Rendered output looks different from GitHub

**Solution**: Ensure `github-markdown-css` is installed:

```bash
npm install
```

If the CSS fails to load, mdserve will warn you in the console.

## Project Structure

```
mdserve/
├── bin/
│   └── mdserve.js           # CLI entry point
├── src/
│   ├── server.js            # HTTP server with SSE
│   ├── renderMarkdown.js    # Unified/remark/rehype pipeline
│   ├── fileWatcher.js       # File watching with chokidar
│   └── htmlTemplate.js      # HTML document generation
├── package.json             # Dependencies and configuration
└── README.md               # Documentation (this file)
```

## Dependencies

### Core Rendering
- `unified` - Unified processing interface
- `remark-parse` - Markdown parser
- `remark-gfm` - GitHub Flavored Markdown
- `remark-rehype` - Markdown to HTML transformer
- `rehype-slug` - Heading ID generator
- `rehype-highlight` - Syntax highlighting
- `rehype-sanitize` - HTML sanitizer
- `rehype-stringify` - HTML serializer

### Styling
- `github-markdown-css` - Official GitHub markdown styles

### Utilities
- `commander` - CLI argument parsing
- `chokidar` - Cross-platform file watching
- `open` - Browser opener
- `unist-util-visit` - AST visitor utility

## Development

### Running Tests

```bash
# Create a test markdown file
node bin/mdserve.js test.md --watch --open

# Edit test.md and verify changes reload automatically
```

### Code Style

- ES Modules (ESM) throughout
- JSDoc comments for all exports
- Functional programming where appropriate
- Minimal dependencies

## Future Enhancements

Potential features for future versions:

- Custom CSS themes
- Export to PDF
- Directory mode (serve multiple markdown files)
- Mermaid diagram support
- Math equations (KaTeX)
- Dark mode toggle
- Configuration file support

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

---

Built with ❤️ using the [unified](https://unifiedjs.com/) ecosystem.
