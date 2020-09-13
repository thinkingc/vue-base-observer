import Watcher from "./watcher"

class Compiler {
  constructor(context) {
    this.$el = context.$el
    this.context = context
    if (this.$el) {
      // 把原始的dom转化为文档片段
      this.$fragment = this.nodeToFragment(this.$el)
      // 编译模板
      this.compiler(this.$fragment)
      // 把文档片段添加到页面中
      this.$el.appendChild(this.$fragment)
    }
  }

  /**
   * 把所有的元素转为文档片段
   * @param {*} node 
   */
  nodeToFragment(node) {
    // 创建一个节点碎片fragment，用来收集可用的node节点
    let fragment = document.createDocumentFragment()
    if (node.childNodes && node.childNodes.length) {
      node.childNodes.forEach(child => {
        // 判断是不是我们需要添加的节点
        // 如果是注释节点或者无用的换行，我们是不添加的
        if (!this.ignorable(child)) {
          // tips: 把原本页面里面的dom节点移到fragment里面（相当于剪贴 || 移动）
          fragment.appendChild(child)
        }
      })
    }
    return fragment
  }

  /**
   * 忽略的节点
   * @param {*} node 
   */
  ignorable(node) {
    let reg = /^[\t\n\r]+/
    return (
      node.nodetType === 8 ||
      node.nodtType === 3 ||
      reg.test(node.textContent)
    )
  }

  /**
   * 模板编译
   * @param {*} node 
   */
  compiler (node) {
    if (node.childNodes && node.childNodes.length) {
      node.childNodes.forEach(child => {
        if (child.nodeType === 1) {
          // 当nodeType为1时，说明是元素节点
          this.compilerElementNode(child)
        } else if (child.nodeType === 3) {
          // 当nodeType为3时，说明为文本节点
          this.compilerTextNode(child)
        }
      })
    }
  }

  /**
   * 编译元素节点
   * @param {*} node 
   */
  compilerElementNode(node) {
    // todo 完成元素的编译，包含指令
    let attrs = [...node.attributes]
    attrs.forEach(attr => {
      let { name: attrName, value: attrValue } = attr
      // 指令
      if (attrName.startsWith('v-')) {
        let dirName = attrName.slice(2)
        switch (dirName) {
          case 'text':
            new Watcher(attrValue, this.context, newValue => {
              node.textContent = newValue
            })
            break
          case 'model':
            new Watcher(attrValue, this.context, newValue => {
              node.value = newValue
            })
            // 监听dom变化
            node.addEventListener('input', e => {
              this.context[attrValue] = e.target.value
            })
            break
        }
      }
      // 事件
      if (attrName.startsWith('@')) {
        this.compilerMethods(this.context, node, attrName, attrValue)
      }

    })
    // 如果还是dom元素，递归
    this.compiler(node)
  }

  /**
   * 函数编译
   * @param {*} scope 
   * @param {*} node 
   * @param {*} attrName 
   * @param {*} attrValue 
   */
  compilerMethods(scope, node, attrName, attrValue) {
    // 获取类型
    let type = attrName.slice(1)
    let fn = scope[attrValue]
    node.addEventListener(type, fn.bind(scope))
  }

  /**
   * 编译文本节点
   * @param {*} node 
   */
  compilerTextNode(node) {
    let text = node.textContent.trim()
    if (text) {
      // 把text字符串转化为表达式
      let exp = this.parseTextExp(text)
      // console.log('exp', exp)
      // 添加订阅者，计算表达式的值
      // 当表达式依赖的数据变化时
      // 1. 重新计算表达式的值
      // 2. node.textContent给最新的值
      // 即可完成 Model -> View 的响应式
      new Watcher(exp, this.context, newValue => {
        node.textContent = newValue
      })
    }
  }

  /**
   * 该函数完场了文本到表达式的转换
   * 111{{msg + '---'}}222
   * "111" + msg + "---" + "222"
   * @param {*} text 
   */
  parseTextExp(text) {
    // ?设计贪婪匹配
    let regText = /\{\{(.+?)\}\}/g
    // 分割差值表达式前后内容
    // tips: split函数可以接收一个正则表达式，用来分割字符串
    let pices = text.split(regText)
    // console.log('pices', pices)
    // 匹配插值表达式
    let matches = text.match(regText)
    // console.log('matches', matches)
    // 表达式数组 
    let tokens = []
    pices.forEach(item => {
      // 有{{}}则说明是个表达式
      if (matches && matches.includes(`{{${item}}}`)) {
        // 加括号的目的：优先运算
        tokens.push(`(${item})`)
      } else {
        tokens.push(`\`${item}\``)
      }
    })
    return tokens.join('+')
  }
}

export default Compiler

