import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import { readFile, stat } from 'fs/promises';
import path from 'path';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Custom remark plugin to resolve relative paths in images and links.
 * Transforms relative paths like "./image.png" to "/assets/./image.png"
 * so the server can resolve them relative to the markdown file's directory.
 *
 * @param {string} baseDir - The directory containing the markdown file
 */
function remarkRelativePathResolver(baseDir) {
  return (tree) => {
    visit(tree, ['image', 'link'], (node) => {
      const url = node.url;

      // Skip if URL is absolute (http://, https://, //) or an anchor link (#)
      if (!url ||
          url.startsWith('http://') ||
          url.startsWith('https://') ||
          url.startsWith('//') ||
          url.startsWith('#')) {
        return;
      }

      // Transform relative path to be served by /assets/* route
      // Keep the relative path structure so server can resolve it correctly
      node.url = `/assets/${url}`;
    });
  };
}

/**
 * Renders a markdown file to HTML using the unified/remark/rehype pipeline.
 *
 * Pipeline:
 * 1. remark-parse: Parse markdown to AST
 * 2. remark-gfm: Add GitHub Flavored Markdown support
 * 3. remarkRelativePathResolver: Transform relative paths for serving
 * 4. remark-rehype: Convert markdown AST to HTML AST
 * 5. rehype-slug: Add IDs to headings for anchor links
 * 6. rehype-highlight: Add syntax highlighting to code blocks
 * 7. rehype-sanitize: Sanitize HTML to prevent XSS
 * 8. rehype-stringify: Serialize HTML AST to string
 *
 * @param {string} filePath - Path to the markdown file
 * @returns {Promise<string>} Rendered HTML string
 * @throws {Error} If file is too large, doesn't exist, or can't be read
 */
export async function renderMarkdown(filePath) {
  // Check file size before reading
  const stats = await stat(filePath);
  if (stats.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size (${(stats.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (10MB)`
    );
  }

  // Read markdown file
  const content = await readFile(filePath, 'utf-8');
  const baseDir = path.dirname(filePath);

  // Build unified processor with full pipeline
  const processor = unified()
    .use(remarkParse)                              // Parse markdown to AST
    .use(remarkGfm)                                // Add GFM support (tables, strikethrough, task lists, autolinks)
    .use(remarkRelativePathResolver, baseDir)      // Transform relative paths to /assets/* URLs
    .use(remarkRehype, { allowDangerousHtml: false }) // Convert to HTML AST (no raw HTML)
    .use(rehypeSlug)                               // Add IDs to headings (h1, h2, etc.)
    .use(rehypeHighlight, { subset: false })       // Syntax highlighting
    .use(rehypeSanitize)                           // Sanitize HTML (XSS prevention)
    .use(rehypeStringify);                         // Serialize to HTML string

  // Process and return HTML
  const result = await processor.process(content);
  return String(result);
}

/**
 * Get the base directory of a markdown file.
 * Used by the server to resolve asset paths.
 *
 * @param {string} filePath - Path to the markdown file
 * @returns {string} Directory path
 */
export function getBaseDir(filePath) {
  return path.dirname(path.resolve(filePath));
}
