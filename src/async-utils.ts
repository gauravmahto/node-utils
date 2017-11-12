export interface SerializedAsyncOptions {

  until?: number | ((index: number) => boolean);
  getArguments?: (index: number) => any[];
  addToResult?: (item: any, ...originalItems: any[]) => boolean;

}
export interface SerializedAsyncResult {

  res: any;
  args: any | any[];

}
export type SerializedAsyncDoFn<T> = (...args: any[]) => Promise<T> | T;

// region - Validation functions.

enum ValidationFunction {

  Until = 0,
  GetArguments = 1,
  AddToResult = 2,

  IsArray = 99

}

type validateFn = (item: any, noThrow?: boolean) => Error | boolean;

function validateUntil(item: any, noThrow: boolean = false): Error | boolean {

  if (typeof item !== 'function' && typeof item !== 'number') {

    if (noThrow) {

      return false;

    }

    throw new Error(`Invalid 'until' option provided.`);

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

function validateAddToResultFn(item: any, noThrow: boolean = false): Error | boolean {

  if (typeof item !== 'function') {

    if (noThrow) {

      return false;

    }

    throw new Error(`Invalid 'addToResult' function provided.`);

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

  private static instanceDoRunning: boolean = false;

  private readonly validations: { [k: string]: validateFn } = {};
  private currentIteration: number;
  private doResult: SerializedAsyncResult[];

  private doStarted: boolean;

  public constructor() {

    this.validations[ValidationFunction.Until] = validateUntil;
    this.validations[ValidationFunction.GetArguments] = validateGetArgumentsFn;
    this.validations[ValidationFunction.AddToResult] = validateAddToResultFn;

    this.validations[ValidationFunction.IsArray] = validateIsArray;

    this.reset();

  }

  /**
   * For each function.
   * @param fn 
   * @param options 
   * @param args 
   */
  public do<U>(fn: SerializedAsyncDoFn<U>,
    options: SerializedAsyncOptions = { until: -1 },
    ...args: any[]): Promise<SerializedAsyncResult[]> {

    if (SerializedAsync.instanceDoRunning) {

      return Promise.reject(
        new Error('Only single do call is allowed for the same instance at a time.')
      );

    }

    SerializedAsync.instanceDoRunning = true;

    return this.$$do<U>(fn, options, ...args);

  }

  /**
   * Function to reset internal data.
   */
  private reset(): void {

    this.currentIteration = -1;
    this.doResult = [];
    this.doStarted = false;

  }

  /**
   * Private do function.
   * @param fn 
   * @param options 
   * @param args 
   */
  private $$do<U>(fn: SerializedAsyncDoFn<U>,
    options: SerializedAsyncOptions,
    ...args: any[]): Promise<SerializedAsyncResult[]> {

    try {

      this.validations[ValidationFunction.Until](options.until);

    } catch (err) {

      return Promise.reject(err);

    }

    // If this is the first iteration, reset the data.
    if (!this.doStarted) {

      // Reset the data.
      this.reset();

    }

    // Mark 'do' start.
    this.doStarted = true;

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
    if (this.validations[ValidationFunction.GetArguments](options.getArguments, true) &&
      options.getArguments /* <-- Get rid of TS warning */) {

      // Use the provided getArguments callback to fetch the arguments.
      fnArgs = options.getArguments(this.currentIteration);

      try {

        this.validations[ValidationFunction.IsArray](fnArgs);

      } catch (err) {

        return Promise.reject(err);

      }

    } else {

      // Use the arguments passed to the do.
      fnArgs = args;

    }

    // Return the Promise, so that the 'do' can be chained using the 'then' callback.
    return new Promise((resolve: (p: any[]) => void, reject: (p: any) => void) => {

      // Call the async callback fn by passing the arguments.
      Promise.resolve(fn(...fnArgs))
        .then((response: any) => {

          // Check whether addToResult callback was provided or not.
          if (this.validations[ValidationFunction.AddToResult](options.addToResult, true) &&
            options.addToResult /* <-- Get rid of TS warning */) {

            // Check whether result should be pushed to the result array or not.
            if (options.addToResult(response, ...fnArgs)) {

              // Push the result into the response array.
              this.doResult.push({
                res: response,
                args: fnArgs
              });

            }

          } else {  // Else, add the result to the result array.

            // Push the result into the response array.
            this.doResult.push({
              res: response,
              args: fnArgs
            });

          }

          // Call loopAsync recursively by passing the arguments.
          if ((typeof options.until === 'function' && options.until(this.currentIteration)) ||
            ((typeof options.until === 'number') && (this.currentIteration < (options.until - 1)))) {

            // Increment the iteration count.
            this.currentIteration++;

            // Recursively call $$do.
            return this.$$do(fn, options, ...args);

          }

          // Return resolved data.
          return Promise.resolve(this.doResult);

        })
        .then((response: any[]) => {

          // Resolve the main Promise.
          resolve(response);
          // Allow next do call.
          SerializedAsync.instanceDoRunning = false;
          // Reset the data.
          this.reset();

        })
        .catch((error: any) => {

          // Reject the main Promise.
          reject(error);
          // Allow next do call.
          SerializedAsync.instanceDoRunning = false;
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