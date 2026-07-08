<template>
  <div class="page" style="padding-top:0">
    <!-- Empty state -->
    <div v-if="!store.sources.length" class="empty" style="padding-top:80px">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
      <p>请先添加苹果CMS数据源</p>
      <router-link to="/sources" class="btn btn-primary" style="margin-top:14px">添加源</router-link>
    </div>

    <template v-else>
      <!-- Hero Banner -->
      <div class="hero" v-if="heroList.length">
        <div v-for="(item, i) in heroList" :key="item.id" class="hero-slide" :class="{ active: heroIdx === i }">
          <img class="hero-bg" :src="poster(item.pic)" :alt="item.name" referrerpolicy="no-referrer" @error="safeImgError" />
          <div class="hero-overlay"></div>
        </div>
        <div class="hero-content">
          <div class="hero-badge">
            <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><polygon points="8,5 8,19 19,12" /></svg>
            正在热播
          </div>
          <div class="hero-title">{{ heroList[heroIdx]?.name }}</div>
          <div class="hero-meta">
            <span v-if="heroList[heroIdx]?.score" class="tag tag-accent">⭐ {{ heroList[heroIdx].score }}</span>
            <span v-if="heroList[heroIdx]?.year" class="tag">{{ heroList[heroIdx].year }}</span>
            <span v-if="heroList[heroIdx]?.area" class="tag">{{ heroList[heroIdx].area }}</span>
          </div>
          <div class="hero-actions">
            <button class="hero-btn hero-btn-play" @click="open(heroList[heroIdx])">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><polygon points="8,5 8,19 19,12" /></svg>
              立即播放
            </button>
            <button class="hero-btn hero-btn-detail" @click="open(heroList[heroIdx])">详细介绍</button>
          </div>
        </div>
        <div class="hero-dots">
          <div v-for="(_, i) in heroList" :key="i" class="hero-dot" :class="{ active: heroIdx === i }" @click="heroIdx = i"></div>
        </div>
      </div>

      <!-- Tabs: 首页 / 收藏夹 -->
      <div class="tab-switch">
        <button class="tab-switch-item" :class="{ active: activeTab === 'home' }" @click="activeTab = 'home'">首页</button>
        <button class="tab-switch-item" :class="{ active: activeTab === 'fav' }" @click="activeTab = 'fav'">收藏夹</button>
      </div>

      <!-- ========== HOME TAB ========== -->
      <template v-if="activeTab === 'home'">
        <!-- Continue watching -->
        <div v-if="continueWatch.length" class="section">
          <div class="section-header">
            <h2 class="section-title"><span style="color:var(--accent)">▶</span> 继续观看</h2>
            <router-link to="/history" class="section-more">查看更多</router-link>
          </div>
          <div class="scroll-row">
            <div v-for="h in continueWatch" :key="h.sourceId + h.vodId" class="scroll-card" @click="goContinue(h)">
              <div class="scroll-poster">
                <img :src="poster(h.pic)" :alt="h.name" referrerpolicy="no-referrer" @error="safeImgError" />
                <div class="scroll-play"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="8,5 8,19 19,12" /></svg></div>
                <span v-if="h.episodeName" class="scroll-badge scroll-badge-progress">{{ h.episodeName }}</span>
              </div>
              <div class="scroll-info"><span class="scroll-name">{{ h.name }}</span></div>
            </div>
          </div>
        </div>

        <!-- Source + Category Bar -->
        <div class="source-cat-bar">
          <div class="source-cat-left">
            <select class="src-select" v-model="srcId" @change="onSourceChange">
              <option v-for="s in store.enabledSources" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
            <button class="refresh-btn" @click="load()" title="刷新">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            </button>
          </div>
        </div>

        <!-- Category Navigation - KVideo Style -->
        <div class="cat-nav">
          <div class="cat-nav-inner">
            <button class="cat-tag" :class="{ active: !activeCat }" @click="pickCat(null)">全部</button>
            <template v-for="c in visibleCats" :key="c.id">
              <button class="cat-tag" :class="{ active: activeCat === c.id }" @click="pickCat(c.id)">{{ c.name }}</button>
            </template>
            <button v-if="cats.length > maxCats && !showAllCats" class="cat-tag cat-tag-more" @click="showAllCats = true">
              更多 <span class="cat-count">{{ cats.length - maxCats }}</span>
            </button>
            <button v-if="showAllCats && cats.length > maxCats" class="cat-tag cat-tag-more" @click="showAllCats = false">收起</button>
            <template v-if="showAllCats">
              <button v-for="c in cats.slice(maxCats)" :key="c.id" class="cat-tag" :class="{ active: activeCat === c.id }" @click="pickCat(c.id)">{{ c.name }}</button>
            </template>
          </div>
        </div>

        <!-- Loading skeleton -->
        <div v-if="loading" class="scroll-row">
          <div v-for="i in 8" :key="i" class="scroll-card skeleton-card">
            <div class="scroll-poster skeleton-pulse"></div>
            <div class="skeleton-line" style="width:80%;margin-top:8px"></div>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="errorMsg" class="empty">
          <p style="color:var(--red);margin-bottom:8px">{{ errorMsg }}</p>
          <button class="btn" @click="load()">重试</button>
        </div>

        <!-- Video list -->
        <template v-else>
          <!-- 热门推荐 -->
          <div v-if="hotList.length" class="section">
            <div class="section-header">
              <h2 class="section-title">🔥 热门推荐</h2>
            </div>
            <div class="scroll-row">
              <div v-for="item in hotList" :key="'hot-'+item.id" class="scroll-card" @click="open(item)">
                <div class="scroll-poster">
                  <img :src="poster(item.pic)" :alt="item.name" loading="lazy" referrerpolicy="no-referrer" @error="safeImgError" />
                  <span v-if="item.remarks" class="scroll-badge">{{ item.remarks }}</span>
                  <span v-if="item.score" class="scroll-badge scroll-badge-score">{{ item.score }}分</span>
                  <div class="scroll-play"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="8,5 8,19 19,12" /></svg></div>
                </div>
                <div class="scroll-info"><span class="scroll-name">{{ item.name }}</span><span class="scroll-meta">{{ item.year || item.type }}</span></div>
              </div>
            </div>
          </div>

          <!-- 最近更新 -->
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">✨ 最近更新</h2>
              <span class="section-count">共 {{ list.length }} 部</span>
            </div>
            <div class="scroll-row">
              <div v-for="item in list" :key="'all-'+item.id" class="scroll-card" @click="open(item)">
                <div class="scroll-poster">
                  <img :src="poster(item.pic)" :alt="item.name" loading="lazy" referrerpolicy="no-referrer" @error="safeImgError" />
                  <span v-if="item.remarks" class="scroll-badge">{{ item.remarks }}</span>
                  <div class="scroll-play"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="8,5 8,19 19,12" /></svg></div>
                </div>
                <div class="scroll-info"><span class="scroll-name">{{ item.name }}</span><span class="scroll-meta">{{ item.year || item.type }}</span></div>
              </div>
            </div>
          </div>

          <div v-if="!list.length" class="empty"><p>暂无内容</p></div>

          <!-- Pagination -->
          <div v-if="pageCount > 1" class="pager">
            <button class="btn" :disabled="pg <= 1" @click="pg--; load()">上一页</button>
            <span class="pager-info">{{ pg }} / {{ pageCount }}</span>
            <button class="btn" :disabled="pg >= pageCount" @click="pg++; load()">下一页</button>
          </div>
        </template>
      </template>

      <!-- ========== FAVORITES TAB ========== -->
      <template v-else>
        <div v-if="!store.favorites.length" class="empty" style="padding-top:40px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:48px;height:48px;margin-bottom:12px;opacity:.3">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <p>还没有收藏任何影片</p>
          <p style="margin-top:6px;font-size:12px">在影片详情页点击「收藏」按钮即可添加</p>
        </div>
        <template v-else>
          <div class="section-header">
            <h2 class="section-title">❤️ 我的收藏</h2>
            <span class="section-count">共 {{ store.favorites.length }} 部</span>
          </div>
          <div class="fav-grid">
            <div v-for="f in store.favorites" :key="f.sourceId + f.vodId" class="fav-card" @click="goFavDetail(f)">
              <div class="scroll-poster">
                <img :src="poster(f.pic)" :alt="f.name" loading="lazy" referrerpolicy="no-referrer" @error="safeImgError" />
                <div class="scroll-play"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="8,5 8,19 19,12" /></svg></div>
                <button class="fav-del" @click.stop="removeFav(f)" title="取消收藏">✕</button>
              </div>
              <div class="scroll-info">
                <span class="scroll-name">{{ f.name }}</span>
                <span v-if="f.sourceName" class="scroll-meta">{{ f.sourceName }}</span>
              </div>
            </div>
          </div>
        </template>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/index.js'
