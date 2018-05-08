/**
 * Copyright 2018 - Author gauravm.git@gmail.com
 */

import fs from 'fs';
import path from 'path';

export function getMissingSOAPErrors(soapErrDefFile: string, soapErrDefTSFile: string): string[] {

  const soapErrDefFileBuffer = fs.readFileSync(path.resolve(soapErrDefFile));
  const soapErrDefTSFileBuffer = fs.readFileSync(path.resolve(soapErrDefTSFile));

  const soapErrDefFileData = soapErrDefFileBuffer.toString();
  const soapErrDefTSFileData = soapErrDefTSFileBuffer.toString();

  const foundItems = soapErrDefFileData.match(/(?<=\#define.*)(\d{4})/g);
  const foundItemsTS = soapErrDefTSFileData.match(/(?<=.*\s{1}\=\s{1})(\d{4})/g);
  let missingErrors: string[] = [];

  if (null !== foundItems &&
    null !== foundItemsTS) {

    missingErrors = foundItems.filter((errCode) => {

      const errCodeNum = Number(errCode);
      if (!Number.isNaN(errCodeNum) &&
        errCodeNum >= 3000 &&
        errCodeNum < 9000) {
        return foundItemsTS.indexOf(errCode) === -1;
      }

      return false;

    });

  }

  return missingErrors;

}
