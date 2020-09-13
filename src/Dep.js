export default class Dep {
  constructor() {
    // 存放所有的watcher
    this.subs = {}
  }

  // 将订阅者watcher添加进来
  addSub(target) {
    console.log('target:', target)
    this.subs[target.uid] = target
  }

  // 有数据变动，通知订阅者watcher
  notify() {
    for(let uid in this.subs) {
      // 执行watcher的update函数，更新dom值
      this.subs[uid]['update']()
    }
  }
}