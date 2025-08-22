import { createApp } from 'vue'
import App from './App.vue'
import router from './routes/index.js'
// 引入全局样式
import './assets/css/base.css'

const app = createApp(App);
app.use(router);
app.mount('#app');
