class Schedule {
  constructor(limit) {
    this.limit = limit;
    this.running = 0;
    this.tasks = [];
  }
  addTask(time, message) {
    const task = function () {
      return new Promise((res) => {
        setTimeout(() => {
          console.log(message);
          res(true);
        }, time);
      });
    };
    this.tasks.push(task);
    this.run();
  }
  run() {
    if (this.running < this.limit && this.tasks.length) {
      const task = this.tasks.shift();
      this.running++;
      task().then(() => {
        this.running--;
        this.run();
      });
    }
  }
}
const schedule = new Schedule(2);

schedule.addTask(3000, "1");
schedule.addTask(1000, "2");
schedule.addTask(2000, "3");
schedule.addTask(400, "4");
