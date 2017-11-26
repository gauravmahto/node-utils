import './../globals';

import { expect } from 'chai';
import 'mocha';

import { SerializedAsync } from 'src/async-utils';

describe('Async utils', () => {

  it('Should create instance of SerializedAsync', () => {

    expect(() => new SerializedAsync()).to.not.throw(Error);

  });

});