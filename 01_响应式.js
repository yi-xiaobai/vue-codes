function cb(val) {
  console.log("视图更新了", val);
}



const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: () => { },
  set: () => { }
}

function _proxy(target, sourceKey, key) {
  // console.log('==>Get this', this);
  sharedPropertyDefinition.get = function GetterProxy() {
    return this[sourceKey][key]
  }

  sharedPropertyDefinition.set = function SetterProxy(val) {
    this[sourceKey][key] = val
  }

  Object.defineProperty(target, key, sharedPropertyDefinition)
}


// 模拟vue2实现访问data的数据进行代理
function initData(vm) {
  // 获取data属性
  const { data } = vm.$options
  vm._data = data

  // 获取data对象中的keys列表
  const keys = Object.keys(data)
  let i = keys.length
  while (i--) {
    _proxy(vm, '_data', keys[i])
  }
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
    this.$options = options
    // new Vue的时候 会对data进行响应式
    this._data = options.data;
    observer(this._data);
    initData(this)
  }
}

let o = new Vue({
  data: {
    name: "yyll",
    age: 18
  },
});

// console.log(o._data.name);
console.log(o.age);
o._data.name = "hahah";
