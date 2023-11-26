// 寄生继承
const person = {
  name: "lilei",
  age: 18,
};

function createPerson() {
  const another = Object.create(person);
  another.sayName = function () {
    console.log(this.name);
  };
  another.getAge = function () {
    console.log(this.age);
  };
  return another;
}

const a1 = createPerson();
a1.name = "zhangsan";
a1.sayName();
a1.getAge()
const a2 = createPerson();
a2.name='lisi'
a2.sayName();
a2.getAge()
// 寄生组合继承
