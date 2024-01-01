import _ from 'lodash-es'

function letTest() {
    let x = 1;
    if (true) {
        let x = 2;  // 不同的变量
        console.log(x);  // 2
    }
    console.log(x);  // 1
}
// letTest()

function bar() {
    console.log(myName)
}
function foo() {
    var myName = " 极客邦 "
    bar()
}

console.log(myName)
let myName = " 极客时间 "
foo()
var objects = [{ 'a': 1 }, { 'b': 2 }];

var shallow = _.clone(objects);
console.log(shallow[0] === objects[0]);
// => true
