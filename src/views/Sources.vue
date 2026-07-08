<template>
  <div class="page">
    <!-- Header -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:22px;flex-wrap:wrap;gap:10px">
      <h2 style="font-size:18px;font-weight:600">数据源管理</h2>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn" @click="showImport = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          导入
        </button>
        <button class="btn" @click="doExport" :disabled="!store.sources.length">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          导出
        </button>
        <button class="btn btn-primary" @click="openModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          添加源
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!store.sources.length" class="empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
      <p>还没有添加任何数据源</p>
      <p style="margin-top:6px;font-size:11px">支持苹果CMS API，地址格式通常为 https://域名/api.php/provide/vod/</p>
      <div style="margin-top:16px;display:flex;gap:8px;justify-content:center">
        <button class="btn" @click="showImport = true">批量导入</button>
        <button class="btn btn-primary" @click="openModal()">手动添加</button>
      </div>
    </div>

    <!-- Batch toolbar -->
    <div v-if="store.sources.length && selected.size > 0" class="batch-bar">
      <label class="batch-check" @click.stop>
        <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" />
        <span>全选</span>
      </label>
      <span style="font-size:12px;color:var(--text2)">
        已选 {{ selected.size }} 项
      </span>
      <div class="batch-actions">
        <button class="btn" @click="batchEnable">启用</button>
        <button class="btn" @click="batchDisable">禁用</button>
        <button class="btn btn-danger" @click="showBatchDel = true">删除</button>
        <button class="text-btn" @click="selected.clear()">取消</button>
      </div>
    </div>

    <!-- Source list -->
    <div v-if="store.sources.length" class="src-filter">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
      <input v-model="filterText" placeholder="搜索源名称或API地址..." />
      <span v-if="filterText" class="src-filter-clear" @click="filterText = ''">✕</span>
      <span v-if="filterText" style="font-size:11px;color:var(--muted);flex-shrink:0">
        {{ filtered.length }}/{{ store.sources.length }}
      </span>
    </div>

    <div v-if="filtered.length" class="src-list">
      <div v-for="s in filtered" :key="s.id" class="src-item"
        :class="{ 'src-selected': selected.has(s.id) }" @click="toggleSelect(s.id)">
        <input type="checkbox" :checked="selected.has(s.id)" @click.stop="toggleSelect(s.id)" class="src-checkbox" />
        <div class="src-icon">{{ s.name.charAt(0) }}</div>
        <div class="src-info">
          <h3 v-html="highlight(s.name)"></h3>
          <p v-html="highlight(s.api)"></p>
        </div>
        <div class="sw" :class="{ on: s.enabled }" @click.stop="toggle(s)"></div>
        <div class="src-actions">
          <button class="btn" @click.stop="openModal(s)">编辑</button>
          <button class="btn btn-danger" @click.stop="delTarget = s">删除</button>
        </div>
      </div>
    </div>

    <div v-else-if="store.sources.length && filterText" class="empty" style="padding:40px">
      <p>没有匹配「{{ filterText }}」的数据源</p>
      <button class="btn" style="margin-top:10px" @click="filterText = ''">清除筛选</button>
    </div>

    <!-- Stats -->
    <div v-if="store.sources.length" style="margin-top:16px;font-size:11px;color:var(--muted);text-align:center">
      共 {{ store.sources.length }} 个源 · {{ store.enabledSources.length }} 个启用
      <template v-if="filterText"> · 当前显示 {{ filtered.length }} 个</template>
    </div>

    <!-- ====== Add/Edit modal ====== -->
    <div v-if="showModal" class="overlay" @click.self="closeModal">
      <div class="modal">
        <h2>{{ editSrc ? '编辑数据源' : '添加苹果CMS源' }}</h2>
        <div class="field">
          <label>源名称</label>
          <input v-model="form.name" placeholder="如：极速资源" />
        </div>
        <div class="field">
          <label>API地址</label>
          <input v-model="form.api" placeholder="https://api.example.com/api.php/provide/vod/" />
          <div class="hint">苹果CMS数据接口，通常以 /api.php/provide/vod/ 结尾</div>
        </div>
        <div class="field">
          <label>是否启用</label>
          <div class="sw" :class="{ on: form.enabled }" @click="form.enabled = !form.enabled"></div>
        </div>
        <div class="modal-foot">
          <button class="btn" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="save" :disabled="!form.name || !form.api">
            {{ editSrc ? '保存' : '添加' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ====== Delete confirm ====== -->
    <div v-if="delTarget" class="overlay" @click.self="delTarget = null">
      <div class="confirm-box">
        <h3>确认删除</h3>
        <p>确定要删除「{{ delTarget.name }}」吗？</p>
        <div class="confirm-foot">
          <button class="btn" @click="delTarget = null">取消</button>
          <button class="btn btn-danger" @click="doDelete">删除</button>
        </div>
      </div>
    </div>

    <!-- ====== Batch delete confirm ====== -->
    <div v-if="showBatchDel" class="overlay" @click.self="showBatchDel = false">
      <div class="confirm-box">
        <h3>批量删除</h3>
        <p>确定要删除选中的 {{ selected.size }} 个数据源吗？此操作不可恢复。</p>
        <div class="confirm-foot">
          <button class="btn" @click="showBatchDel = false">取消</button>
          <button class="btn btn-danger" @click="doBatchDelete">删除</button>
        </div>
      </div>
    </div>

    <!-- ====== Import modal ====== -->
    <div v-if="showImport" class="overlay" @click.self="showImport = false">
      <div class="modal" style="max-width:540px">
        <h2>导入数据源</h2>

        <div class="src-tabs" style="margin-bottom:14px">
          <button class="src-tab-pill" :class="{ on: importMode === 'json' }" @click="importMode = 'json'">JSON格式</button>
          <button class="src-tab-pill" :class="{ on: importMode === 'urls' }" @click="importMode = 'urls'">URL列表</button>
        </div>

        <div v-if="importMode === 'json'" class="field">
          <label>粘贴JSON数据</label>
          <textarea v-model="importText" rows="8" style="resize:vertical"
            placeholder='[{"name":"资源名","api":"https://xxx/api.php/provide/vod/"}]'></textarea>
          <div class="hint">支持从「导出」功能复制的JSON格式</div>
        </div>

        <div v-else class="field">
          <label>每行一个API地址</label>
          <textarea v-model="importText" rows="8" style="resize:vertical"
            placeholder="https://ffzy5.tv/api.php/provide/vod/&#10;https://api.lbxin.vip/api.php/provide/vod/"></textarea>
          <div class="hint">源名称将自动从域名提取，可导入后编辑</div>
        </div>

        <div v-if="importMsg" style="padding:8px 12px;border-radius:6px;font-size:12px;margin-bottom:12px"
          :style="{ background: importOk ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)', color: importOk ? '#22c55e' : '#ef4444' }">
          {{ importMsg }}
        </div>

        <div class="modal-foot">
          <button class="btn" @click="showImport = false">取消</button>
          <button class="btn btn-primary" @click="doImport" :disabled="!importText.trim()">导入</button>
        </div>
      </div>
    </div>

    <!-- ====== Export modal ====== -->
    <div v-if="showExport" class="overlay" @click.self="showExport = false">
      <div class="modal" style="max-width:540px">
        <h2>导出数据源</h2>
        <div class="field">
          <label>复制以下JSON数据</label>
          <textarea :value="exportText" rows="8" readonly style="resize:vertical;cursor:text"
            @click="$event.target.select()"></textarea>
        </div>
        <div class="modal-foot">
          <button class="btn" @click="showExport = false">关闭</button>
          <button class="btn btn-primary" @click="copyExport">
            {{ copied ? '已复制!' : '复制到剪贴板' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { store } from '../store/index.js'

// ---- Filter ----
const filterText = ref('')

const filtered = computed(() => {
  if (!filterText.value.trim()) return store.sources
  const q = filterText.value.trim().toLowerCase()
  return store.sources.filter(s =>
    s.name.toLowerCase().includes(q) || s.api.toLowerCase().includes(q)
  )
})

function highlight(text) {
  if (!filterText.value.trim()) return text
  const q = filterText.value.trim()
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return escaped.replace(regex, '<mark style="background:rgba(99,102,241,.25);color:var(--text);border-radius:2px;padding:0 1px">$1</mark>')
}

// ---- Selection ----
const selected = reactive(new Set())
const isAllSelected = computed(() => filtered.value.length > 0 && filtered.value.every(s => selected.has(s.id)))

function toggleSelect(id) {
  if (selected.has(id)) selected.delete(id)
  else selected.add(id)
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    filtered.value.forEach(s => selected.delete(s.id))
  } else {
    filtered.value.forEach(s => selected.add(s.id))
  }
}

// ---- Toggle enable ----
function toggle(s) { store.updateSource(s.id, { enabled: !s.enabled }) }

// ---- Add/Edit ----
const showModal = ref(false)
const editSrc = ref(null)
const form = reactive({ name: '', api: '', enabled: true })

function openModal(s = null) {
  editSrc.value = s
  form.name = s?.name || ''
  form.api = s?.api || ''
  form.enabled = s?.enabled ?? true
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editSrc.value = null
  form.name = ''
  form.api = ''
  form.enabled = true
}

function save() {
  if (!form.name || !form.api) return
  if (editSrc.value) {
    store.updateSource(editSrc.value.id, { name: form.name, api: form.api, enabled: form.enabled })
  } else {
    store.addSource({ name: form.name, api: form.api, enabled: form.enabled })
  }
  closeModal()
}

// ---- Single delete ----
const delTarget = ref(null)
function doDelete() {
  store.removeSource(delTarget.value.id)
  selected.delete(delTarget.value.id)
  delTarget.value = null
}

// ---- Batch operations ----
const showBatchDel = ref(false)

function batchEnable() {
  store.batchEnable([...selected])
  selected.clear()
}

function batchDisable() {
  store.batchDisable([...selected])
  selected.clear()
}

function doBatchDelete() {
  store.batchRemove([...selected])
  selected.clear()
  showBatchDel.value = false
}

// ---- Import ----
const showImport = ref(false)
const importMode = ref('urls')
const importText = ref('')
const importMsg = ref('')
const importOk = ref(false)

function doImport() {
  importMsg.value = ''
  const raw = importText.value.trim()
  if (!raw) return

  let list = []

  if (importMode.value === 'json') {
    try {
      const parsed = JSON.parse(raw)
      list = Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      importMsg.value = 'JSON格式错误，请检查'
      importOk.value = false
      return
    }
  } else {
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
    list = lines.map(url => ({ api: url }))
  }

  const added = store.importSources(list)
  importMsg.value = `成功导入 ${added} 个数据源` + (added < list.length ? `（${list.length - added} 个重复已跳过）` : '')
  importOk.value = true
  importText.value = ''

  setTimeout(() => { importMsg.value = '' }, 3000)
}

// ---- Export ----
const showExport = ref(false)
const exportText = ref('')
const copied = ref(false)

function doExport() {
  exportText.value = JSON.stringify(store.exportSources(), null, 2)
  copied.value = false
  showExport.value = true
}

function copyExport() {
  navigator.clipboard.writeText(exportText.value).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }).catch(() => {
    const ta = document.createElement('textarea')
    ta.value = exportText.value
    ta.style.cssText = 'position:fixed;left:-9999px'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  })
}
</script>
