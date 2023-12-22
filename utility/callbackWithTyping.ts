// Curried function's args and return are fully typed
type Callback<Args extends any[], ReturnType> = (...args: Args) => ReturnType;
function curry<Args extends any[], ReturnType>(
  callback: Callback<Args, ReturnType>
) {
  return function (...args: Args): ReturnType {
    // Do whatever you want to do
    return callback(...args);
  };
}
const add = (a: number, b: number) => a + b;
const curriedAdd = curry(add);
console.log(curriedAdd(1, 2));

// Without proper typing when using callback
function curryWithoutType(callback) {
  return function (...args) {
    return callback(...args);
  };
}
const withoutTypeAdd = curryWithoutType(add);
console.log(withoutTypeAdd(1, 2));
