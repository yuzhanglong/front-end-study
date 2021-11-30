describe('观察者模式和发布订阅模式', () => {
  test('观察者模式', () => {
    interface Observer {
      update: (...args) => void
    }

    class Subject {
      private readonly observerList: Observer[]

      constructor() {
        this.observerList = []
      }

      addObserver(observer: Observer) {
        this.observerList.push(observer)
      }

      removeObserver(observer) {
        const index = this.observerList.findIndex(observer)
        this.observerList.splice(index, 1)
      }

      notify(context) {
        for (let observerListElement of this.observerList) {
          observerListElement.update(context)
        }
      }
    }

    const ob1 = jest.fn()
    const ob2 = jest.fn()
    const ob3 = jest.fn()

    const obj = new Subject()
    obj.addObserver({
      update: ob1,
    })

    obj.addObserver({
      update: ob2,
    })

    obj.addObserver({
      update: ob3,
    })

    obj.notify('hello world')

    expect(ob1).toBeCalledWith('hello world')
    expect(ob2).toBeCalledWith('hello world')
    expect(ob3).toBeCalledWith('hello world')
  })

  test('发布订阅模式', () => {
    class Foo {
      private topicSubscribers = {}

      subscribe(topic, callback) {
        console.log(`New subscription for topic [${topic}] coming!`)
        if (this.topicSubscribers[topic]) {
          this.topicSubscribers[topic].push(callback)
        } else {
          this.topicSubscribers[topic] = [callback]
        }
      }

      notify(topic, params) {
        if (this.topicSubscribers[topic]) {
          const subscribers = this.topicSubscribers[topic]

          for (let i = 0; i < subscribers.length; i++) {
            try {
              subscribers[i] && subscribers[i](params)
            } catch (error) {
              console.error(error)
              // 避免影响其他subscriber
            }
          }
        }
      }
    }

    const instance = new Foo()
    const subscriber1 = jest.fn()
    const subscriber2 = jest.fn()

    instance.subscribe('topic1', subscriber1)
    instance.subscribe('topic2', subscriber2)

    instance.notify('topic1', 'foo')
    instance.notify('topic2', 'bar')

    expect(subscriber1).toBeCalledWith('foo')
    expect(subscriber2).toBeCalledWith('bar')
  })
})
