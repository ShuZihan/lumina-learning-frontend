<template>
  <!-- 移动端遮罩 -->
  <Teleport to="body">
    <div
      v-if="panelOpen && isMobile"
      class="fixed inset-0 bg-black/40 z-[55]"
      @click="panelOpen = false"
    />
  </Teleport>

  <aside
    class="flex h-full flex-shrink-0 z-[60]"
    :class="isMobile ? 'fixed left-0 top-0 h-screen' : 'relative'"
  >
    <!-- 桌面端图标条 -->
    <div
      class="hidden md:flex w-10 flex-shrink-0 flex-col items-center pt-2 relative border-r border-black/[0.06]"
      style="background-color: #ffffff;"
    >
      <button
        @click="panelOpen = !panelOpen"
        class="w-8 h-8 rounded-md flex items-center justify-center transition-all"
        :class="panelOpen ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'"
        :title="panelOpen ? t('resource.collapsePanel') : t('resource.expandPanel')"
      >
        <svg style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <line x1="9" y1="3" x2="9" y2="21"/>
        </svg>
      </button>
    </div>

    <!-- 滑动面板 -->
    <div
      class="relative flex flex-col overflow-hidden transition-[width] duration-150 ease-in-out border-r border-black/[0.06]"
      :style="{ width: panelOpen ? panelWidth + 'px' : '0px' }"
      style="background-color: #ffffff;"
    >
      <!-- 顶部刷新进度条 -->
      <div v-if="loading" class="absolute top-0 left-0 right-0 h-0.5 overflow-hidden z-10">
        <div class="h-full bg-blue-500 sidebar-loading-bar"></div>
      </div>
      <!-- 文件树 -->
      <div class="flex-1 overflow-y-auto p-2" :style="{ minWidth: panelWidth + 'px' }">
        <!-- 顶部工具栏 -->
        <div class="flex items-center gap-0.5 mb-1 px-1">
          <button
            @click="auth.isGuest ? router.push('/login') : showUploadModal = true"
            :title="auth.isGuest ? t('resource.loginToUpload') : t('resource.uploadTooltip')"
            class="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-blue-500 hover:bg-gray-100 transition-all"
          >
            <svg style="width:14px;height:14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <button
            @click="loadResources"
            :title="t('resource.refresh')"
            :class="loading ? 'animate-spin text-blue-400' : 'text-gray-400 hover:text-blue-500 hover:bg-gray-100'"
            class="w-6 h-6 flex items-center justify-center rounded transition-all"
          >
            <svg style="width:14px;height:14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
          </button>
          <button
            v-if="!auth.isGuest"
            @click="selectedResourceObj && canDelete(selectedResourceObj) && deleteResource(selectedResourceObj)"
            :title="t('resource.delete')"
            :disabled="!selectedResourceObj || !canDelete(selectedResourceObj)"
            class="w-6 h-6 flex items-center justify-center rounded transition-all"
            :class="selectedResourceObj && canDelete(selectedResourceObj)
              ? 'text-gray-400 hover:text-red-500 hover:bg-white/60'
              : 'text-gray-300 cursor-not-allowed'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>

        <!-- public/ 文件夹 -->
          <div class="mb-0.5">
            <button
              @click="publicOpen = !publicOpen"
              class="w-full flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-gray-500 hover:bg-white/40 transition-all"
            >
              <svg style="width:10px;height:10px" class="transition-transform duration-150 flex-shrink-0" :class="publicOpen ? 'rotate-90' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              <svg style="width:13px;height:13px;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
              <span class="text-gray-600">public</span>
              <span class="ml-auto text-gray-400 font-normal">{{ publicFiles.length }}</span>
            </button>
            <div v-if="publicOpen" class="ml-3 mt-0.5 space-y-px">
              <p v-if="publicFiles.length === 0" class="text-xs text-gray-400 px-2 py-1">{{ t('resource.noFiles') }}</p>
              <div
                v-for="resource in publicFiles"
                :key="resource.id"
                class="flex items-center gap-1.5 px-2 py-1 rounded-lg cursor-pointer transition-all"
                :class="selectedResource === resource.storage_key ? 'bg-blue-500/20' : 'hover:bg-white/40'"
                @click="selectResource(resource)"
              >
                <svg style="width:13px;height:13px;flex-shrink:0" :class="getFileColor(resource.file_type)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span class="text-xs text-gray-700 truncate flex-1">{{ resource.original_filename }}</span>
                <span class="text-[10px] text-gray-400 flex-shrink-0">{{ formatFileSize(resource.file_size) }}</span>
              </div>
            </div>
          </div>

          <!-- 我的文件/ 文件夹 -->
          <div v-if="!auth.isGuest" class="mb-0.5">
            <button
              @click="mineOpen = !mineOpen"
              class="w-full flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-gray-500 hover:bg-white/40 transition-all"
            >
              <svg style="width:10px;height:10px" class="transition-transform duration-150 flex-shrink-0" :class="mineOpen ? 'rotate-90' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              <svg style="width:13px;height:13px;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
              <span class="text-gray-600">{{ t('resource.myFiles') }}</span>
              <span class="ml-auto text-gray-400 font-normal">{{ myFiles.length }}</span>
            </button>
            <div v-if="mineOpen" class="ml-3 mt-0.5 space-y-px">
              <p v-if="myFiles.length === 0" class="text-xs text-gray-400 px-2 py-1">{{ t('resource.noFiles') }}</p>
              <div
                v-for="resource in myFiles"
                :key="resource.id"
                class="flex items-center gap-1.5 px-2 py-1 rounded-lg cursor-pointer transition-all"
                :class="selectedResource === resource.storage_key ? 'bg-blue-500/20' : 'hover:bg-white/40'"
                @click="selectResource(resource)"
              >
                <svg style="width:13px;height:13px;flex-shrink:0" :class="getFileColor(resource.file_type)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span class="text-xs text-gray-700 truncate flex-1">{{ resource.original_filename }}</span>
                <span class="text-[10px] text-gray-400 flex-shrink-0">{{ formatFileSize(resource.file_size) }}</span>
              </div>
            </div>
          </div>
      </div>

    </div>

    <!-- 拖动调整面板宽度（桌面端） -->
    <div
      v-if="panelOpen && !isMobile"
      class="absolute top-0 right-0 w-1 h-full cursor-col-resize z-10 bg-blue-500/0 hover:bg-blue-500/30 transition-colors"
      @mousedown="startDrag"
    ></div>

    <!-- 上传 Modal -->
    <Teleport to="body">
      <div v-if="showUploadModal" class="fixed inset-0 z-[200] flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40" @click="closeUploadModal"></div>
        <div class="relative glass rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
          <h3 class="font-bold text-gray-800 text-lg mb-4">{{ t('resource.uploadTitle') }}</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-600 mb-1">{{ t('resource.selectFile') }}</label>
              <input
                ref="fileInputRef"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                @change="onFileSelect"
                class="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-500/10 file:text-blue-600 hover:file:bg-blue-500/20 cursor-pointer"
              />
              <p class="text-xs text-gray-400 mt-1">{{ t('resource.fileHint', { size: maxFileSizeMB }) }}</p>
              <ul v-if="uploadForm.files.length > 0" class="mt-1.5 flex flex-wrap gap-1">
                <li
                  v-for="(f, i) in uploadForm.files"
                  :key="i"
                  class="flex items-center gap-1 text-xs text-gray-600 bg-white/60 border border-[#d1d7dc] rounded px-1.5 py-0.5"
                >
                  <span class="max-w-[120px] truncate">{{ f.name }}</span>
                  <span class="text-gray-400 flex-shrink-0">{{ formatFileSize(f.size) }}</span>
                  <button @click="removeFile(i)" class="text-gray-400 hover:text-red-500 transition-colors leading-none flex-shrink-0">✕</button>
                </li>
              </ul>
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">{{ t('resource.tags') }}</label>
              <input
                v-model="uploadForm.tags"
                type="text"
                :placeholder="t('resource.tagsPlaceholder')"
                class="w-full px-3 py-2 rounded-lg bg-white/60 border border-[#d1d7dc] text-sm text-gray-700 focus:outline-none focus:border-blue-400"
              />
            </div>
            <div v-if="auth.isAdmin" class="flex items-center gap-3 p-3 rounded-lg bg-amber-50/80 border border-amber-200/50">
              <input type="checkbox" id="isPublicCheck" v-model="uploadForm.isPublic" class="w-4 h-4 rounded accent-blue-500" />
              <label for="isPublicCheck" class="text-sm text-gray-700 cursor-pointer">{{ t('resource.makePublic') }}</label>
            </div>
            <p v-else class="text-xs text-gray-400 bg-white/40 rounded-lg px-3 py-2">{{ t('resource.privateNote') }}</p>
          </div>
          <div class="flex gap-3 mt-6">
            <button @click="closeUploadModal" class="flex-1 py-2 rounded-xl bg-white/50 text-gray-600 text-sm font-medium hover:bg-white/80 transition-all border border-[#d1d7dc]">{{ t('resource.cancel') }}</button>
            <button @click="doUpload" :disabled="!uploadForm.files.length || uploading" class="flex-1 py-2 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {{ uploadProgress || t('resource.confirmUpload') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { getApiUrl, getAuthHeaders } from '../utils/api'
