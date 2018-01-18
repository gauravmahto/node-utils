/**
 * Copyright 2018 - Author gauravm.git@gmail.com
 */

interface Argument {

  arg: string | undefined;
  val: string | undefined;

}

// Get the arguments and it's values.
// For e.g: src=abc
// Call: getArgKeyVal('src')
// Returns: { arg: src, val: abc }
function getArgKeyVal(name: string, args: string[]): Argument {

  name = (name + '=');

  const argKeyValObj: Argument = {
    arg: undefined,
    val: undefined
  };

  const argKeyVal: string | undefined = args.find((arg: string) => (arg.indexOf(name) === 0));

  if (typeof argKeyVal !== 'undefined') {

    const argKeyValArr = argKeyVal.split('=');

    if (argKeyValArr.length === 2) {

      argKeyValObj.arg = argKeyValArr[0];
      argKeyValObj.val = argKeyValArr[1];

    }

  }

  return argKeyValObj;

}

export { getArgKeyVal, Argument };
