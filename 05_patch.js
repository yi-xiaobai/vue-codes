/**
 ** 数据更新视图
 ** 对modal进行操作时 会触发Watcher对象 会调用update来修改视图
 ** 最终将是新产生VNode 和老的VNode 进行patch的一个过程
 ** 比对出差异 更新到视图上
 */

const nodeOps = {
  setTextContent() {},
  parentNode() {},
  removeChild() {},
  nextSibling() {},
  insertBefore() {},
};

/**
 * patch的核心就是diff算法
 * 通过diff算法来对比出两棵树的差异
 * diff算法通过同层的节点来进行比较
 */

function patch(oldnode, vnode, parentElm) {
  /**
   * 1. 如果老节点不存在 直接用新的节点替代原本没有的节点
   * 2. 如果新节点不存在 删除老节点
   * 3. 如果两个节点相同 进行patch对比
   * 4. 如果两个节点不相同 删除老节点 添加新节点
   */

  if (!oldnode) {
    addVNodes(parentElm, null, vnode, 0, vnode.length - 1);
  } else if (!vnode) {
    removeVnodes(parentElm, oldnode, 0, oldnode.length - 1);
  } else {
    if (sameVnode(oldnode, vnode)) {
      patchVnode(oldnode, vnode);
    } else {
      removeVnodes(parentElm, oldnode, 0, oldnode.length - 1);
      addVNodes(parentElm, null, vnode, 0, vnode.length - 1);
    }
  }
}

function sameVnode(a, b) {
  return (
    a.key === b.key &&
    a.tag === b.tag &&
    a.isComment === b.isComment &&
    !!a.data === !!b.data &&
    sameInputType(a, b)
  );
}

function sameInputType(a, b) {
  if (a.tag !== "input") return true;
  let i;
  const typeA = (i = a.data) && (i = i.attrs) && i.typeA;
  const typeB = (i = b.data) && (i = i.attrs) && i.typeA;
  return typeA === typeB;
}

/**
 * 对比节点
 * @param {*} oldVnode 旧节点
 * @param {*} vnode 新节点
 */
function patchVnode(oldVnode, vnode) {
  /**
   * 1. 如果两个节点相同 直接return 不需要改变
   * 2. 如果新老VNode节点都是静态节点且key相同 将老节点的elm拿过来即可
   * 3. 如果新节点是文本节点时 直接用setTextContent设置text
   * 4. 如果新节点不是文本节点 分几种情况
   *    4.1 oldch和ch都存在且不相同 进行updateChildren
   *    4.2 只有ch存在 如果老节点时文本节点 进行清除 然后将ch批量添加到节点下
   *    4.3 只有oldch存在 批量删除
   *    4.4 只有老节点时文本节点时 清除节点内容
   */

  if (oldVnode === vnode) return;

  if (oldVnode.isStatic && vnode.isStatic && oldVnode.key === vnode.key) {
    vnode.elm = oldVnode.elm;
    vnode.componentInstance = oldVnode.componentInstance;
    return;
  }

  const elm = (vnode.elm = oldVnode.elm);
  const oldch = oldVnode.children;
  const ch = vnode.children;

  if (vnode.text) {
    nodeOps.setTextContent(elm, vnode.text);
  } else {
    if (oldch && ch && oldch !== ch) {
      updateChildren(elm, oldch, ch);
    } else if (ch) {
      if (oldVnode.text) nodeOps.setTextContent(elm, "");
      addVNodes(elm, "", vnode, 0, ch.length - 1);
    } else if (oldch) {
      removeVnodes(elm, oldVnode, 0, oldch.length - 1);
    } else if (oldVnode.text) {
      nodeOps.setTextContent(elm, "");
    }
  }
}

