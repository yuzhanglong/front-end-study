class SuperType {
  constructor() {
  }
}


class SubType extends SuperType {
  constructor() {
    super();
  }
}


const instance1 = new SubType();
