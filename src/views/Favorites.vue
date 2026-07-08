<template>
  <div class="page">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:22px">
      <h2 style="font-size:18px;font-weight:600">我的收藏</h2>
      <span v-if="store.favorites.length" style="font-size:12px;color:var(--muted)">
        共 {{ store.favorites.length }} 部
      </span>
    </div>

    <div v-if="!store.favorites.length" class="empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:56px;height:56px;margin-bottom:14px;opacity:.35">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <p>还没有收藏任何影片</p>
      <p style="margin-top:6px;font-size:12px">在影片详情页点击「收藏」按钮即可添加</p>
    </div>

    <div v-else class="fav-grid">
      <div v-for="f in store.favorites" :key="f.sourceId + f.vodId" class="fav-card" @click="goDetail(f)">
        <div class="scroll-poster">
          <img :src="poster(f.pic)" :alt="f.name" loading="lazy" referrerpolicy="no-referrer"
            @error="safeImgError" />
          <div class="scroll-play">
            <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="8,5 8,19 19,12" /></svg>
          </div>
          <button class="fav-del" @click.stop="removeFav(f)" title="取消收藏">✕</button>
        </div>
        <div class="scroll-info">
          <span class="scroll-name">{{ f.name }}</span>
          <span v-if="f.sourceName" class="scroll-meta" style="color:var(--accent)">{{ f.sourceName }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/index.js'
import { poster, safeImgError } from '../utils/helpers.js'

const router = useRouter()
const toast = inject('toast')

function goDetail(f) {
  router.push({ name: 'detail', params: { source: f.sourceId, id: f.vodId } })
}

function removeFav(f) {
  store.removeFavorite(f.sourceId, f.vodId)
  toast('已取消收藏', 'info')
}
</script>
