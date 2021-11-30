// ThisType<Type> 通过 ThisType
// 可以方便地控制 this 类型。
// ps.它只有在 --noImplicitThis 的选项下才有效。
var helperFunctions = {
  hello: function () {
    this.logError('Error: Something went wrong!')
    this.update() // 编译时会发现错误：Property 'update' does not exist on type 'HelperThisValue'.
  },
}
