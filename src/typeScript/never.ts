interface Foo {
  type: 'foo'
}

interface Bar {
  type: 'bar'
}

interface Baz {
  type: 'baz'
}

type All = Foo | Bar | Baz

function handleValue(val: All) {
  switch (val.type) {
    case 'foo':
      // 这里 val 被收窄为 Foo
      break
    case 'bar':
      // val 在这里是 Bar
      break
    default:
      // val 在这里是 never

      break
  }
}
