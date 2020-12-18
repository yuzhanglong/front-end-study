var Point2D = (function () {
    function Point2D(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point2D;
}());
function newPoint(pointConstructor, x, y) {
    return new pointConstructor(x, y);
}
var point = newPoint(Point2D, 2, 2);
var a = [1, 2];
//# sourceMappingURL=constructorParameters.js.map