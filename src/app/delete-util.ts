/**
 * Copyright 2017 - Author gauravm.git@gmail.com
 */

// Cmd utility to delete versioned folder.
// Call like => c:\> node dist\delete-util.js src="D:\Visual Studio"

import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';
import { promisify } from 'util';

import {
  getInstance, SerializedAsyncOptions, SerializedAsyncResult
} from 'async-utils';

const log = console.log;
const readDir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const args: any[] = [];

// See, https://nodejs.org/docs/latest/api/all.html#modules_accessing_the_main_module
if (require.main === module) {
  // Called directly from CLI.
  args.push(...process.argv.slice(2));
} else {
  // Required by another module.
}

// Get the arguments and it's values.
// For e.g: src=abc
// Call: getArgKeyVal('src')
// Returns: { arg: src, val: abc }
function getArgKeyVal(name: string): {
  arg: string | undefined,
  val: string | undefined
} {

  name = (name + '=');
  const argKeyValObj: {
    arg: string | undefined,
    val: string | undefined
  } = {
      arg: undefined,
      val: undefined
    };

  const argKeyVal: string = args.find((arg: string) => (arg.indexOf(name) === 0));

  if (typeof argKeyVal !== 'undefined') {

    const argKeyValArr = argKeyVal.split('=');

    if (argKeyValArr.length === 2) {

      argKeyValObj.arg = argKeyValArr[0];
      argKeyValObj.val = argKeyValArr[1];

    }

  }

  return argKeyValObj;

}

// If args is present, then start the processing.
if (args.length > 0) {

  const srcDir = getArgKeyVal('src').val;
  const actionDelete = (getArgKeyVal('action').val === 'delete') ? true : false;

  if (typeof srcDir !== 'undefined') {

    const serializedAsync = getInstance();
    const asyncOptions: SerializedAsyncOptions = {};

    readDir(srcDir)
      .then((file: string[]) => {

        asyncOptions.until = file.length;
        asyncOptions.getArguments = (index: number) => [path.join(srcDir, file[index])];
        asyncOptions.addToResult = (item: fs.Stats) => item.isDirectory();

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
