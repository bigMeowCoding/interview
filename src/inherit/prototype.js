// 原型继承
const person ={
    name:'lilei',
    age:18
}

const another = Object.create(person)
another.name='zhangsan'

console.log(another.name,another.age)