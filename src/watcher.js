import Dep from "./Dep"

let $uid = 0 // 相当于唯一标识

class Watcher {
  constructor(exp, scope, cb) {
    this.exp = exp
    this.scope = scope
    this.cb = cb
    this.uid = $uid++
    // 更新do节点
    this.update()
  }

  /**
   * 计算表达式
   */
  get() {
    // view 取值的时候将订阅者watcher添加到Dep执行清单
    Dep.target = this
    let newValue = Watcher.computeExpression(this.exp, this.scope)
    Dep.target = null
    return newValue
  }

  /**
   * 完成回调函数的调用，更新dom值
   */
  update() {
    let newValue = this.get()
    this.cb && this.cb(newValue)
  }

  // 重点：计算表达式，绑定modal数据到view！！！
  static computeExpression(exp, scope) {
    // 创建函数
    // 把scope当做作用域
    // 函数内部使用with来指定作用域
    // 执行函数，得到表达式的值
    let fn = new Function('scope', `with(scope) { return ${exp} }`)
    return fn(scope)
  }
}

export default Watcher