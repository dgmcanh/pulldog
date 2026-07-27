#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const dirsToDelete = ['.next', 'node_modules'];

console.log('\n🧹 Cleaning up...\n');
let count = 0;
dirsToDelete.forEach((dir) => {
  const dirPath = path.join(rootDir, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`Removing ${dirPath}`);
    fs.rmSync(dirPath, { recursive: true, force: true });
    count++;
  }
});

// post-order walk: children pruned first, so a dir holding only empty dirs goes too
const removeEmptyDirs = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name !== '.git') {
      removeEmptyDirs(path.join(dir, entry.name));
    }
  }
  if (dir !== rootDir && fs.readdirSync(dir).length === 0) {
    console.log(`Removing empty ${dir}`);
    fs.rmdirSync(dir);
    count++;
  }
};

removeEmptyDirs(rootDir);

console.log(count > 0 ? '\n🧹 Done!\n' : '🧹 Done!\n');
