import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('./views/Home.vue') },
  { path: '/search', name: 'search', component: () => import('./views/Search.vue') },
  { path: '/detail/:source/:id', name: 'detail', component: () => import('./views/Detail.vue') },
  { path: '/play/:source/:id/:episode', name: 'play', component: () => import('./views/Play.vue') },
  { path: '/sources', name: 'sources', component: () => import('./views/Sources.vue') },
  { path: '/history', name: 'history', component: () => import('./views/History.vue') },
  { path: '/favorites', name: 'favorites', component: () => import('./views/Favorites.vue') },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: {
      template: `
        <div class="empty" style="padding-top:120px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:64px;height:64px;margin-bottom:16px;opacity:.3">
            <circle cx="12" cy="12" r="10" />
            <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
          <h2 style="font-size:48px;font-weight:800;margin-bottom:8px;background:linear-gradient(135deg,var(--accent),var(--purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">404</h2>
          <p style="font-size:14px;margin-bottom:16px">页面不存在</p>
          <router-link to="/" class="btn btn-primary">返回首页</router-link>
        </div>
      `
    }
  },
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})
