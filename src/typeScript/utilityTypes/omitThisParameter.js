function addX(y) {
  return this.x + y
}
var val = {
  x: 123,
  addX: addX,
}
val.addX(10)
var unsafeAddX = addX
unsafeAddX(10)
//# sourceMappingURL=omitThisParameter.js.map