function updateChildren(parentElm, oldCh, newCh) {
  let oldStartIdx = 0;
  let newStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let oldStartVnode = oldCh[0];
  let oldEndVnode = oldCh[oldEndIdx];
  let newEndIdx = newCh.length - 1;
  let newStartVnode = newCh[0];
  let newEndVnode = newCh[newEndIdx];
  let oldKeyToIdx, idxInOld, elmToMove, refElm;

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    // 如果老节点的开始节点不存在 oldStartIdx继续向中间靠拢
    if (!oldStartVnode) {
      oldStartVnode = oldCh[++oldStartIdx];
    }
    // 同上
    else if (!oldEndVnode) {
      oldEndIdx = oldCh[--oldEndIdx];
    }
    // 老节点的start节点和新节点的start节点相同
    else if (sameVnode(oldStartVnode, newStartVnode)) {
      patchVnode(oldStartVnode, newStartVnode);
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
    }
    // 老节点的end节点和新节点的end节点相同
    else if (sameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode);
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];
    }
    // 老节点的start节点和新节点的end节点相同
    else if (sameVnode(oldStartVnode, newEndVnode)) {
      patchVnode(oldStartVnode, newEndVnode);
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    }
    // 老节点的end节点和新节点的start节点相同
    else if (sameVnode(oldEndVnode, newStartVnode)) {
      patchVnode(oldEndVnode, newStartVnode);
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    } else {
      let elmToMove = oldCh[idxInOld];
      if (!oldKeyToIdx)
        //* oldKeyToIdx是一个map值   key index 的形式
        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
      idxInOld = newStartVnode.key ? oldKeyToIdx[newStartVnode.key] : null;

      //* 未找到相同的节点
      if (!idxInOld) {
        //*  创建一个新节点
        createElm(newStartVnode, parentElm);
        //* newstartIdx向后移动一位
        newStartVnode = newCh[++newStartIdx];
      } else {
        //* 找到了节点
        elmToMove = oldCh[idxInOld];

        //* 节点相同
        if (sameVnode(elmToMove, newStartVnode)) {
          //* 进行patch
          patchVnode(elmToMove, newStartVnode);
          //* 将老节点赋值undefined
          oldCh[idxInOld] = undefined;
          //* 将新节点插入到老节点的前面
          nodeOps.insertBefore(parentElm, newStartVnode.elm, oldStartVnode.elm);
          //* newstartIdx向后移动一位
          newStartVnode = newCh[++newStartIdx];
        }
        //* 节点不相同
        else {
          //* 创建新节点加入到parentElm的子节点中
          createElm(newStartVnode, parentElm);
          //* newstartIdx向后移动一位
          newStartVnode = newCh[++newStartIdx];
        }
      }
    }
  }

  /**
   * 1. 如果oldStartIdx > oldEndIdx 证明老节点完毕了 新节点还有 直接添加进去就好了
   * 2. 如果newStartIdx > newEndIdx 证明新节点完毕了 将多余的老节点删除就好了
   */

  if (oldStartIdx > oldEndIdx) {
    refElm = newCh[newEndIdx + 1] ? newCh[newEndIdx + 1].elm : null;
    addVNodes(parentElm, refElm, newCh, newStartIdx, newEndIdx);
  } else if (newStartIdx > newEndIdx) {
    removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
  }
}

function createKeyToOldIdx(children, beginIdx, endIdx) {
  let i, key;
  const map = {};
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;
    if (isDef(key)) map[key] = i;
  }
  return map;
}

// 如果ref存在 则将节点添加到ref的前面 否则在parent节点在添加新节点
function insert(parent, elm, ref) {
  // 父节点存在
  if (parent) {
    // ref
    if (ref) {
      if (ref.parentNode === parent) {
        nodeOps.insertBefore(parent, elm, ref);
      }
    } else {
      nodeOps.appendChild(parent, elm);
    }
  }
}

// 创建一个新节点
function createElm(vnode, parentElm, refElm) {
  // tag存在创建标签节点 否则创建文本节点
  if (vnode.tag) {
    insert(parentElm, nodeOps.createElement(vnode.tag), refElm);
  } else {
    insert(parentElm, nodeOps.createTextNode(vnode.text), refElm);
  }
}

// 批量添加createElm来创建节点
function addVNodes(parentElm, refElm, vnodes, startIdx, endIdx) {
  for (; startIdx <= endIdx; startIdx++) {
    createElm(vnodes[startIdx], parentElm, refElm);
  }
}

// 移除节点
function removeChild(el) {
  // 获取父节点的饮用
  const parent = nodeOps.parentNode(el);
  if (parent) {
    nodeOps.removeChild(parent, el);
  }
}

// 批量移除节点
function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
  for (; startIdx <= endIdx; startIdx++) {
    const ch = vnodes[startIdx];
    if (ch) {
      removeChild(ch.elm);
    }
  }
}
