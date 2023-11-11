const publish = {
  events: {},
  addEvent(key, cb) {
    if (!this.events[key]) {
      this.events[key] = [];
    }
    this.events[key].push(cb);
  },
  removeEvent(key, cb) {
    const cbs = this.events[key];
    if (cbs && cbs.length) {
      if (!cb) {
        this.events[key] = [];
        return;
      }
      const index = cbs.findIndex((item) => {
        return item === cb;
      });

      if (index !== -1) {
        cbs.splice(index, 1);
      }
    }
  },
  trigger(key, data) {
    const cbs = this.events[key] || [];
    cbs.forEach((item) => {
      item(data);
    });
  },
};

const cb1 = (d) => {
  console.log("motherFuck", d);
};
publish.addEvent("fire", cb1);

publish.addEvent("fire", (d) => {
  console.log("wawawa", d);
});

publish.trigger("fire", "data");
publish.removeEvent("fire");
publish.trigger("fire", "data");
