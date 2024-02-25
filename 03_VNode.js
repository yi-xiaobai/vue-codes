//* 什么是vNode
//* VNode是一颗以JS对象作为基础的树 用对象的属性来描述节点 实际上只是一层对真实DOM的抽象
//? 由于VNode是以JS对象作为基础的 故不依赖真实平台环境 所以有了跨平台的能力 比如 浏览器 Node

class VNode {
  /**
   *
   * @param {*} tag 当前节点的标签名
   * @param {*} data 节点的数据信息
   * @param {*} children 子节点
   * @param {*} text 节点的文本
   * @param {*} elm 真实dom节点
   */
  constructor(tag, data, children, text, elm) {
    this.tag = tag;
    this.data = data;
    this.children = children;
    this.text = text;
    this.elm = elm;
  }
}

// 创建一个空节点
function createEmptyNode() {
  const vNode = new VNode();
  vNode.text = "";
  return vNode;
}

// 创建一个文本节点
function createTextNode(val) {
  return new VNode(undefined, undefined, undefined, String(val));
}

// 克隆一个VNode节点
function cloneVNode(node) {
  const cloneVnode = new VNode(
    node.tag,
    node.data,
    node.childre,
    node.text,
    node.elm
  );
  return cloneVnode;
}
