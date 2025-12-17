import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cache for github-markdown-css to avoid reading file multiple times
let githubMarkdownCss = null;

/**
 * Load github-markdown-css from node_modules.
 * Caches the result for subsequent calls.
 *
 * @returns {Promise<string>} CSS content
 */
async function loadGithubMarkdownCss() {
  if (githubMarkdownCss) {
    return githubMarkdownCss;
  }

  try {
    // Path to github-markdown-css in node_modules
    const cssPath = path.join(__dirname, '..', 'node_modules', 'github-markdown-css', 'github-markdown.css');
    githubMarkdownCss = await readFile(cssPath, 'utf-8');
    return githubMarkdownCss;
  } catch (error) {
    // Fallback if CSS can't be loaded (e.g., not installed)
    console.warn('Warning: Could not load github-markdown-css. Using minimal fallback styles.');
    return '';
  }
}

/**
 * Additional CSS for container layout and responsiveness.
 * Matches GitHub's README rendering layout.
 * Forces light mode to prevent dark mode from system preferences.
 */
const CONTAINER_CSS = `
:root {
  color-scheme: light;
}

/* Force light mode - override any dark mode styles */
body {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 980px;
  margin: 0 auto;
  padding: 45px;
  background-color: #ffffff !important;
  color: #24292f !important;
  color-scheme: light;
}

@media (max-width: 767px) {
  body {
    padding: 15px;
  }
}

.markdown-body {
  box-sizing: border-box;
  color-scheme: light;
  background-color: #ffffff !important;
  color: #24292f !important;
}

/* Override dark mode media query */
@media (prefers-color-scheme: dark) {
  body,
  .markdown-body {
    background-color: #ffffff !important;
    color: #24292f !important;
  }
}
`.trim();

/**
 * Server-Sent Events (SSE) client script for live reload.
 * Automatically reloads the page when the server sends a reload event.
 */
const SSE_CLIENT_SCRIPT = `
(function() {
  const eventSource = new EventSource('/events');

  eventSource.onmessage = function(event) {
    if (event.data === 'reload') {
      console.log('File changed, reloading...');
      location.reload();
    }
  };

  eventSource.onerror = function(error) {
    console.error('SSE connection error:', error);
    // EventSource automatically attempts to reconnect
  };

  // Log when connection is established
  eventSource.onopen = function() {
    console.log('Live reload connected');
  };
})();
`.trim();

/**
 * Generate complete HTML document with GitHub-style rendering.
 *
 * @param {string} renderedContent - HTML content from markdown renderer
 * @param {Object} options - Generation options
 * @param {string} options.filename - Name of the markdown file (for title)
 * @param {boolean} options.watch - Whether to include live reload script
 * @returns {Promise<string>} Complete HTML document
 */
export async function generateHtml(renderedContent, options = {}) {
  const { filename = 'Markdown Preview', watch = false } = options;

  // Load GitHub markdown CSS
  const githubCss = await loadGithubMarkdownCss();

  // Build HTML document
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${escapeHtml(filename)}</title>

  <!-- GitHub Markdown CSS (inlined) -->
  <style>
${githubCss}
  </style>

  <!-- Container and responsive styles -->
  <style>
${CONTAINER_CSS}
  </style>

  <!-- GitHub-style syntax highlighting theme -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css" integrity="sha512-0aPQyyeZrWj9sCA46UlmWgKOP0mUipLQ6OZXu8l4IcAmD2u31EPEy9VcIMvl7SoAaKe8bLXZhYoMaE/in+gcgA==" crossorigin="anonymous" referrerpolicy="no-referrer">
</head>
<body>
  <article class="markdown-body">
${renderedContent}
  </article>

  ${watch ? `<!-- Live reload script -->
  <script>
${SSE_CLIENT_SCRIPT}
  </script>` : ''}
</body>
</html>`;
}

/**
 * Escape HTML special characters to prevent XSS in title.
 *
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, char => htmlEscapes[char]);
}