import { api } from '../api/cms.js'
import { poster, safeImgError } from '../utils/helpers.js'

defineOptions({ name: 'Home' })

const router = useRouter()
const toast = inject('toast')
const loading = ref(false)
const errorMsg = ref('')
const list = ref([])
const cats = ref([])
const activeCat = ref(null)
const pg = ref(1)
const pageCount = ref(1)
const srcId = ref('')
const activeTab = ref('home')
const showAllCats = ref(false)
const maxCats = 8

const visibleCats = computed(() => cats.value.slice(0, maxCats))
const continueWatch = computed(() => store.history.slice(0, 5))

const hotList = computed(() => {
  return [...list.value]
    .filter(item => item.score || (item.remarks && item.remarks.match(/\d+/)))
    .sort((a, b) => (parseFloat(b.score) || 0) - (parseFloat(a.score) || 0))
    .slice(0, 10)
})

function goContinue(h) {
  router.push({ name: 'play', params: { source: h.sourceId, id: h.vodId, episode: h.episode || 0 } })
}

function goFavDetail(f) {
  router.push({ name: 'detail', params: { source: f.sourceId, id: f.vodId } })
}

function removeFav(f) {
  store.removeFavorite(f.sourceId, f.vodId)
  toast('已取消收藏', 'info')
}

