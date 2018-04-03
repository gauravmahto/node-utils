/**
 * Copyright 2018 - Author gauravm.git@gmail.com
 */

// Description:
// Utility to executes multiple async job one after another.

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

    throw new Error("Invalid 'until' option provided.");

  }

  return true;

}

function validateGetArgumentsFn(item: any, noThrow: boolean = false): Error | boolean {

  if (typeof item !== 'function') {

    if (noThrow) {

      return false;

    }

    throw new Error("Invalid 'getArguments' function provided.");

  }

  return true;

}

function validateAddToResultFn(item: any, noThrow: boolean = false): Error | boolean {

  if (typeof item !== 'function') {

    if (noThrow) {

      return false;

    }

    throw new Error("Invalid 'addToResult' function provided.");

  }

  return true;

}

function validateIsArray(item: any, noThrow: boolean = false): Error | boolean {

  if (!Array.isArray(item)) {

    if (noThrow) {

      return false;

    }

    throw new Error('Invalid type. Expected an Array.');

  }

  return true;

}

// endregion - Validation functions.

export interface SerializedAsyncTasksOptions {

  addToResult?: boolean | ((item: any, ...originalItems: any[]) => boolean);
  executionContext?: any;
  getArguments?: (index: number) => any[];
  until?: number | ((index: number) => boolean);

}

export interface SerializedAsyncTasksResult {

  args: any | any[];  // tslint:disable-line
  res: any;

}

export type SerializedAsyncTasksDoFn = (...args: any[]) => any;

export declare class SerializedAsyncTasks {

  private constructor();

  /**
   * For each function.
   * @param fn
   * @param options
   * @param args
   */
  public do(fn: SerializedAsyncTasksDoFn,
    options?: SerializedAsyncTasksOptions,
    ...args: any[]): Promise<SerializedAsyncTasksResult[]>;

}

export function getSerializedAsyncTasksInstance(): SerializedAsyncTasks {

  class SerializedAsyncTasksPrivate {

    private static instanceDoRunning = false;

    private readonly validations: { [k: string]: validateFn } = {};
    private currentIteration: number;
    private doResult: SerializedAsyncTasksResult[];

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
    public do(fn: SerializedAsyncTasksDoFn,
      options: SerializedAsyncTasksOptions = {},
      ...args: any[]): Promise<SerializedAsyncTasksResult[]> {

      if (SerializedAsyncTasksPrivate.instanceDoRunning) {

        return Promise.reject(
          new Error('Only single do call is allowed for the same instance at a time.')
        );

      }

      SerializedAsyncTasksPrivate.instanceDoRunning = true;

      options = Object.assign(this.getDefaultOptions(), options);

      return this.$$do(fn, options, ...args);

    }

    private getDefaultOptions(): SerializedAsyncTasksOptions {

      return {
        addToResult: true,
        executionContext: null,
        until: -1
      };

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
    private $$do(fn: SerializedAsyncTasksDoFn,
      options: SerializedAsyncTasksOptions,
      ...args: any[]): Promise<SerializedAsyncTasksResult[]> {

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
      if (this.validations[ValidationFunction.GetArguments](options.getArguments, true)) {

        // Use the provided getArguments callback to fetch the arguments.
        fnArgs = options.getArguments!(this.currentIteration);

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
        Promise.resolve(fn.apply(options.executionContext, fnArgs))
          .then((response: any) => {

            // Check whether addToResult callback was provided or not.
            if (typeof options.addToResult === 'boolean') {

              if (options.addToResult) {

                // Push the result into the response array.
                this.doResult.push({
                  res: response,
                  args: fnArgs
                });

              }

            } else if (this.validations[ValidationFunction.AddToResult](options.addToResult, true)) {

              // Check whether result should be pushed to the result array or not.
              if (options.addToResult!(response, ...fnArgs)) {

                // Push the result into the response array.
                this.doResult.push({
                  res: response,
                  args: fnArgs
                });

              }

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
            SerializedAsyncTasksPrivate.instanceDoRunning = false;
            // Reset the data.
            this.reset();

          })
          .catch((error: any) => {

            // Reject the main Promise.
            reject(error);
            // Allow next do call.
            SerializedAsyncTasksPrivate.instanceDoRunning = false;
            // Reset the data.
            this.reset();

          });

      });

    }

  }

  return (new SerializedAsyncTasksPrivate()) as SerializedAsyncTasks;

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
