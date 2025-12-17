import http from 'http';
import { readFile, access } from 'fs/promises';
import { createReadStream, constants as fsConstants } from 'fs';
import path from 'path';
import { renderMarkdown, getBaseDir } from './renderMarkdown.js';
import { generateHtml } from './htmlTemplate.js';
import { FileWatcher } from './fileWatcher.js';

/**
 * MIME types for common file extensions.
 * Used for setting Content-Type headers when serving assets.
 */
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.md': 'text/markdown'
};

/**
 * Get MIME type for a file based on its extension.
 *
 * @param {string} filePath - Path to the file
 * @returns {string} MIME type
 */
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

/**
 * Create and start an HTTP server to serve rendered markdown.
 *
 * Routes:
 * - GET / - Serve rendered HTML
 * - GET /assets/* - Serve static files (images, etc.)
 * - GET /events - SSE endpoint for live reload (if watch enabled)
 *
 * @param {string} filePath - Path to the markdown file
 * @param {Object} options - Server options
 * @param {number} options.port - Port to listen on (default: 3000)
 * @param {boolean} options.watch - Enable live reload (default: false)
 * @returns {Promise<Object>} Server object with url and close() method
 */
export async function createServer(filePath, options = {}) {
  const { port = 3000, watch = false } = options;

  // Resolve absolute path to markdown file
  const absoluteFilePath = path.resolve(filePath);
  const baseDir = getBaseDir(absoluteFilePath);
  const filename = path.basename(absoluteFilePath);

  // Cache for rendered HTML
  let cachedHtml = null;

  // Set of SSE client connections (only used if watch is enabled)
  const sseClients = new Set();

  // File watcher (only created if watch is enabled)
  let fileWatcher = null;

  /**
   * Render the markdown file and cache the result.
   */
  async function updateRenderedHtml() {
    try {
      const renderedContent = await renderMarkdown(absoluteFilePath);
      cachedHtml = await generateHtml(renderedContent, { filename, watch });
      return cachedHtml;
    } catch (error) {
      console.error('Error rendering markdown:', error.message);
      throw error;
    }
  }

  // Initial render
  await updateRenderedHtml();

  // Set up file watching if enabled
  if (watch) {
    fileWatcher = new FileWatcher(absoluteFilePath);

    fileWatcher.on('change', async () => {
      console.log('File changed, re-rendering...');
      try {
        await updateRenderedHtml();
        console.log('Re-render complete');

        // Notify all SSE clients to reload
        for (const client of sseClients) {
          client.write('data: reload\n\n');
        }
      } catch (error) {
        console.error('Error re-rendering after file change:', error.message);
      }
    });

    fileWatcher.start();
  }

  /**
   * HTTP request handler.
   */
  const requestHandler = async (req, res) => {
    const url = req.url;

    // Route: GET / - Serve rendered HTML
    if (url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(cachedHtml);
      return;
    }

    // Route: GET /events - SSE endpoint for live reload
    if (watch && url === '/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });

      // Add client to set
      sseClients.add(res);

      // Remove client when connection closes
      req.on('close', () => {
        sseClients.delete(res);
      });

      // Send initial comment to establish connection
      res.write(': connected\n\n');
      return;
    }

    // Route: GET /assets/* - Serve static files
    if (url.startsWith('/assets/')) {
      try {
        // Extract relative path from URL
        const relativePath = decodeURIComponent(url.slice('/assets/'.length));

        // Resolve to absolute path relative to markdown directory
        const assetPath = path.resolve(baseDir, relativePath);

        // Security check: ensure resolved path is within baseDir
        // This prevents path traversal attacks (e.g., ../../etc/passwd)
        if (!assetPath.startsWith(baseDir)) {
          res.writeHead(403, { 'Content-Type': 'text/plain' });
          res.end('403 Forbidden: Access denied');
          return;
        }

        // Check if file exists and is accessible
        await access(assetPath, fsConstants.R_OK);

        // Get MIME type
        const mimeType = getMimeType(assetPath);

        // Stream file to response
        res.writeHead(200, { 'Content-Type': mimeType });
        const stream = createReadStream(assetPath);

        stream.on('error', (error) => {
          console.error('Error streaming file:', error.message);
          if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
          }
          res.end('500 Internal Server Error');
        });

        stream.pipe(res);
        return;
      } catch (error) {
        // File not found or not accessible
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
    }

    // All other routes: 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  };

  // Create HTTP server
  const server = http.createServer(requestHandler);

  // Start listening
  await new Promise((resolve, reject) => {
    server.listen(port, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });

    // Handle port already in use
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        reject(new Error(`Port ${port} is already in use. Try a different port with --port <number>`));
      } else {
        reject(error);
      }
    });
  });

  const url = `http://localhost:${port}`;

  /**
   * Close the server and clean up resources.
   */
  async function close() {
    // Stop file watcher
    if (fileWatcher) {
      fileWatcher.stop();
    }

    // Close all SSE connections
    for (const client of sseClients) {
      client.end();
    }
    sseClients.clear();

    // Close HTTP server
    return new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  return { url, close };
}
