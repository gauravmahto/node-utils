export interface SerializedAsyncOptions {

  until: number | ((index: number) => boolean);
  getArguments?: (index: number) => any[];

}
export type SerializedAsyncForEachFn<T> = (...args: any[]) => Promise<T> | T;

// region - Validation functions.

enum ValidationFunction {

  UntilFn = 0,
  GetArguments = 1,

  IsArray = 99

}

type validateFn = (item: any, noThrow?: boolean) => Error | boolean;

function validateUntilFn(item: any, noThrow: boolean = false): Error | boolean {

  if (typeof item !== 'function') {

    if (noThrow) {

      return false;

    }

    throw new Error(`Invalid 'until' function provided.`);

  }

  return true;

}

function validateGetArgumentsFn(item: any, noThrow: boolean = false): Error | boolean {

  if (typeof item !== 'function') {

    if (noThrow) {

      return false;

    }

    throw new Error(`Invalid 'getArguments' function provided.`);

  }

  return true;

}

function validateIsArray(item: any, noThrow: boolean = false): Error | boolean {

  if (!Array.isArray(item)) {

    if (noThrow) {

      return false;

    }

    throw new Error(`Invalid type. Expected an Array.`);

  }

  return true;

}

// endregion - Validation functions.

export class SerializedAsync {

  private static instanceForEachRunning: boolean = false;

  private readonly validations: { [k: string]: validateFn } = {};
  private currentIteration: number;
  private forEachResult: any[];

  private forEachStarted: boolean;

  public constructor(/*private items: T[]*/) {

    this.validations[ValidationFunction.UntilFn] = validateUntilFn;
    this.validations[ValidationFunction.GetArguments] = validateGetArgumentsFn;

    this.validations[ValidationFunction.IsArray] = validateIsArray;

    this.reset();

  }

  /**
   * For each function.
   * @param fn 
   * @param options 
   * @param args 
   */
  public forEach<U>(fn: SerializedAsyncForEachFn<U>,
    options: SerializedAsyncOptions = { until: -1 },
    ...args: any[]): Promise<any[]> {

    if (SerializedAsync.instanceForEachRunning) {

      return Promise.reject(
        new Error('Only single forEach call is allowed for the same instance at a time.')
      );

    }

    SerializedAsync.instanceForEachRunning = true;

    console.log('Executing ....');

    return this.$$forEach<U>(fn, options, ...args);

  }

  /**
   * Function to reset internal data.
   */
  private reset(): void {

    this.currentIteration = -1;
    this.forEachResult = [];
    this.forEachStarted = false;

  }

  /**
   * Private forEach function.
   * @param fn 
   * @param options 
   * @param args 
   */
  private $$forEach<U>(fn: SerializedAsyncForEachFn<U>,
    options: SerializedAsyncOptions,
    ...args: any[]): Promise<any[]> {

    // this.validations[ValidationFunction.UntilFn](options.until);

    // If this is the first iteration, reset the data.
    if (!this.forEachStarted) {

      // Reset the data.
      this.reset();

    }

    // Mark 'forEach' start.
    this.forEachStarted = true;

    // Set the iteration value.
    this.currentIteration = (this.currentIteration === -1) ?
      0 :
      this.currentIteration;

    // Set the until value.
    options.until = (options.until) === -1 ?
      1 :
      options.until;

    let fnArgs: any[];

    // Get the arguments that will be passed to the async callback fn.
    if (this.validations[ValidationFunction.GetArguments](options.getArguments, true)) {

      // Use the provided getArguments callback to fetch the arguments.
      fnArgs = options.getArguments(this.currentIteration);

      this.validations[ValidationFunction.IsArray](fnArgs);

    } else {

      // Use the arguments passed to the forEach.
      fnArgs = args;

    }

    // Return the Promise, so that the 'forEach' can be chained using the 'then' callback.
    return new Promise((resolve: (p: any[]) => void, reject: (p: any) => void) => {

      // Call the async callback fn by passing the arguments.
      Promise.resolve(fn(...fnArgs))
        .then((response: any) => {

          // Push the result into the response array.
          this.forEachResult.push(response);

          // Call loopAsync recursively by passing the arguments.
          if ((typeof options.until === 'function' && options.until(this.currentIteration)) ||
            ((typeof options.until === 'number') && (this.currentIteration < (options.until - 1)))) {

            // Increment the iteration count.
            this.currentIteration++;

            // Recursively call $$forEach.
            return this.$$forEach(fn, options, ...args);

          }

          // Return resolved data.
          return Promise.resolve(this.forEachResult);

        })
        .then((response: any[]) => {

          // Resolve the main Promise.
          resolve(response);
          // Allow next forEach call.
          SerializedAsync.instanceForEachRunning = false;
          // Reset the data.
          this.reset();

        })
        .catch((error: any) => {

          // Reject the main Promise.
          reject(error);
          // Allow next forEach call.
          SerializedAsync.instanceForEachRunning = false;
          // Reset the data.
          this.reset();

        });

    });

  }

}

export class SerializedAsync2 extends Array {

  public asyncEach(fn: any) {
    let i = -1;

    const resume = () => {
      iterate();
    };

    const iterate = () => {

      if (++i < this.length) {
        fn(this[i], i, this, resume);
      }

    };

    resume();

  }

}