/**
 * Copyright 2018 - Author gauravm.git@gmail.com
 */

import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';
import { promisify } from 'util';

import {
  getArgKeyVal,
  getInstance,
  SerializedAsyncOptions,
  SerializedAsyncResult
} from 'framework';

const log = console.log;
const readDir = promisify(fs.readdir);
const stat = promisify(fs.stat);

function deleteFilesFolder(cmdArgs: string[]) {

  // If args is present, then start the processing.
  if (cmdArgs.length > 0) {

    const srcDir: string | undefined = getArgKeyVal('src', cmdArgs).val;
    const actionDelete = (getArgKeyVal('action', cmdArgs).val === 'delete') ? true : false;

    if (typeof srcDir !== 'undefined') {

      const serializedAsync = getInstance();
      const asyncOptions: SerializedAsyncOptions = {};

      // Read the provided dir.
      readDir(srcDir)
        .then((file: string[]) => {

          // Iteration limit.
          asyncOptions.until = file.length;

          // Get arguments for each iteration.
          asyncOptions.getArguments = (index: number) => [path.join(srcDir, file[index])];

          // Will add the iteration resolved data to result, if true.
          asyncOptions.addToResult = (item: fs.Stats) => item.isDirectory();

          // Do the iteration for each item in stat.
          return serializedAsync.do(stat, asyncOptions);

        })
        .then((result: SerializedAsyncResult[]) => {

          const dirWithVer = {};
          result.forEach((item) => {
            const dir: string = item.args[0];

            const res = /.*(?=\,version.*)/.exec(dir);

            if (res) {

              const name = res[0];
              const ver = dir.split(',')[1].split('=')[1];

              if (dirWithVer[name]) {

                if (dir.includes('x86')) {
                  dirWithVer[name].x86.push(ver);
                } else if (dir.includes('x64')) {
                  dirWithVer[name].x64.push(ver);
                } else {
                  dirWithVer[name].none.push(ver);
                }

              } else {

                dirWithVer[name] = {
                  x86: [],
                  x64: [],
                  none: []
                };
                if (dir.includes('x86')) {
                  dirWithVer[name].x86.push(ver);
                } else if (dir.includes('x64')) {
                  dirWithVer[name].x64.push(ver);
                } else {
                  dirWithVer[name].none.push(ver);
                }

              }

            }

          });

          const dirWithVerCopy = JSON.parse(JSON.stringify(dirWithVer));
          for (const name in dirWithVer) {

            if (dirWithVer.hasOwnProperty(name)) {
              dirWithVer[name].none.pop();
              dirWithVer[name].x86.pop();
              dirWithVer[name].x64.pop();
            }

          }

          result.forEach((item) => {
            const dir: string = item.args[0];

            for (const name in dirWithVer) {

              if (dirWithVer.hasOwnProperty(name)) {

                dirWithVer[name].none.forEach((version: string) => {

                  if (dir.includes(name) && dir.includes(version)) {
                    dirWithVerCopy[name].none.splice(dirWithVerCopy[name].none.indexOf(version), 1);
                    // Delete directory.
                    if (actionDelete) {
                      rimraf.sync(dir);
                    }
                  }

                });

                dirWithVer[name].x86.forEach((version: string) => {

                  if (dir.includes(name) && dir.includes(version)) {
                    dirWithVerCopy[name].x86.splice(dirWithVerCopy[name].x86.indexOf(version), 1);
                    // Delete directory.
                    if (actionDelete) {
                      rimraf.sync(dir);
                    }
                  }

                });

                dirWithVer[name].x64.forEach((version: string) => {

                  if (dir.includes(name) && dir.includes(version)) {
                    dirWithVerCopy[name].x64.splice(dirWithVerCopy[name].x64.indexOf(version), 1);
                    // Delete directory.
                    if (actionDelete) {
                      rimraf.sync(dir);
                    }
                  }

                });

              }
            }

          });

          log(dirWithVerCopy);

        })
        .catch((err: any) => log(err));

    }

  }

}

export { deleteFilesFolder };
