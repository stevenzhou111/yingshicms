<template>
  <div class="page">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:22px">
      <h2 style="font-size:18px;font-weight:600">播放历史</h2>
      <div style="display:flex;gap:8px;align-items:center">
        <span v-if="store.history.length" style="font-size:12px;color:var(--muted)">
          共 {{ store.history.length }} 条
        </span>
        <button v-if="store.history.length" class="btn btn-danger" @click="confirmClear = true">清空历史</button>
      </div>
    </div>

    <div v-if="!store.history.length" class="empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:56px;height:56px;margin-bottom:14px;opacity:.35">
        <circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" />
      </svg>
      <p>暂无播放记录</p>
      <p style="margin-top:6px;font-size:12px">观看影片后会自动记录在这里</p>
    </div>

    <div v-else class="hist-list">
      <div v-for="h in store.history" :key="h.sourceId + h.vodId + h.episode"
        class="hist-item" @click="goPlay(h)">
        <div class="hist-thumb">
          <img :src="poster(h.pic)" referrerpolicy="no-referrer" @error="safeImgError" />
        </div>
        <div class="hist-body">
          <h4>{{ h.name }}</h4>
          <p>
            <span v-if="h.sourceName" class="tag tag-accent" style="margin-right:4px;padding:1px 6px;font-size:10px">
              {{ h.sourceName }}
            </span>
            {{ h.episodeName || episodeLabel(h.episode) }}
          </p>
        </div>
        <span class="hist-time">{{ timeAgo(h.ts) }}</span>
        <button class="hist-del-btn" @click.stop="removeHist(h)" title="删除">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <div v-if="confirmClear" class="overlay" @click.self="confirmClear = false">
      <div class="confirm-box">
        <h3>确认清空</h3>
        <p>确定要清空所有播放历史吗？</p>
        <div class="confirm-foot">
          <button class="btn" @click="confirmClear = false">取消</button>
          <button class="btn btn-danger" @click="doClear">清空</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/index.js'
import { poster, safeImgError, timeAgo } from '../utils/helpers.js'

const router = useRouter()
const confirmClear = ref(false)

function episodeLabel(ep) {
  if (ep == null || isNaN(ep)) return '未知集数'
  return '第' + (ep + 1) + '集'
}

function goPlay(h) {
  router.push({ name: 'play', params: { source: h.sourceId, id: h.vodId, episode: h.episode || 0 } })
}

function removeHist(h) {
  const key = `${h.sourceId}:${h.vodId}`
  const idx = store.history.findIndex(item => `${item.sourceId}:${item.vodId}` === key)
  if (idx !== -1) {
    store.history.splice(idx, 1)
    try { localStorage.setItem('cm_history', JSON.stringify(store.history)) } catch {}
  }
}

function doClear() {
  store.clearHistory()
  confirmClear.value = false
}
</script>
