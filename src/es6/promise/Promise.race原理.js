const isPromise = (p) => {
  if ((typeof p === "object" && p !== null) || typeof p === "function") {
    return typeof p.then === "function";
  }
  return false;
}

Promise.race = (promises) => {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      let currentPromise = promises[i];
      if (isPromise(currentPromise)) {
        currentPromise.then(resolve, reject)
      } else {
        resolve(currentPromise);
      }
    }
  })
}
