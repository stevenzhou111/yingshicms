<template>
  <div class="player-wrap">
    <div class="player-top">
      <router-link :to="{ name: 'detail', params: { source: $route.params.source, id: $route.params.id } }"
        class="btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        返回
      </router-link>
      <h2 style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
        {{ detail?.name || '加载中...' }}
      </h2>
      <span v-if="curEp" class="tag tag-accent">{{ curEp.name }}</span>
      <button class="btn" @click="copyLink" title="复制链接">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        复制
      </button>
      <button v-if="curEp?.url" class="btn" @click="copyM3u8" title="复制播放地址">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
        播放地址
      </button>
    </div>

    <div v-if="iframeSrc" class="player-frame">
      <iframe ref="iframeRef" :src="iframeSrc" allowfullscreen allow="autoplay; fullscreen; picture-in-picture"></iframe>
    </div>
    <div v-else class="player-frame" style="display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:14px">
      暂无可用播放地址
    </div>

    <!-- Keyboard shortcuts hint - desktop only -->
    <div class="player-shortcuts player-shortcuts-desktop">
      <span>
        <kbd>←</kbd> <kbd>→</kbd> 切集
        <span style="margin:0 6px">·</span>
        <kbd>F</kbd> 全屏
        <span style="margin:0 6px">·</span>
        <kbd>Esc</kbd> 返回
      </span>
    </div>

    <div v-if="detail?.episodes.length" class="ep-selector">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <h3 style="font-size:13px;font-weight:500;color:var(--text2)">选集播放</h3>
        <label style="font-size:12px;color:var(--text2);display:flex;align-items:center;gap:4px;cursor:pointer">
          <input type="checkbox" v-model="autoNext" style="accent-color:var(--accent)" /> 自动连播
        </label>
      </div>
      <div class="ep-grid">
        <div v-for="(ep, i) in detail.episodes" :key="i"
          class="ep-btn" :class="{ on: curIdx === i }" @click="switchEp(i)">
          {{ ep.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api/cms.js'
import { store } from '../store/index.js'

const route = useRoute()
const router = useRouter()
const toast = inject('toast')
const detail = ref(null)
const curIdx = ref(0)
const autoNext = ref(true)
const iframeRef = ref(null)

const curEp = computed(() => detail.value?.episodes?.[curIdx.value])
const iframeSrc = computed(() => curEp.value?.url || '')

onMounted(async () => {
  curIdx.value = Math.max(0, parseInt(route.params.episode) || 0)
  const s = store.getSource(route.params.source)
  if (!s) return
  try {
    detail.value = await api.detail(s, route.params.id)
    saveHistory()
  } catch { detail.value = null }
})

// Keyboard shortcuts
function onKeydown(e) {
  if (!detail.value?.episodes?.length) return
  const max = detail.value.episodes.length - 1

  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault()
    if (curIdx.value > 0) switchEp(curIdx.value - 1)
  } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault()
    if (curIdx.value < max) switchEp(curIdx.value + 1)
  } else if (e.key === 'f' || e.key === 'F') {
    const iframe = iframeRef.value
    if (iframe) {
      if (iframe.requestFullscreen) iframe.requestFullscreen()
      else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen()
    }
  } else if (e.key === 'Escape') {
    router.push({ name: 'detail', params: { source: route.params.source, id: route.params.id } })
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

watch(() => route.params.episode, v => {
  curIdx.value = Math.max(0, parseInt(v) || 0)
  saveHistory()
})

function switchEp(i) {
  curIdx.value = i
  saveHistory()
  router.replace({ name: 'play', params: { source: route.params.source, id: route.params.id, episode: i } })
}

function saveHistory() {
  if (!detail.value) return
  const s = store.getSource(route.params.source)
  store.pushHistory({
    sourceId: route.params.source,
    sourceName: s?.name || '',
    vodId: route.params.id,
    name: detail.value.name,
    pic: detail.value.pic,
    episode: curIdx.value,
    episodeName: detail.value.episodes[curIdx.value]?.name || '',
  })
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    toast('已复制到剪贴板', 'success')
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
      toast('已复制到剪贴板', 'success')
    } catch {
      toast('复制失败，请手动复制', 'error')
    }
  }
}

function copyLink() { copyToClipboard(window.location.href) }
function copyM3u8() { if (curEp.value?.url) copyToClipboard(curEp.value.url) }
</script>
