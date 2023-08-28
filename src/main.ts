import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import Home from './pages/Home.vue'
import Project from './pages/Project.vue'
import './style.css'
import App from './App.vue'

const routes = [
    { path: '/', component: Home, name: 'home' },
    { path: '/project/:id', component: Project, name: 'project' },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

createApp(App).use(router).mount('#app')
