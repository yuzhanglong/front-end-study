describe('工厂模式', () => {
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

  test('工厂模式', () => {
    class Vehicle {
      private static vehicleClass = Car

      public static createVehicle(
        type: 'car' | 'truck',
        options: VehicleOptions
      ) {
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
      color: 'red',
    })

    let res2 = Vehicle.createVehicle('truck', {
      doors: 20,
      state: 'bar',
      color: 'green',
    })

    expect(res).toBeInstanceOf(Car)
    expect(res2).toBeInstanceOf(Truck)
  })

  test('抽象工厂模式', () => {
    class VehicleFactory {
      private types = {}

      getVehicle(type, customizations) {
        const Vehicle = this.types[type]
        return Vehicle ? new Vehicle(customizations) : null
      }

      registerVehicle(type, Vehicle) {
        this.types[type] = Vehicle
      }
    }

    const abstractVehicleFactory = new VehicleFactory()

    abstractVehicleFactory.registerVehicle('car', Car)
    abstractVehicleFactory.registerVehicle('truck', Truck)

    // Instantiate a new car based on the abstract vehicle type
    const car = abstractVehicleFactory.getVehicle('car', {
      color: 'lime green',
      state: 'like new',
    })

    // Instantiate a new truck in a similar manner
    const truck = abstractVehicleFactory.getVehicle('truck', {
      wheelSize: 'medium',
      color: 'neon yellow',
    })
    expect(car).toBeInstanceOf(Car)
    expect(truck).toBeInstanceOf(Truck)
  })
})
