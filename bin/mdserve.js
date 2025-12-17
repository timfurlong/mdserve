#!/usr/bin/env node

import { Command } from 'commander';
import { access, constants as fsConstants } from 'fs/promises';
import path from 'path';
import open from 'open';
import { createServer } from '../src/server.js';

/**
 * CLI entry point for mdserve.
 * Renders markdown files as GitHub-flavored HTML with live reload.
 */

const program = new Command();

program
  .name('mdserve')
  .description('Lightweight CLI tool to render markdown files as GitHub-flavored HTML')
  .version('1.0.0')
  .argument('<file>', 'Path to the markdown file to serve')
  .option('-p, --port <number>', 'Port to listen on', '3000')
  .option('-w, --watch', 'Enable live reload on file changes', false)
  .option('-o, --open', 'Open browser automatically', false)
  .action(async (file, options) => {
    try {
      // Parse port
      const port = parseInt(options.port, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        console.error(`Error: Invalid port number "${options.port}". Port must be between 1 and 65535.`);
        process.exit(1);
      }

      // Resolve file path
      const filePath = path.resolve(file);

      // Check if file exists
      try {
        await access(filePath, fsConstants.R_OK);
      } catch (error) {
        console.error(`Error: File not found or not readable: ${filePath}`);
        process.exit(1);
      }

      // Check file extension
      const ext = path.extname(filePath).toLowerCase();
      if (ext !== '.md' && ext !== '.markdown') {
        console.warn(`Warning: File extension "${ext}" is not .md or .markdown. Proceeding anyway...`);
      }

      // Start server
      console.log('Starting mdserve...');
      console.log(`Serving: ${filePath}`);

      const server = await createServer(filePath, {
        port,
        watch: options.watch
      });

      console.log(`\n✓ Server running at ${server.url}`);

      if (options.watch) {
        console.log('✓ Live reload enabled');
      }

      // Open browser if requested
      if (options.open) {
        console.log(`✓ Opening browser...`);
        await open(server.url);
      }

      console.log('\nPress Ctrl+C to stop');

      // Handle graceful shutdown
      const shutdown = async (signal) => {
        console.log(`\n\nReceived ${signal}, shutting down gracefully...`);
        try {
          await server.close();
          console.log('Server closed');
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error.message);
          process.exit(1);
        }
      };

      // Register signal handlers
      process.on('SIGINT', () => shutdown('SIGINT'));
      process.on('SIGTERM', () => shutdown('SIGTERM'));

      // Handle uncaught errors
      process.on('uncaughtException', (error) => {
        console.error('Uncaught exception:', error);
        process.exit(1);
      });

      process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled rejection at:', promise, 'reason:', reason);
        process.exit(1);
      });

    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Parse arguments
program.parse(process.argv);