import { useAuthStore } from '../stores/auth'

const { t } = useI18n()

const emit = defineEmits<{
  'resource-selected': [storageKey: string, originalFilename: string]
}>()

const auth = useAuthStore()
const router = useRouter()
const isMobile = ref(window.innerWidth < 768)

// 面板开关状态（桌面默认展开，移动端默认收起）
const panelOpen = ref(!isMobile.value)
// 面板宽度（可拖拽调整）
const panelWidth = ref(240)

interface Resource {
  id: string
  filename: string
  original_filename: string
  storage_key: string
  user_id: string | null
  is_public: boolean
  tags: string[]
  parse_status: string
  file_size: number
  file_type: string
  created_at: string
}

const resources = ref<Resource[]>([])
const loading = ref(true)
const selectedResource = ref<string | null>(null)
const maxFileSizeMB = Number(import.meta.env.VITE_MAX_FILE_SIZE_MB || 50)

// 文件树折叠状态
const publicOpen = ref(true)
const mineOpen = ref(true)

const publicFiles = computed(() => resources.value.filter(r => r.is_public))
const myFiles = computed(() => resources.value.filter(r => r.user_id === auth.user?.id))
const selectedResourceObj = computed(() => resources.value.find(r => r.filename === selectedResource.value) ?? null)

