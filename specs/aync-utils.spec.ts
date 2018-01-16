/**
 * Copyright 2018 - Author gauravm.git@gmail.com
 */

import { expect } from 'chai';
import 'mocha';

import { getInstance, SerializedAsync } from 'src/async-utils';

describe('Async utils', () => {

  it('Should get instance of SerializedAsync', () => {

    expect(() => getInstance).to.instanceOf(SerializedAsync);

  });

});
