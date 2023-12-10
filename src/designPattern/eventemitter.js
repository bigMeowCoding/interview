export default class Eventemitter {
  constructor() {
    this.events = {};
  }
  on(eventName, cb) {
    const listeners = this.events[eventName];
    if (!listeners) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(cb);
  }
  remove(eventNam, cb) {
    if (!this.events[eventNam]) {
      return;
    }
    const index = this.events[eventNam].findIndex((listener) => {
      return listener === cb;
    });
    this.events[eventNam].splice(index, 1);
  }
  emit(eventName, ...args) {
    const listener = this.events[eventName] || [];
    listener.forEach((listener) => {
      listener(...args);
    });
  }
  once(eventName, cb) {
    const that = this;
    const fn = (...args) => {
      cb(...args);
      that.remove(eventName, fn);
    };
    this.on(eventName, fn);
  }
}
// const event = new Eventemitter();
// event.on('sum',(a,b)=> {
//   console.log('sum',a+b)
// })
// event.emit('sum',1,2)
// event.emit('sum',3,4)