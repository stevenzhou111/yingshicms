import { store } from '../store/index.js'

/* ------------------------------------------------------------------ */
/*  Request through server-side proxy with timeout + retry             */
/* ------------------------------------------------------------------ */

const REQUEST_TIMEOUT = 15000 // 15 seconds
const MAX_RETRIES = 2

async function request(source, params = {}) {
  const base = source.api.replace(/\/+$/, '')
  const qs = new URLSearchParams(params).toString()
  const target = base + (qs ? '?' + qs : '')
  const url = '/api/proxy?url=' + encodeURIComponent(target)

  let lastError
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
      const resp = await fetch(url, { signal: controller.signal })
      clearTimeout(timer)
      if (!resp.ok) throw new Error(`请求失败 (HTTP ${resp.status})`)
      const text = await resp.text()
      return parseResponse(text)
    } catch (e) {
      lastError = e
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 500 * (attempt + 1)))
      }
    }
  }
  throw lastError || new Error('网络请求失败')
}

function parseResponse(text) {
  const trimmed = text.trim()
  try { return JSON.parse(trimmed) } catch {}
  const m = trimmed.match(/^\w+\s*\(\s*([\s\S]+)\s*\)\s*;?\s*$/)
  if (m) {
    try { return JSON.parse(m[1]) } catch {}
  }
  throw new Error('数据解析失败，请检查API地址是否正确')
}

/* ------------------------------------------------------------------ */
/*  Normalise Apple CMS response                                       */
/* ------------------------------------------------------------------ */

function normList(data) {
  if (!data?.list) return []
  return data.list.map(v => ({
    id: v.vod_id,
    name: v.vod_name,
    pic: v.vod_pic,
    year: v.vod_year || '',
    area: v.vod_area || '',
    type: v.type_name || '',
    remarks: v.vod_remarks || '',
    score: v.vod_score || '',
  }))
}

function normDetail(data) {
  if (!data?.list?.[0]) return null
  const v = data.list[0]
  return {
    id: v.vod_id,
    name: v.vod_name,
    pic: v.vod_pic,
    year: v.vod_year || '',
    area: v.vod_area || '',
    type: v.type_name || '',
    remarks: v.vod_remarks || '',
    score: v.vod_score || '',
    desc: (v.vod_content || '').replace(/<[^>]+>/g, ''),
    director: v.vod_director || '',
    actor: v.vod_actor || '',
    episodes: parseEpisodes(v.vod_play_url),
  }
}

function parseEpisodes(str) {
  if (!str) return []
  const groups = str.split('$$$')
  const firstGroup = groups[0] || str
  return firstGroup.split('#').filter(Boolean).map(ep => {
    const i = ep.indexOf('$')
    return i === -1
      ? { name: ep.trim(), url: '' }
      : { name: ep.slice(0, i).trim(), url: ep.slice(i + 1).trim() }
  })
}

/* ------------------------------------------------------------------ */
/*  Public API                                                          */
/* ------------------------------------------------------------------ */

export const api = {
  async categories(source) {
    const d = await request(source, { ac: 'list', pg: 1 })
    return (d.class || []).map(c => ({ id: c.type_id, name: c.type_name }))
  },

  async list(source, { pg = 1, tid, wd } = {}) {
    const p = { ac: 'detail', pg }
    if (tid) p.t = tid
    if (wd) p.wd = wd
    const d = await request(source, p)
    return { list: normList(d), total: d.pagecount || 1, page: d.page || pg }
  },

  async detail(source, id) {
    const d = await request(source, { ac: 'detail', ids: id })
    return normDetail(d)
  },

  async searchAll(keyword) {
    const sources = store.enabledSources
    if (!sources.length) return { groups: [], errors: [] }
    const results = await Promise.allSettled(
      sources.map(async src => {
        const res = await api.list(src, { wd: keyword })
        return { source: src, list: res.list }
      })
    )
    const groups = []
    const errors = []
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        groups.push(r.value)
      } else {
        errors.push({ source: sources[i].name, error: r.reason?.message || '请求失败' })
      }
    })
    return { groups, errors }
  },
}
