import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import store from './store'
import toast from 'components/common/toast/index'
import FastClick from 'fastclick'
import VueLazyLoad from 'vue-lazyload'
import './assets/icon/iconfont.css'

Vue.config.productionTip = false
//添加事件总线对象
Vue.prototype.$bus = new Vue()
//安装toast插件
Vue.use(toast)
//调用attach方法解决移动端300ms延迟
FastClick.attach(document.body)
//使用图片懒加载插件 (将src改为v-lazy后在手机上不显示图片?)
Vue.use(VueLazyLoad)

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
