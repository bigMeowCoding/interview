class LazyMan {
  #tasks = [];

  constructor(name) {
    this.name = name;
    this.#addTask(() => console.log(`Hi I am ${this.name}`));
    queueMicrotask(() => this.#run());
  }

  sleep(time) {
    this.#addTask(async () => {
      await this.#sleep(time);
    });
    return this;
  }

  sleepFirst(time) {
    this.#addTask(async () => {
      await this.#sleep(time);
    }, true);
    return this;
  }

  eat(food) {
    this.#addTask(() => console.log(`Eat ${food}`));
    return this;
  }

  #addTask(task, atFirst = false) {
    if (atFirst) {
      this.#tasks.unshift(task);
    } else {
      this.#tasks.push(task);
    }
  }

  async #run() {
    while (this.#tasks.length > 0) {
      const task = this.#tasks.shift();
      try {
        await task();
      } catch (err) {
        console.error("Task error:", err);
      }
    }
  }

  #sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }
}

// 用法示例
const hank = new LazyMan("Hank");
hank.sleep(1000).eat("dinner");
// hank.eat('dinner').sleepFirst(1000);
