/**
 * Copyright 2018 - Author gauravm.git@gmail.com
 */

import { expect } from 'chai';
import 'mocha';

import { getSerializedAsyncTasksInstance } from 'framework';

describe('Async utils', () => {

  it('Should get and instance', () => {

    expect(() => getSerializedAsyncTasksInstance()).to.not.be.undefined;  // tslint:disable-line

  });

});
