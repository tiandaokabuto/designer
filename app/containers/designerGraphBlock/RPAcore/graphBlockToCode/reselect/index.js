function defaultEqualityCheck(a, b) {
  return a === b;
}

function areArgumentsShallowlyEqual(equalityCheck, prev, next) {
  if (prev === null || next === null || prev.length !== next.length) {
    return false;
  }

  // compare padding and statement only
  const length = prev.length;
  for (let i = 0; i < 2; i++) {
    if (!equalityCheck(prev[i], next[i])) {
      return false;
    }
  }

  return true;
}

function mergeMap(mapOne, mapTwo) {
  for (const [key, value] of mapTwo) {
    mapOne.set(key, value);
  }
}

export default function memoize(func, equalityCheck = defaultEqualityCheck) {
  let lastArgs = null;
  let lastResult = null;
  let moduleMap = null;
  return function () {
    if (
      arguments[1].hasModified ||
      !areArgumentsShallowlyEqual(equalityCheck, lastArgs, arguments)
    ) {
      lastResult = func.apply(null, arguments);
      if (Array.isArray(lastResult)) {
        moduleMap = lastResult[1];
      } else {
        moduleMap = arguments[3];
      }
      arguments[1].hasModified = false;
    } else {
      if (Array.isArray(lastResult)) {
        mergeMap(arguments[3], moduleMap);
      }
    }
    lastArgs = arguments;
    arguments[2].output = Array.isArray(lastResult)
      ? lastResult[0]
      : lastResult;
    return lastResult;
  };
}
