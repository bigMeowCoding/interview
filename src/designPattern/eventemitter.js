export default class Eventemitter {
  constructor() {
    this.events = {};
  }
  on(eventName, cb) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(cb);
  }
  remove(eventNam, cb) {
    const listeners = this.events[eventNam];
    if (listeners) {
      const index = listeners.findIndex((l) => l === cb);
      listeners.splice(index, 1);
    }
  }
  emit(eventName, ...args) {
    const listeners = this.events[eventName];
    listeners.forEach((cb) => {
      cb(...args);
    });
  }
  once(eventName, cb) {
    const that=this
    const func =(...args)=> {
      cb(...args)
      that.remove(eventName,func)
    }
    this.on(eventName,func)
  }
}
// const event = new Eventemitter();
// event.once('sum',(a,b)=> {
//   console.log('sum',a+b)
// })
// // event.emit('sum',1,2)
// event.emit('sum',3,4)

console.log([1,2,3].filter((a)=>a>2))