const heroList = ref([])
const heroIdx = ref(0)
let heroTimer = null

const src = computed(() => store.getSource(srcId.value))

onMounted(() => {
  if (store.enabledSources.length) {
    srcId.value = store.enabledSources[0].id
    boot()
  }
})

onUnmounted(() => { if (heroTimer) clearInterval(heroTimer) })

async function boot() {
  const s = src.value
  if (!s) return
  errorMsg.value = ''
  try { cats.value = await api.categories(s) } catch { cats.value = [] }
  await load()
}

async function load() {
  const s = src.value
  if (!s) return
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await api.list(s, { pg: pg.value, tid: activeCat.value })
    list.value = res.list
    pageCount.value = res.total
    heroList.value = res.list.slice(0, 5)
    startHeroTimer()
  } catch (e) {
    list.value = []
    heroList.value = []
    errorMsg.value = e.message || '加载失败'
  }
  loading.value = false
}

function startHeroTimer() {
  if (heroTimer) clearInterval(heroTimer)
  if (heroList.value.length <= 1) return
  heroTimer = setInterval(() => { heroIdx.value = (heroIdx.value + 1) % heroList.value.length }, 5000)
}

function pickCat(id) { activeCat.value = id; pg.value = 1; load() }
function onSourceChange() { pg.value = 1; activeCat.value = null; boot() }
function open(item) { router.push({ name: 'detail', params: { source: srcId.value, id: item.id } }) }
</script>
