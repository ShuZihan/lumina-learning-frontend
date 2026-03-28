import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { initI18n } from './i18n'
import './style.css'

// 异步启动应用，确保i18n加载完成后再渲染
async function bootstrap() {
  // 1. 初始化i18n：自动加载用户对应语言的翻译
  const i18n = await initI18n()
  // 2. 创建应用
  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.use(i18n)
  // 3. 挂载应用
  app.mount('#app')
  // 4. 隐藏首屏loading（如果在index.html里配置了的话）
  const loadingEl = document.getElementById('app-loading')
  if (loadingEl) loadingEl.style.display = 'none'
}

bootstrap()

