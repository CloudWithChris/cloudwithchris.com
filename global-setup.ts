// global-setup.ts
import { FullConfig } from '@playwright/test';
//import fs from 'fs';
import path from 'path';
const { resolve } = require('path');
const { readdir } = require('fs').promises;


// https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
async function globalSetup(config: FullConfig) {
  ;(async () => {
    for await (const f of getFiles('./content/episode')) {
      console.log(f);
    }
  })()
}

async function* getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      if (yield path.extname(res) === '.md') {
        yield res;
      } else {
        console.log('not md');
      }
    }
  }
}

export default globalSetup;