import Vue from 'vue';
import App from './App.vue';
import { Message } from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.prototype.$message = Message;
Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app');
