class Dog {
  makeSound() {
    console.log("wang");
  }
}

class Cat {
  makeSound() {
    console.log("miao");
  }
}

class AnimalFactory {
  makeAnimal() {}
}

class DogFactory extends AnimalFactory {
  makeAnimal() {
    return new Dog();
  }
}

class CatFacory extends AnimalFactory {
  makeAnimal() {
    return new Cat();
  }
}

const animal1 = new DogFactory().makeAnimal();
const animal2 = new CatFacory().makeAnimal();

animal1.makeSound();
animal2.makeSound();
