// 构造函数继承
function superType() {
    this.color=['red']
}
function subType() {
    superType.call(this)
}

const type = new subType()
type.color.push('black')
console.log(type.color)

const t2 = new subType()
console.log(t2.color)
