/**
 * Copyright 2018 - Author gauravm.git@gmail.com
 */

import log from 'fancy-log';
import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';
import { promisify } from 'util';

import {
  getArgKeyVal,
  getInstance,
  SerializedAsyncOptions,
  SerializedAsyncResult
} from 'framework';

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

          // Will add the iteration's resolved data to main resolve result array, if path is a directory.
          asyncOptions.addToResult = (item: fs.Stats) => item.isDirectory();

          // Do the iteration for each item in stat.
          return serializedAsync.do(stat, asyncOptions);

        })
        .then((result: SerializedAsyncResult[]) => {

          // result will only contain directories.

          const dirWithVer = {};

          // Iterate over all the found directories(no sub dirs).
          result.forEach((item) => {  // Start - result.forEach

            const dir: string = item.args[0];

            // Reg-ex to match something like 'Anaconda3.Exe.x86,version=5.0.0',
            // 'Microsoft.DiagnosticsHub.Collection,version=15.0.27128.1,chip=x86'.
            const res: RegExpExecArray | null = /.*(?=\,version.*)/.exec(dir);

            // If above reg-ex matched.
            if (res) {

              const name = res[0];
              let ver: string = '';

              const substrA = dir.split(',')[1];
              if (typeof substrA !== 'undefined') {

                ver = substrA.split('=')[1];

              }

              if (typeof ver === 'undefined') {

                throw new Error('Invalid folder name.');

              }

              if (dirWithVer[name]) {

                if (dir.includes('x86')) {

                  dirWithVer[name].x86.push(ver);

                } else if (dir.includes('x64')) {

                  dirWithVer[name].x64.push(ver);

                } else {

                  dirWithVer[name].none.push(ver);

                }

              } else {

                // Create an entry for particular folder in the 'dirWithVer' object.
                dirWithVer[name] = {
                  none: [],
                  x64: [],
                  x86: []
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

          }); // End - result.forEach

          const dirWithVerCopy = JSON.parse(JSON.stringify(dirWithVer));

          // Iterate over different versions.
          for (const name in dirWithVer) {

            if (dirWithVer.hasOwnProperty(name)) {

              // Remove the latest version.
              // After this action, remaining will be old versions.
              dirWithVer[name].none.pop();
              dirWithVer[name].x86.pop();
              dirWithVer[name].x64.pop();

            }

          }

          // Again iterate over all the found directories(no sub dirs).
          result.forEach((item) => {

            const dir: string = item.args[0];

            // Iterate over different versions.
            for (const name in dirWithVer) {

              if (dirWithVer.hasOwnProperty(name)) {

                // Delete all the old version.
                dirWithVer[name].none.forEach((version: string) => {

                  // Verify if current folder name contains same name substr and version.
                  if (dir.includes(name) && dir.includes(version)) {

                    dirWithVerCopy[name].none.splice(dirWithVerCopy[name].none.indexOf(version), 1);
                    // Delete the directory.
                    if (actionDelete) {
                      rimraf.sync(dir);
                    }

                  }

                });

                // Delete all the old version.
                dirWithVer[name].x86.forEach((version: string) => {

                  // Verify if current folder name contains same name substr and version.
                  if (dir.includes(name) && dir.includes(version)) {

                    dirWithVerCopy[name].x86.splice(dirWithVerCopy[name].x86.indexOf(version), 1);
                    // Delete the directory.
                    if (actionDelete) {
                      rimraf.sync(dir);
                    }

                  }

                });

                // Delete all the old version.
                dirWithVer[name].x64.forEach((version: string) => {

                  // Verify if current folder name contains same name substr and version.
                  if (dir.includes(name) && dir.includes(version)) {

                    dirWithVerCopy[name].x64.splice(dirWithVerCopy[name].x64.indexOf(version), 1);
                    // Delete the directory.
                    if (actionDelete) {
                      rimraf.sync(dir);
                    }

                  }

                });

              }
            }

          });

          log.info(`Folders ${actionDelete ? 'deleted' : 'to delete'}.`);
          log.info(dirWithVerCopy);

        })
        .catch((err: any) => log.error(err));

    }

  }

}

export { deleteFilesFolder };
