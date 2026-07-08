import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('./views/Home.vue') },
  { path: '/search', name: 'search', component: () => import('./views/Search.vue') },
  { path: '/detail/:source/:id', name: 'detail', component: () => import('./views/Detail.vue') },
  { path: '/play/:source/:id/:episode', name: 'play', component: () => import('./views/Play.vue') },
  { path: '/sources', name: 'sources', component: () => import('./views/Sources.vue') },
  { path: '/history', name: 'history', component: () => import('./views/History.vue') },
  { path: '/favorites', name: 'favorites', component: () => import('./views/Favorites.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})
