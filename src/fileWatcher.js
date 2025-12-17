import { EventEmitter } from 'events';
import chokidar from 'chokidar';

/**
 * File watcher that monitors a markdown file for changes.
 * Emits 'change' events when the file is modified.
 *
 * Uses chokidar for cross-platform file watching with debouncing
 * to handle rapid saves and editor atomic writes.
 *
 * @extends EventEmitter
 * @fires FileWatcher#change
 */
export class FileWatcher extends EventEmitter {
  /**
   * Create a new file watcher.
   *
   * @param {string} filePath - Path to the file to watch
   */
  constructor(filePath) {
    super();
    this.filePath = filePath;
    this.watcher = null;
  }

  /**
   * Start watching the file for changes.
   * Emits 'change' event when the file is modified.
   */
  start() {
    // Configure chokidar with debouncing to handle rapid saves
    this.watcher = chokidar.watch(this.filePath, {
      persistent: true,
      ignoreInitial: true, // Don't fire on initial add
      awaitWriteFinish: {
        stabilityThreshold: 100, // Wait 100ms for file size to stabilize
        pollInterval: 100        // Poll every 100ms
      }
    });

    // Emit 'change' event when file changes
    this.watcher.on('change', (path) => {
      this.emit('change', path);
    });

    // Handle errors
    this.watcher.on('error', (error) => {
      console.error('File watcher error:', error);
      this.emit('error', error);
    });
  }

  /**
   * Stop watching the file and clean up resources.
   */
  stop() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }
}

/**
 * Change event fired when the watched file is modified.
 *
 * @event FileWatcher#change
 * @type {string} - Path to the changed file
 */
