// 原型链继承
function superType() {
    this.color=['red']
}
function subType() {}
subType.prototype = new superType()
subType.prototype.constructor=subType

const type = new subType()
console.log(type.color)
type.color.push('black')
const t2 = new subType()
console.log(t2.color)

