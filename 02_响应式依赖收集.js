class Vue {
  constructor(options) {
    this._data = options.data;
    observer(this._data);
    new Watcher();

    // 模拟render的过程 获取值
    console.log("==>Get render", this._data.name);
  }
}

// 对data进行响应式处理
function observer(value) {
  if (!value || typeof value !== "object") {
    return;
  }

  Object.keys(value).forEach((key) => {
    defineReactive(value, key, value[key]);
  });
}

function defineReactive(obj, key, val) {
  // 依赖收集

  // 创建一个订阅者
  const dep = new Dep();

  Object.defineProperty(obj, key, {
    configurable: true, // 允许修改和删除
    enumerable: true, // 枚举

    // 获取值
    get: function reactiveGetter() {
      // 将获取值的数据全部添加进订阅者中 后续变化好进行通知
      dep.addSub(Dep.target);
      return val;
    },

    // 改变值
    set: function reactiveSetter(newVal) {
      // 值相同 不进行变化
      if (newVal === val) {
        return;
      }
      // 将以前的值进行改变
      val = newVal;
      // 通知观察者 数据发生变化了 视图也要更新
      dep.notify();
    },
  });
}

// 观察者
class Watcher {
  constructor() {
    Dep.target = this;
  }
  update() {
    console.log("更新啦更新啦");
  }
}

// 订阅者
class Dep {
  constructor() {
    this.subs = [];
  }

  // 添加观察者
  addSub(sub) {
    this.subs.push(sub);
  }

  // 通知观察者 数据发生变化了
  notify() {
    this.subs.forEach((sub) => {
      sub.update();
    });
  }
}

Dep.target = null;

let o = new Vue({
  data: {
    name: "llyy",
  },
});

o._data.name = "1232131";
