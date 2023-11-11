class Subject {
  constructor() {
    this.observers = [];
  }
  addObserver(observer) {
    this.observers.push(observer);
  }
  removeObserver(observer) {
    const index = this.observers.findIndex((item) => {
      return item === observer;
    });
    index !== -1 && this.observers.splice(index, 1);
  }
  notify(data) {
    this.observers.forEach((item) => {
      item.update(data);
    });
  }
}
class Observer {
  constructor() {}
  update(data) {
    console.log("hhh", data);
  }
}
const sub = new Subject();
const ob1 = {
  update(data) {
    console.log("ob1", data);
  },
};
const ob2 = {
  update(data) {
    console.log("ob2", data);
  },
};
sub.addObserver(ob1);
sub.addObserver(ob2);

sub.notify("cao===");
sub.notify("nima===");
sub.removeObserver(ob1);
sub.removeObserver(ob2);

sub.notify("bi===");
