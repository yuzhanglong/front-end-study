describe('Object.is', function () {
  test('Object.is() 方法判断两个值是否为同一个值', () => {
    expect(Object.is(undefined, undefined)).toBeTruthy();
    expect(Object.is(null, undefined)).toBeFalsy();
    expect(Object.is(null, null)).toBeTruthy();
    expect(Object.is(true, true)).toBeTruthy();
    expect(Object.is(false, false)).toBeTruthy();
    expect(Object.is(+0, -0)).toBeFalsy();
    expect(Object.is(0, 0)).toBeTruthy();
    expect(Object.is(+0, +0)).toBeTruthy();
    expect(Object.is('hello', 'hello')).toBeTruthy();
    expect(Object.is({}, {})).toBeFalsy();
    expect(Object.is(NaN, NaN)).toBeTruthy();
    expect(Object.is(Number.NaN, NaN)).toBeTruthy();
  });
});
