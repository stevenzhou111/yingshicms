<template>
  <div class="page" style="padding-top:0">
    <!-- Search input -->
    <div style="padding:16px 0">
      <form @submit.prevent="doSearch" style="max-width:600px;margin:0 auto">
        <div style="position:relative">
          <svg style="position:absolute;left:14px;top:50%;transform:translateY(-50%);width:18px;height:18px;color:var(--c-muted);pointer-events:none"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input v-model="searchInput" type="text" placeholder="搜索电影、电视剧..."
            style="width:100%;height:44px;padding:0 16px 0 42px;background:var(--c-card);border:1px solid var(--c-border);border-radius:10px;color:var(--c-text);font-size:14px;outline:none;font-family:inherit"
            @focus="$event.target.style.borderColor='var(--c-accent)'" @blur="$event.target.style.borderColor='var(--c-border)'" />
        </div>
      </form>
    </div>

    <div style="max-width:95%;margin:0 auto">
      <!-- Loading -->
      <div v-if="loading" class="spin-wrap"><div class="spinner"></div> 搜索中...</div>

      <!-- Search history (when no query) -->
      <template v-else-if="!query">
        <div v-if="store.searchHistory.length" style="margin-bottom:24px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <h2 style="font-size:17px;font-weight:700">搜索历史</h2>
            <button class="btn btn-ghost" style="font-size:12px;color:var(--c-muted)" @click="store.clearSearchHistory()">清空</button>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            <div v-for="h in store.searchHistory" :key="h" style="position:relative" class="history-tag-wrap">
              <button @click="searchInput = h; doSearch()" style="padding:6px 14px;background:var(--c-card);border:1px solid var(--c-border);border-radius:100px;font-size:12px;color:var(--c-text2);cursor:pointer;transition:all .3s;font-family:inherit"
                onmouseover="this.style.borderColor='var(--c-accent)';this.style.color='var(--c-text)'" onmouseout="this.style.borderColor='var(--c-border)';this.style.color='var(--c-text2)'">
                {{ h }}
              </button>
              <button @click.stop="store.removeSearch(h)" style="position:absolute;top:-4px;right:-4px;width:16px;height:16px;background:var(--c-muted);color:#fff;border:none;border-radius:50%;font-size:9px;cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s"
                class="del-btn">✕</button>
            </div>
          </div>
        </div>

        <div v-else class="empty" style="padding-top:40px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:48px;height:48px;margin-bottom:12px;opacity:.3">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <p style="font-size:14px">输入关键词搜索影片</p>
        </div>
      </template>

      <!-- No results -->
      <template v-else-if="!groups.length">
        <div class="search-empty">
          <div class="search-empty-icon">
            <svg viewBox="0 0 120 120" fill="none" style="width:100px;height:100px">
              <circle cx="52" cy="52" r="28" stroke="var(--c-border2)" stroke-width="4" fill="var(--c-card)" />
              <line x1="72" y1="72" x2="95" y2="95" stroke="var(--c-border2)" stroke-width="5" stroke-linecap="round" />
              <text x="52" y="62" text-anchor="middle" fill="var(--c-muted)" font-size="28" font-weight="700">?</text>
            </svg>
          </div>
          <h3 style="font-size:16px;font-weight:700;margin-bottom:6px">
            没有找到「<span style="color:var(--c-accent)">{{ query }}</span>」
          </h3>
          <p style="font-size:12px;color:var(--c-text2);margin-bottom:16px">换个关键词试试，或检查数据源是否启用</p>
          <div style="display:flex;gap:8px;justify-content:center">
            <router-link to="/" class="btn">返回首页</router-link>
            <router-link to="/sources" class="btn btn-primary">管理数据源</router-link>
          </div>
        </div>
      </template>

      <!-- Results -->
      <template v-else>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <h2 style="font-size:17px;font-weight:700">搜索结果</h2>
          <span style="font-size:12px;color:var(--c-muted)">
            共 <span style="color:var(--c-accent)">{{ totalCount }}</span> 个结果
          </span>
        </div>

        <div v-for="g in groups" :key="g.source.id" style="margin-bottom:24px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
            <div style="width:24px;height:24px;border-radius:6px;background:linear-gradient(135deg,var(--c-accent),var(--c-accent2));display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;flex-shrink:0">
              {{ g.source.name.charAt(0) }}
            </div>
            <span style="font-size:13px;font-weight:600">{{ g.source.name }}</span>
            <span style="font-size:11px;color:var(--c-muted)">({{ g.list.length }})</span>
          </div>
          <div class="scroll-row">
            <div v-for="item in g.list" :key="item.id" class="scroll-card" @click="open(g.source.id, item)">
              <div class="scroll-poster">
                <img :src="poster(item.pic)" :alt="item.name" loading="lazy" referrerpolicy="no-referrer" @error="safeImgError" />
                <span v-if="item.remarks" class="scroll-badge">{{ item.remarks }}</span>
                <div class="scroll-play">
                  <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="8,5 8,19 19,12" /></svg>
                </div>
              </div>
              <div class="scroll-info">
                <span class="scroll-name">{{ item.name }}</span>
                <span class="scroll-meta">{{ item.year || item.type || '' }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api/cms.js'
import { store } from '../store/index.js'
import { poster, safeImgError } from '../utils/helpers.js'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const groups = ref([])
const query = ref('')
const searchInput = ref('')

const totalCount = computed(() => groups.value.reduce((sum, g) => sum + g.list.length, 0))

onMounted(() => {
  searchInput.value = route.query.q || ''
  if (route.query.q) search()
})

watch(() => route.query.q, (v) => {
  searchInput.value = v || ''
  if (v) search()
  else { groups.value = []; query.value = '' }
})

async function doSearch() {
  const q = searchInput.value.trim()
  if (!q) return
  store.pushSearch(q)
  router.push({ name: 'search', query: { q } })
}

async function search() {
  query.value = route.query.q || ''
  if (!query.value) return
  loading.value = true
  try { groups.value = await api.searchAll(query.value) }
  catch { groups.value = [] }
  loading.value = false
}

function open(srcId, item) {
  router.push({ name: 'detail', params: { source: srcId, id: item.id } })
}
</script>

<style scoped>
.history-tag-wrap:hover .del-btn { opacity: 1 !important; }
</style>
