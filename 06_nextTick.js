/**
 *? 为什么需要异步更新策略?
 ** 例如：点击按钮时循环一千次增加data中值 如果修改的是真实DOM
 ** 那么DOM会被更新1000次 这样的方法太低效了也太影响性能了
 ** Vue默认触发数据的setter时 会将对应的Wather对象添加进一个queue中
 ** 等下一个tick时 会进行遍历 执行操作
 */

let uid = 0;
class Wather {
  constructor() {
    this.id = ++uid;
  }

  update() {
    console.log("watch" + this.id + "更新啦");
    queueWatcher(this);
  }

  run() {
    console.log("watch" + this.id + "视图更新啦");
  }
}

let callbacks = [];
let pending = false;
function nextTick(cb) {
  // 将回调函数添加进数组中
  callbacks.push(cb);

  // 如果已经有任务被推送到回调队列中 那么就不需要再次推送了
  if (!pending) {
    pending = true;
    setTimeout(flushCallbacks, 0);
  }
}

function flushCallbacks() {
  pending = false;
  const copyed = callbacks.slice(0);
  callbacks.length = 0;
  for (let index = 0; index < copyed.length; index++) {
    // 执行回调函数
    copyed[index]();
  }
}

let has = {};
let queue = [];
let waiting = false;

function queueWatcher(watcher) {
  const id = watcher.id;
  // 当前watcher对象还没有进入队列中
  if (!has[id]) {
    // 标记进入队列中
    has[id] = true;
    // 添加watcher对象进入队列
    queue.push(watcher);
  }

  if (!waiting) {
    waiting = true;
    nextTick(flushSchedulerQueue);
  }
}

function flushSchedulerQueue() {
  let watcher, id;

  for (let index = 0; index < queue.length; index++) {
    watcher = queue[index];
    id = watcher.id;
    has[id] = null;
    // 执行watcher的run方法 更新视图
    watcher.run();
  }
}

(function () {
  let watcher1 = new Wather();
  let watcher2 = new Wather();

  watcher1.update();
  watcher1.update();
  watcher2.update();
  

  /**
   * 输出结果：
   * watch1更新啦
    watch1更新啦
    watch2更新啦
    watch1视图更新啦
    watch2视图更新啦

   * 相同的watcher对象只会添加一个进入队列中
   */
})();
