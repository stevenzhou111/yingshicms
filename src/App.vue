<template>
  <div class="app-layout">
    <!-- Top header (kvideo style) -->
    <header class="header">
      <div class="header-inner">
        <router-link to="/" class="logo">
          <span class="logo-icon">▶</span>
          <span class="logo-text">CloudMovie</span>
        </router-link>

        <div class="header-search" ref="searchBoxRef">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input v-model="q" placeholder="搜索影片..." @focus="showSearchDrop = true"
            @keyup.enter="doSearch" @keyup.esc="showSearchDrop = false" />
          <div v-if="showSearchDrop && store.searchHistory.length" class="search-dropdown">
            <div class="search-drop-header">
              <span>搜索历史</span>
              <button class="text-btn danger" @click="store.clearSearchHistory()">清空</button>
            </div>
            <div v-for="h in store.searchHistory" :key="h" class="search-drop-item" @click="q = h; doSearch()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
              <span>{{ h }}</span>
              <button class="text-btn" @click.stop="store.removeSearch(h)">✕</button>
            </div>
          </div>
        </div>

        <div class="header-actions">
          <button class="icon-btn" @click="showSettings = true" title="设置">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="content">
      <router-view v-slot="{ Component }">
        <keep-alive include="Home">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </main>

    <!-- Bottom navigation (mobile, kvideo style) -->
    <nav class="bottom-nav">
      <router-link to="/" class="bottom-nav-item" :class="{ active: route.path === '/' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
        <span>首页</span>
      </router-link>
      <router-link to="/search" class="bottom-nav-item" :class="{ active: route.path === '/search' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <span>搜索</span>
      </router-link>
      <router-link to="/favorites" class="bottom-nav-item" :class="{ active: route.path === '/favorites' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span>收藏</span>
      </router-link>
      <router-link to="/history" class="bottom-nav-item" :class="{ active: route.path === '/history' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
        </svg>
        <span>历史</span>
      </router-link>
      <button class="bottom-nav-item" @click="showSettings = true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        <span>设置</span>
      </button>
    </nav>

    <!-- Settings drawer -->
    <div v-if="showSettings" class="drawer-mask" @click="showSettings = false"></div>
    <div class="drawer" :class="{ open: showSettings }">
      <div class="drawer-header">
        <h2>设置</h2>
        <button class="icon-btn" @click="showSettings = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="drawer-body">
        <!-- Source management -->
        <div class="settings-section">
          <h3>数据源管理</h3>
          <p class="settings-hint">添加或管理苹果CMS数据源</p>
          <div class="source-list">
            <div v-for="s in store.sources" :key="s.id" class="source-item">
              <div class="source-icon">{{ s.name.charAt(0) }}</div>
              <div class="source-info">
                <span class="source-name">{{ s.name }}</span>
                <span class="source-url">{{ s.api }}</span>
              </div>
              <div class="toggle" :class="{ on: s.enabled }" @click="toggleSource(s)"></div>
              <button class="text-btn danger" @click="removeSource(s)">删除</button>
            </div>
          </div>
          <div style="display:flex;gap:8px;margin-top:12px">
            <button class="btn" @click="showAddSource = true">添加源</button>
          </div>
        </div>

        <!-- Stats -->
        <div class="settings-section">
          <h3>数据统计</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">{{ store.sources.length }}</span>
              <span class="stat-label">数据源</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ store.favorites.length }}</span>
              <span class="stat-label">收藏</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ store.history.length }}</span>
              <span class="stat-label">播放记录</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="settings-section">
          <h3>数据管理</h3>
          <button class="btn" style="width:100%;justify-content:center;margin-bottom:8px" @click="exportData">导出数据</button>
          <button class="btn btn-danger" style="width:100%;justify-content:center" @click="clearAllData">清空所有数据</button>
        </div>
      </div>
    </div>

    <!-- Add source modal -->
    <div v-if="showAddSource" class="overlay" @click.self="showAddSource = false">
      <div class="modal">
        <h2>添加苹果CMS源</h2>
        <div class="field">
          <label>源名称</label>
          <input v-model="newSource.name" placeholder="如：极速资源" />
        </div>
        <div class="field">
          <label>API地址</label>
          <input v-model="newSource.api" placeholder="https://api.example.com/api.php/provide/vod/" />
          <div class="hint">苹果CMS数据接口，通常以 /api.php/provide/vod/ 结尾</div>
        </div>
        <div class="modal-foot">
          <button class="btn" @click="showAddSource = false">取消</button>
          <button class="btn btn-primary" @click="addSource" :disabled="!newSource.name || !newSource.api">添加</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div v-for="t in toasts" :key="t.id" class="toast" :class="'toast-' + t.type">{{ t.msg }}</div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { store } from './store/index.js'

const route = useRoute()
const router = useRouter()
const q = ref('')
const showSearchDrop = ref(false)
const showSettings = ref(false)
const showAddSource = ref(false)
const searchBoxRef = ref(null)
const toasts = ref([])

const newSource = reactive({ name: '', api: '' })

function onClickOutside(e) {
  if (searchBoxRef.value && !searchBoxRef.value.contains(e.target)) {
    showSearchDrop.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))

// Toast
let toastId = 0
function toast(msg, type = 'info') {
  const id = ++toastId
  toasts.value.push({ id, msg, type })
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, 3000)
}
provide('toast', toast)

function doSearch() {
  if (q.value.trim()) {
    store.pushSearch(q.value.trim())
    router.push({ name: 'search', query: { q: q.value.trim() } })
    showSearchDrop.value = false
  }
}

function toggleSource(s) {
  store.updateSource(s.id, { enabled: !s.enabled })
}

function removeSource(s) {
  store.removeSource(s.id)
  toast('已删除 ' + s.name, 'info')
}

function addSource() {
  if (!newSource.name || !newSource.api) return
  store.addSource({ name: newSource.name, api: newSource.api })
  newSource.name = ''
  newSource.api = ''
  showAddSource.value = false
  toast('源已添加', 'success')
}

function exportData() {
  const data = {
    sources: store.exportSources(),
    favorites: store.favorites,
    history: store.history,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'cloudmovie-backup.json'
  a.click()
  URL.revokeObjectURL(url)
  toast('数据已导出', 'success')
}

function clearAllData() {
  if (confirm('确定要清空所有数据吗？此操作不可恢复。')) {
    store.clearHistory()
    store.favorites.length = 0
    try { localStorage.setItem('cm_favorites', '[]') } catch {}
    toast('数据已清空', 'info')
  }
}
</script>
