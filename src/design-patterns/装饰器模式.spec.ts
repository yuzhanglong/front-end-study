import 'reflect-metadata'

type Constructable<R = any> = {
  new(...args: any[]): R;
};

// 尝试实现一个依赖注入
describe('装饰器模式', function() {
  test('实现依赖注入', () => {
    const classPool = []

    function Injectable(Constructor: Function) {
      const paramsTypes: any[] = Reflect.getMetadata('design:paramtypes', Constructor)
      if (classPool.includes(Constructor)) {
        return
      }

      if (paramsTypes && paramsTypes.length) {
        for (let paramsType of paramsTypes) {
          if (paramsType === Constructor) {
            throw new Error('不可以依赖自身')
          } else if (!classPool.includes(paramsType)) {
            throw new Error('该依赖没有添加 @Injectable 注解，无法注入')
          }
        }
      }
      classPool.push(Constructor)
    }

    function create<T>(Constructor: Constructable): T {
      const paramsTypes: any[] = Reflect.getMetadata('design:paramtypes', Constructor)
      const paramInstances = paramsTypes.map((item) => {
        if (!classPool.includes(item)) {
          throw new Error('无法注入')
        } else if ((item as any[]).length) {
          return create(item)
        } else {
          return new (item as any)()
        }
      })
      return new Constructor(...paramInstances)
    }

    @Injectable
    class B {

    }

    @Injectable
    class C {

    }

    @Injectable
    class D {
      public b: B
      public c: C

      public constructor(b: B, c: C) {
        this.b = b
        this.c = c
      }
    }

    @Injectable
    class A {
      public b: B
      public c: C
      public d: D

      public constructor(b: B, c: C, d: D) {
        this.b = b
        this.c = c
        this.d = d
      }
    }

    let a = create<A>(A)
    expect(a.b).toBeInstanceOf(B)
    expect(a.c).toBeInstanceOf(C)
    expect(a.d).toBeInstanceOf(D)
    expect((a.d as D).b).toBeInstanceOf(B);
    expect((a.d as D).c).toBeInstanceOf(C);
  })
})

