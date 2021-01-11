const myInstanceOf = (A, B) => {
  if (!A) return false;
  return A.__proto__ === B.prototype ? true : myInstanceOf(A.__proto__, B);
}

console.log(myInstanceOf([], Array));
console.log(myInstanceOf([], Function));
console.log(myInstanceOf(Array, Object));

