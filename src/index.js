import Observer from './observer'
import Compiler from './compiler'

class Vue {
  constructor(options) {
    // 获取元素dom对象
    this.$el = document.querySelector(options.el)
    
    // 转存数据
    // tips: 判断是函数还是对象
    if (typeof options.data === 'function') {
      this.$data = options.data()
    } else if (typeof options.data === 'object') {
      this.$data = options.data
    }
    this.$methods = options.methods

    // 数据和函数的代理
    this._proxyData(this.$data)
    this._proxyMethods(this.$methods)

    // 数据劫持
    new Observer(this.$data)

    // 模板编译
    // tips: 编译时需要data和dom对应，所以传入this。
    new Compiler(this)
  }

  /**
   * 数据的代理
   * @param {*} data 
   */
  _proxyData(data) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get () {
          return data[key]
        },
        set (newValue) {
          data[key] = newValue
        }
      })
    })
  }

  /**
   * 函数的代理
   * @param {*} data 
   */
  _proxyMethods(methods) {
    if (methods && typeof methods === 'object') {
      Object.keys(methods).forEach(key => {
        this[key] = methods[key]
      })
    }
  }
}

window.Vue = Vue;