// 上传 Modal
const showUploadModal = ref(false)
const uploading = ref(false)
const uploadProgress = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadForm = ref({ files: [] as File[], tags: '', isPublic: false })

const onFileSelect = (e: Event) => {
  uploadForm.value.files = Array.from((e.target as HTMLInputElement).files || [])
}
const removeFile = (index: number) => {
  uploadForm.value.files.splice(index, 1)
}
const closeUploadModal = () => {
  showUploadModal.value = false
  uploadForm.value = { files: [], tags: '', isPublic: false }
  uploadProgress.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}
const doUpload = async () => {
  if (!uploadForm.value.files.length || uploading.value) return
  uploading.value = true
  const errors: string[] = []
  const total = uploadForm.value.files.length
  for (let i = 0; i < total; i++) {
    const file = uploadForm.value.files[i]
    uploadProgress.value = total > 1
      ? t('resource.uploadingProgress', { current: i + 1, total })
      : t('resource.uploading')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('tags', uploadForm.value.tags)
      formData.append('is_public', String(uploadForm.value.isPublic))
      const resp = await fetch(getApiUrl('/api/resources/upload'), {
        method: 'POST', headers: getAuthHeaders(), body: formData,
      })
      const data = await resp.json()
      if (!resp.ok || !data.success) errors.push(`${file.name}：${data.detail || t('resource.unknownError')}`)
    } catch {
      errors.push(`${file.name}：${t('resource.networkError')}`)
    }
  }
  uploading.value = false
  uploadProgress.value = ''
  if (errors.length) alert(t('resource.uploadFailed') + '\n' + errors.join('\n'))
  closeUploadModal()
  await loadResources()
}

const canDelete = (resource: Resource) => !auth.isGuest && (auth.isAdmin || resource.user_id === auth.user?.id)

const deleteResource = async (resource: Resource) => {
  if (!confirm(t('resource.deleteConfirm', { name: resource.original_filename }))) return
  try {
    const resp = await fetch(getApiUrl(`/api/resources/${resource.id}`), {
      method: 'DELETE', headers: getAuthHeaders(),
    })
    if (resp.ok) {
      if (selectedResource.value === resource.storage_key) {
        selectedResource.value = null
        emit('resource-selected', '', '')
      }
      await loadResources()
    } else {
      const data = await resp.json()
      alert(t('resource.deleteFailed') + (data.detail || t('resource.unknownError')))
    }
  } catch { alert(t('resource.deleteNetworkError')) }
}

// 拖动调整面板宽度
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartWidth = ref(0)

const startDrag = (e: MouseEvent) => {
  e.preventDefault()
  isDragging.value = true
  dragStartX.value = e.clientX
  dragStartWidth.value = panelWidth.value
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}
const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return
  panelWidth.value = Math.max(180, Math.min(520, dragStartWidth.value + e.clientX - dragStartX.value))
}
const stopDrag = () => {
  isDragging.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

const loadResources = async () => {
  loading.value = true
  try {
    const resp = await fetch(getApiUrl('/api/resources'), { headers: getAuthHeaders() })
    resources.value = (await resp.json()).resources || []
  } catch { console.error('Failed to load resources') }
  finally { loading.value = false }
}

const selectResource = (resource: Resource) => {
  selectedResource.value = resource.storage_key
  emit('resource-selected', resource.storage_key, resource.original_filename)
  if (isMobile.value) panelOpen.value = false
}

const getFileColor = (fileType: string) => {
  const ext = (fileType || '').replace('.', '').toLowerCase()
  return ({ pdf: 'text-red-400', doc: 'text-blue-400', docx: 'text-blue-400', ppt: 'text-orange-400', pptx: 'text-orange-400', xls: 'text-green-500', xlsx: 'text-green-500' } as Record<string, string>)[ext] || 'text-gray-400'
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return '—'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
  if (!isMobile.value) panelOpen.value = true
}

defineExpose({ toggle: () => { panelOpen.value = !panelOpen.value } })

onMounted(() => { loadResources(); window.addEventListener('resize', handleResize) })
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>
