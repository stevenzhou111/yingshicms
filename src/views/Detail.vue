<template>
  <div class="page">
    <div v-if="loading" class="spin-wrap"><div class="spinner"></div> 加载中...</div>

    <template v-else-if="d">
      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <router-link to="/">首页</router-link>
        <span style="margin:0 6px;color:var(--c-muted)">/</span>
        <span style="color:var(--c-text2)">{{ d.name }}</span>
      </div>

      <div class="detail-hero">
        <div class="detail-cover">
          <img :src="poster(d.pic)" :alt="d.name" referrerpolicy="no-referrer" @error="safeImgError" />
        </div>
        <div class="detail-meta">
          <h1>{{ d.name }}</h1>
          <div class="tags">
            <span v-if="d.score" class="tag tag-accent">⭐ {{ d.score }}</span>
            <span v-if="d.year" class="tag">{{ d.year }}</span>
            <span v-if="d.area" class="tag">{{ d.area }}</span>
            <span v-if="d.type" class="tag">{{ d.type }}</span>
            <span v-if="d.remarks" class="tag tag-accent">{{ d.remarks }}</span>
          </div>

          <div class="detail-actions">
            <button class="btn btn-primary" @click="goPlay(0)" v-if="d.episodes.length">
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><polygon points="8,5 8,19 19,12" /></svg>
              立即播放
            </button>
            <button class="btn" :class="{ 'btn-fav-active': isFav }" @click="toggleFav">
              <svg viewBox="0 0 24 24" :fill="isFav ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" width="15" height="15">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {{ isFav ? '已收藏' : '收藏' }}
            </button>
          </div>

          <div class="detail-info-grid">
            <div v-if="d.director"><span class="info-label">导演</span><span class="info-value">{{ d.director }}</span></div>
            <div v-if="d.actor"><span class="info-label">主演</span><span class="info-value">{{ d.actor }}</span></div>
            <div v-if="d.year"><span class="info-label">年份</span><span class="info-value">{{ d.year }}</span></div>
            <div v-if="d.area"><span class="info-label">地区</span><span class="info-value">{{ d.area }}</span></div>
          </div>

          <div v-if="d.desc" class="detail-desc" :class="{ expanded: descExpanded }">
            {{ d.desc }}
          </div>
          <button v-if="d.desc && d.desc.length > 120" class="btn btn-ghost" style="font-size:12px;margin-top:-8px;margin-bottom:12px"
            @click="descExpanded = !descExpanded">
            {{ descExpanded ? '收起' : '展开全部' }}
          </button>

          <template v-if="d.episodes.length">
            <div class="ep-section-title">选集播放 · 共{{ d.episodes.length }}集</div>
            <div class="ep-grid">
              <div v-for="(ep, i) in d.episodes" :key="i"
                class="ep-btn" :class="{ on: curIdx === i }" @click="goPlay(i)">
                {{ ep.name }}
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>

    <div v-else class="empty">
      <p>未找到影片信息</p>
      <router-link to="/" class="btn" style="margin-top:12px">返回首页</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api/cms.js'
import { store } from '../store/index.js'
import { poster, safeImgError } from '../utils/helpers.js'

const route = useRoute()
const router = useRouter()
const toast = inject('toast')
const loading = ref(false)
const d = ref(null)
const curIdx = ref(-1)
const descExpanded = ref(false)

const isFav = computed(() => d.value && store.isFavorite(route.params.source, d.value.id))

onMounted(async () => {
  loading.value = true
  const s = store.getSource(route.params.source)
  if (s) {
    try { d.value = await api.detail(s, route.params.id) }
    catch { d.value = null }
  }
  loading.value = false
})

function toggleFav() {
  if (!d.value) return
  const s = store.getSource(route.params.source)
  const added = store.toggleFavorite({
    sourceId: route.params.source,
    sourceName: s?.name || '',
    vodId: d.value.id,
    name: d.value.name,
    pic: d.value.pic,
  })
  toast(added ? '已添加到收藏' : '已取消收藏', added ? 'success' : 'info')
}

function goPlay(idx) {
  curIdx.value = idx
  const s = store.getSource(route.params.source)
  store.pushHistory({
    sourceId: route.params.source,
    sourceName: s?.name || '',
    vodId: route.params.id,
    name: d.value.name,
    pic: d.value.pic,
    episode: idx,
    episodeName: d.value.episodes[idx]?.name || '',
  })
  router.push({ name: 'play', params: { source: route.params.source, id: route.params.id, episode: idx } })
}
</script>
