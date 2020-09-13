import Dep from "./Dep"

class Observer {
  constructor(data) {
    // 数据转存
    this.$data = data
    // 编译对象完成所有数据的劫持
    this.walk(this.$data)
  }

  /**
   * 遍历对象
   * @param {*} data 
   */
  walk(data) {
    // 非对象则不再监听
    if (!data || typeof data !== 'object') {
      return
    }
    // 劫持对象的每一个属性
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
    })
  }

  // 劫持属性
  defineReactive(data, key, value) {
    // 每一个属性定义一个执行清单(dep)
    let dep = new Dep()
    Object.defineProperty(data, key, {
      // 可遍历
      enumerable: true,
      // 不可再配置
      configurable: false,
      get: () => {
        Dep.target && dep.addSub(Dep.target)
        // value 闭包形式存在
        return value
      },
      set: (newValue) => {
        // 重新赋值
        value = newValue
        // todo 触发页面的改变
        dep.notify()
      }
    })
    // 递归对象中的值
    this.walk(value)
  }
}

export default Observer