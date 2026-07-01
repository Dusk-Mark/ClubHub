import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { pinia } from './stores'
import { registerScrollReveal } from './utils/scroll-reveal'

const app = createApp(App)

registerScrollReveal(app)

app.use(pinia).use(router).mount('#app')
