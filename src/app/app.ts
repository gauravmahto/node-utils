/**
 * Copyright 2018 - Author gauravm.git@gmail.com
 */

import log from 'fancy-log';
import { deleteFilesFolder } from './main';

// Application entry.

log.info('** App entry **');

// Usage - 1 :
// Cmd utility to delete versioned folder.
// Call like => node dist\src\app.js src="D:\Visual Studio"

const args: string[] = [];
// See, https://nodejs.org/docs/latest/api/all.html#modules_accessing_the_main_module
if (require.main === module) {

  // Called directly from CLI.
  args.push(...process.argv.slice(2));
  deleteFilesFolder(args);

} else {
  // Required by another module.
}
