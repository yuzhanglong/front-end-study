describe('享元模式', () => {
  interface Shape {
    draw: () => void
  }

  class Circle implements Shape {
    public color: string
    public x: number
    public y: number
    public radius: number

    constructor(color: string) {
      this.color = color
    }

    draw(): void {
      console.log('Circle: Draw() [Color : ' + this.color
        + ', x : ' + this.x + ', y :' + this.y + ', radius :' + this.radius)
    }
  }


  class ShapeFactory {
    private circleMap = new Map()

    public getCircle(color: string): Circle {
      let circle = this.circleMap.get(color)

      if (!circle) {
        circle = new Circle(color)
        this.circleMap.set(color, circle)
        console.log('Creating circle of color : ' + color)
      }
      return circle
    }
  }


  test('享元模式', () => {
    // 享元模式的特点在于它运用共享技术避免了大量对象的创建
    const factory = new ShapeFactory()
    const c1 = factory.getCircle('red')
    c1.draw()
    const c2 = factory.getCircle('red')
    c2.draw()
    const c3 = factory.getCircle('red')
    c3.draw()
    expect(c1).toBe(c2)
    expect(c1).toBe(c3)
    expect(c2).toBe(c3)
  })
})
