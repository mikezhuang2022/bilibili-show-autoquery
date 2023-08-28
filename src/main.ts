import { createApp } from 'vue'
import VueRouter from 'vue-router'
import Home from './pages/Home.vue'
import Project from './pages/Project.vue'
import './style.css'
import App from './App.vue'

const routes = [
    { path: '/', component: Home },
    { path: '/project', component: Project },
]

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
})

createApp(App).use(router).mount('#app')
