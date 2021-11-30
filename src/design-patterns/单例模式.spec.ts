describe('单例模式', () => {
  test('单例模式 example', () => {
    const mySingleton = (function () {
      // 实例存储了对 Singleton 的引用
      let instance = null

      function init() {
        // Singleton
        // Private methods and variables
        function privateMethod() {
          console.log('I am private')
        }

        const privateVariable = 'Im also private'

        const privateRandomNumber = Math.random()
        return {
          // Public methods and variables
          publicMethod: function () {
            console.log('The public can see me!')
          },
          publicProperty: 'I am also public',
          getRandomNumber: function () {
            return privateRandomNumber
          },
        }
      }

      return {
        // Get the Singleton instance if one exists
        // or create one if it doesn't
        getInstance: function () {
          if (!instance) {
            instance = init()
          }
          return instance
        },
      }
    })()

    const myBadSingleton = (function () {
      // Instance stores a reference to the Singleton
      let instance
      function init() {
        // Singleton
        const privateRandomNumber = Math.random()
        return {
          getRandomNumber: function () {
            return privateRandomNumber
          },
        }
      }

      return {
        // Always create a new Singleton instance
        getInstance: function () {
          instance = init()
          return instance
        },
      }
    })()

    // Usage:
    const singleA = mySingleton.getInstance()
    const singleB = mySingleton.getInstance()
    expect(singleA.getRandomNumber() === singleB.getRandomNumber()).toBeTruthy()

    const badSingleA = myBadSingleton.getInstance()
    const badSingleB = myBadSingleton.getInstance()
    expect(
      badSingleA.getRandomNumber() !== badSingleB.getRandomNumber()
    ).toBeTruthy()
  })
})
