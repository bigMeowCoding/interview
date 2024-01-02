class LazyMan {
  constructor(name) {
    this.name = name;
    this.tasks = [];
    this.sayName();
    setTimeout(this.run.bind(this), 0);
  }
  sleep(time, atFirst = false) {
    this.addTask(() => {
      return new Promise((res) => {
        setTimeout(() => {
          res(true);
        }, time);
      });
    }, atFirst);
    return this;
  }
  sleepFirst(time) {
    this.sleep(time, true);
  }
  sayName() {
    this.addTask(() => {
      console.log(`hi I am ${this.name}`);
    });
    return this;
  }
  addTask(cb, atFirst = false) {
    const task = () =>
      new Promise((res) => {
        const result = cb();
        if (result && result.then) {
          result.then(() => {
            res(true);
          });
        } else {
          res(true);
        }
      });
    if (atFirst) {
      this.tasks.unshift(task);
    } else {
      this.tasks.push(task);
    }
  }
  run() {
    if (!this.tasks.length) {
      return;
    }
    const task = this.tasks.shift();
    task().then(() => {
      this.run();
    });
  }

  eat(food) {
    this.addTask(() => {
      console.log(`eat ${food}`);
    });
    return this;
  }
}
//const hank = new LazyMan("Hank");
const hank = new LazyMan("Hank");
hank.sleep(1000).eat("dinner");
// hank.eat("dinner").sleepFirst(1000);
