function cb(val) {
  console.log("视图更新了", val);
}

/**
 *
 * @param {object} value
 */
function observer(value) {
  if (!value || typeof value !== "object") return;

  // 进行data响应式处理
  Object.keys(value).forEach((key) => {
    defineReactive(value, key, value[key]);
  });
}

function defineReactive(obj, key, val) {
  Object.defineProperty(obj, key, {
    configurable: true, // 可以被删除或者修改
    enumerable: true, // 属性可以被枚举
    get: function reactiveGetter() {
      return val;
    },
    set: function reactiveSetter(newVal) {
      if (newVal === val) return;
      val = newVal;
      cb(newVal);
    },
  });
}

class Vue {
  // 构造函数
  constructor(options) {
    // new Vue的时候 会对data进行响应式
    this._data = options.data;
    observer(this._data);
  }
}

let o = new Vue({
  data: {
    name: "yyll",
  },
});

console.log(o._data.name);
o._data.name = "hahah";
