import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import ZkTable from 'vue-table-with-tree-grid'

import './plugins/element.js'
// 导入阿里图标库
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'

// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// axios请求拦截器
// 给请求的headers里面添加token
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须rerun config
  return config
})

Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.component('tree-table', ZkTable)
// 过滤器  使用方法 数据 | dateFormat(过滤器名字)
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const year = dt.getFullYear()
  // padStrat不足2位数，用0来补充
  const month = (dt.getMonth + 1 + '').padStart(2, '0')
  const day = (dt.getDate + '').padStart(2, '0')

  const hh = (dt.getHours + '').padStart(2, '0')
  const mm = (dt.getMinutes + '').padStart(2, '0')
  const ss = (dt.getSeconds + '').padStart(2, '0')
  return `${year}-${month}-${day} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
