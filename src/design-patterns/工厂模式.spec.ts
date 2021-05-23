describe('工厂模式', () => {
  test('工厂模式', () => {
    interface VehicleOptions {
      doors: number
      state: string
      color: string
    }

    // A constructor for defining new cars
    function Car(options: VehicleOptions) {
      // some defaults
      this.doors = options.doors || 4
      this.state = options.state || 'brand new'
      this.color = options.color || 'silver'

    }

    // A constructor for defining new trucks
    function Truck(options: VehicleOptions) {
      this.doors = options.state || 'used'
      this.state = options.state || 'brand old'
      this.color = options.color || 'blue'
    }


    class Vehicle {
      private static vehicleClass = Car

      public static createVehicle(type: 'car' | 'truck', options: VehicleOptions) {
        let TargetClass = this.vehicleClass
        switch (type) {
          case 'car':
            break
          case 'truck':
            TargetClass = Truck
        }
        return new TargetClass(options)
      }
    }

    let res = Vehicle.createVehicle('car', {
      doors: 10,
      state: 'foo',
      color: 'red'
    })

    let res2 = Vehicle.createVehicle('truck', {
      doors: 20,
      state: 'bar',
      color: 'green'
    })

    expect(res).toBeInstanceOf(Car)
    expect(res2).toBeInstanceOf(Truck)
  })
})
