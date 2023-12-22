// retry without crashing
// this can cause infinite loop

// call signature
// retry(fetch, 1000)(url).then(console.log).catch(console.error)
type Fn<Args extends any[], ReturnType> = (
  ...args: Args
) => Promise<ReturnType>;
function retry<Args extends any[], ReturnType>(
  callback: Fn<Args, ReturnType>,
  delay?: number
) {
  return function (...args: Args): Promise<ReturnType> {
    return new Promise((resolve, _) => {
      // This is named IIFE. Needed to recursively self-invoked.
      // Not outer 'retry' function.
      // setTimeout will prevevnt stack overflow.
      return (function retry() {
        callback(...args)
          .then(resolve)
          .catch(() => {
            setTimeout(() => {
              retry();
            }, delay || 1000);
          });
      })();
    });
  };
}
