import { reactive } from 'vue'

const LS_SOURCES = 'cm_sources'
const LS_HISTORY = 'cm_history'
const LS_FAVS = 'cm_favorites'
const LS_SEARCH = 'cm_search_history'
const MAX_HISTORY = 300
const MAX_SEARCH = 20

const DEFAULT_SOURCES = [
  { id: 'ffzy', name: '非凡资源', api: 'https://ffzy5.tv/api.php/provide/vod/', enabled: true },
]

function safeLoad(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback }
  catch { return fallback }
}

function safeSave(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) }
  catch { /* quota exceeded — silently drop oldest */ }
}

export const store = reactive({
  sources: safeLoad(LS_SOURCES, DEFAULT_SOURCES),
  history: safeLoad(LS_HISTORY, []),
  favorites: safeLoad(LS_FAVS, []),
  searchHistory: safeLoad(LS_SEARCH, []),

  get enabledSources() {
    return this.sources.filter(s => s.enabled)
  },

  getSource(id) {
    if (id) {
      const found = this.sources.find(s => s.id === id)
      if (found) return found
    }
    return this.enabledSources[0] || null
  },

  addSource(data) {
    const s = { ...data, id: uid(), enabled: true }
    this.sources.push(s)
    safeSave(LS_SOURCES, this.sources)
    return s
  },

  updateSource(id, patch) {
    const s = this.sources.find(s => s.id === id)
    if (s) { Object.assign(s, patch); safeSave(LS_SOURCES, this.sources) }
  },

  removeSource(id) {
    this.sources = this.sources.filter(s => s.id !== id)
    safeSave(LS_SOURCES, this.sources)
  },

  // ---- Batch operations ----
  batchEnable(ids) {
    ids.forEach(id => {
      const s = this.sources.find(s => s.id === id)
      if (s) s.enabled = true
    })
    safeSave(LS_SOURCES, this.sources)
  },

  batchDisable(ids) {
    ids.forEach(id => {
      const s = this.sources.find(s => s.id === id)
      if (s) s.enabled = false
    })
    safeSave(LS_SOURCES, this.sources)
  },

  batchRemove(ids) {
    const set = new Set(ids)
    this.sources = this.sources.filter(s => !set.has(s.id))
    safeSave(LS_SOURCES, this.sources)
  },

  importSources(list) {
    let added = 0
    list.forEach(item => {
      if (!item.api) return
      // Dedupe by API URL
      const exists = this.sources.some(s => s.api.replace(/\/+$/, '') === item.api.replace(/\/+$/, ''))
      if (!exists) {
        this.sources.push({
          id: uid(),
          name: item.name || extractName(item.api),
          api: item.api,
          enabled: item.enabled ?? true,
        })
        added++
      }
    })
    safeSave(LS_SOURCES, this.sources)
    return added
  },

  exportSources() {
    return this.sources.map(s => ({ name: s.name, api: s.api, enabled: s.enabled }))
  },

  // ---- History ----
  pushHistory(item) {
    const key = `${item.sourceId}:${item.vodId}`
    const idx = this.history.findIndex(h => `${h.sourceId}:${h.vodId}` === key)
    if (idx !== -1) this.history.splice(idx, 1)
    this.history.unshift({ ...item, ts: Date.now() })
    if (this.history.length > MAX_HISTORY) this.history.length = MAX_HISTORY
    safeSave(LS_HISTORY, this.history)
  },

  clearHistory() {
    this.history = []
    safeSave(LS_HISTORY, this.history)
  },

  // ---- Favorites ----
  isFavorite(sourceId, vodId) {
    return this.favorites.some(f => f.sourceId === sourceId && f.vodId === vodId)
  },

  toggleFavorite(item) {
    const key = `${item.sourceId}:${item.vodId}`
    const idx = this.favorites.findIndex(f => `${f.sourceId}:${f.vodId}` === key)
    if (idx !== -1) {
      this.favorites.splice(idx, 1)
    } else {
      this.favorites.unshift({ ...item, ts: Date.now() })
    }
    safeSave(LS_FAVS, this.favorites)
    return idx === -1 // true = added, false = removed
  },

  removeFavorite(sourceId, vodId) {
    this.favorites = this.favorites.filter(f => !(f.sourceId === sourceId && f.vodId === vodId))
    safeSave(LS_FAVS, this.favorites)
  },

  // ---- Search history ----
  pushSearch(keyword) {
    const q = keyword.trim()
    if (!q) return
    const idx = this.searchHistory.indexOf(q)
    if (idx !== -1) this.searchHistory.splice(idx, 1)
    this.searchHistory.unshift(q)
    if (this.searchHistory.length > MAX_SEARCH) this.searchHistory.length = MAX_SEARCH
    safeSave(LS_SEARCH, this.searchHistory)
  },

  removeSearch(keyword) {
    this.searchHistory = this.searchHistory.filter(q => q !== keyword)
    safeSave(LS_SEARCH, this.searchHistory)
  },

  clearSearchHistory() {
    this.searchHistory = []
    safeSave(LS_SEARCH, this.searchHistory)
  },
})

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function extractName(api) {
  try {
    const host = new URL(api).hostname
    return host.replace(/^www\./, '').split('.')[0]
  } catch {
    return '未命名源'
  }
}
