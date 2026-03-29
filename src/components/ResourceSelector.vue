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
      class="hidden md:flex w-10 flex-shrink-0 flex-col items-center pt-2 relative border-r border-black/[0.06] bg-gray-50"
    >
      <button
        @click="togglePanel"
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
      class="relative flex flex-col overflow-hidden transition-[width] duration-150 ease-in-out border-r border-black/[0.06] bg-gray-50"
      :style="{ width: panelOpen ? panelWidth + 'px' : '0px' }"
    >
      <!-- 顶部刷新进度条（对应当前标签） -->
      <div v-if="(activeTab === 'public' && publicTopLoading) || (activeTab === 'personal' && personalTopLoading)" class="absolute top-0 left-0 right-0 h-0.5 overflow-hidden z-10">
        <div class="h-full bg-blue-500 sidebar-loading-bar"></div>
      </div>
      <!-- 文件树 -->
      <div class="flex-1 overflow-y-auto relative" :style="{ minWidth: panelWidth + 'px' }">
        <!-- 首次进入大转圈加载（仅覆盖文件列表，不挡住顶部操作按钮） -->
        <div
          v-if="(activeTab === 'public' && publicFullLoading) || (activeTab === 'personal' && personalFullLoading)"
          class="absolute left-0 right-0 bottom-0 top-[88px] flex items-center justify-center bg-gray-50/90 z-20"
        >
          <svg class="w-8 h-8 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round" />
          </svg>
        </div>

        <!-- 顶部标签栏 -->
        <div class="p-2 border-b border-gray-200/50">
          <div class="flex gap-1 p-1 bg-white/40 rounded-lg">
            <button
              @click="activeTab = 'public'"
              class="flex-1 py-1.5 px-2 rounded text-xs font-medium transition-all"
              :class="activeTab === 'public' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-white/30'"
            >
              公共资源
            </button>
            <button
              @click="activeTab = 'personal'"
              class="flex-1 py-1.5 px-2 rounded text-xs font-medium transition-all"
              :class="activeTab === 'personal' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-white/30'"
              :disabled="auth.isGuest"
            >
              我的文件
            </button>
          </div>
        </div>

        <!-- 顶部工具栏 -->
        <div class="flex items-center gap-0.5 my-1 px-3">
          <button
            @click="openUploadModal"
            :title="auth.isGuest ? t('resource.loginToUpload') : t('resource.uploadTooltip')"
            class="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-blue-500 hover:bg-gray-100 transition-all"
          >
            <svg style="width:14px;height:14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <button
            @click="refreshCurrentTab"
            :title="t('resource.refresh')"
            class="w-6 h-6 flex items-center justify-center rounded transition-all text-gray-400 hover:text-blue-500 hover:bg-gray-100"
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
            class="w-6 h-6 flex items-center justify-center rounded transition-all ml-auto"
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

        <!-- 公共资源列表 -->
        <div v-if="activeTab === 'public'" class="p-2 space-y-1">
          <p v-if="publicResources.length === 0 && !publicFullLoading" class="text-center py-10 text-gray-400 text-xs">{{ t('resource.noFiles') }}</p>
          <div
            v-for="resource in publicResources"
            :key="resource.id"
            class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-all"
            :class="selectedResource === resource.storage_key ? 'bg-blue-500/20' : 'hover:bg-white/40'"
            @click="selectResource(resource)"
          >
            <svg style="width:13px;height:13px;flex-shrink:0" :class="getFileColor(resource.file_type)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span class="text-sm text-gray-700 truncate flex-1">{{ resource.original_filename }}</span>
            <span class="text-xs text-gray-400 flex-shrink-0">{{ formatFileSize(resource.file_size) }}</span>
          </div>
        </div>

        <!-- 个人资源列表 -->
        <div v-else class="p-2 space-y-1">
          <p v-if="auth.isGuest" class="text-center py-10 text-gray-400 text-xs">请登录后查看个人文件</p>
          <p v-else-if="personalResources.length === 0 && !personalFullLoading" class="text-center py-10 text-gray-400 text-xs">{{ t('resource.noFiles') }}</p>
          <div
            v-for="resource in personalResources"
            :key="resource.id"
            class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-all"
            :class="selectedResource === resource.storage_key ? 'bg-blue-500/20' : 'hover:bg-white/40'"
            @click="selectResource(resource)"
          >
            <svg style="width:13px;height:13px;flex-shrink:0" :class="getFileColor(resource.file_type)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span class="text-sm text-gray-700 truncate flex-1">{{ resource.original_filename }}</span>
            <span class="text-xs text-gray-400 flex-shrink-0">{{ formatFileSize(resource.file_size) }}</span>
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
              <p class="text-sm text-gray-400 mt-1">{{ t('resource.fileHint', { size: maxFileSizeMB }) }}</p>
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
            <!-- 上传提示 -->
            <div class="p-3 rounded-lg" :class="activeTab === 'public' ? 'bg-blue-50/80 border border-blue-200/50' : 'bg-gray-50/80 border border-gray-200/50'">
              <p class="text-sm" :class="activeTab === 'public' ? 'text-blue-700' : 'text-gray-700'">
                {{ activeTab === 'public' ? '⚠️ 您正在上传到公共资源区，所有用户都可以查看和使用该文件' : '🔒 您正在上传到个人空间，仅您自己可见' }}
              </p>
            </div>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { getApiUrl, getAuthHeaders } from '../utils/api'
import { useAuthStore } from '../stores/auth'
import { useSidebar } from '../composables/useSidebar'
import { StorageKeys, getItem, setItem } from '../utils/storage'

const { t } = useI18n()

const emit = defineEmits<{
  'resource-selected': [storageKey: string, originalFilename: string]
}>()

const auth = useAuthStore()
const router = useRouter()
const isMobile = ref(window.innerWidth < 768)

// 使用统一的侧边栏状态管理
const { collapsed: panelOpen, toggle } = useSidebar()

// 面板宽度（可拖拽调整）
const panelWidth = ref(280)

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

const selectedResource = ref<string | null>(null)
const maxFileSizeMB = Number(import.meta.env.VITE_MAX_FILE_SIZE_MB || 50)

// 标签页状态
const activeTab = ref<'public' | 'personal'>('public')
// 公共资源状态
const publicResources = ref<Resource[]>([])
const publicTopLoading = ref(false)
const publicFullLoading = ref(false)
// 个人资源状态
const personalResources = ref<Resource[]>([])
const personalTopLoading = ref(false)
const personalFullLoading = ref(false)

const selectedResourceObj = computed(() => {
  if (activeTab.value === 'public') {
    return publicResources.value.find(r => r.storage_key === selectedResource.value) ?? null
  } else {
    return personalResources.value.find(r => r.storage_key === selectedResource.value) ?? null
  }
})

// 缓存配置：1小时有效期
const CACHE_TTL = 3600 * 1000 // 1小时
const CACHE_ENABLED = true

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
const openUploadModal = () => {
  if (auth.isGuest) {
    router.push('/login')
    return
  }
  // 根据当前标签自动设置公开属性
  uploadForm.value = {
    files: [],
    tags: '',
    isPublic: activeTab.value === 'public' // 公共标签默认公开，个人标签默认私有
  }
  showUploadModal.value = true
}

const closeUploadModal = () => {
  showUploadModal.value = false
  uploadForm.value = { files: [], tags: '', isPublic: false }
  uploadProgress.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}
// 新增：计算文件SHA256哈希
const calculateFileHash = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

const doUpload = async () => {
  if (!uploadForm.value.files.length || uploading.value) return
  uploading.value = true
  const errors: string[] = []
  const total = uploadForm.value.files.length
  for (let i = 0; i < total; i++) {
    const file = uploadForm.value.files[i]
    // 先计算文件哈希
    uploadProgress.value = '正在校验文件...'
    const contentHash = await calculateFileHash(file)

    uploadProgress.value = total > 1
      ? t('resource.uploadingProgress', { current: i + 1, total })
      : t('resource.uploading')
    try {
      const formData = new FormData()
      formData.append('file', file)
      // 新文件系统接口参数：个人文件固定personal_global场景
      formData.append('content_hash', contentHash)
      formData.append('biz_type', 'personal_global')
      formData.append('biz_id', auth.user?.id || '')
      // tags和is_public暂时保留，后续需要的话再存到文件表
      formData.append('tags', uploadForm.value.tags)
      formData.append('is_public', String(uploadForm.value.isPublic))

      const resp = await fetch(getApiUrl('/api/files/upload'), {
        method: 'POST', headers: getAuthHeaders(), body: formData,
      })
      if (!resp.ok) {
        const data = await resp.json()
        errors.push(`${file.name}：${data.detail || t('resource.unknownError')}`)
      }
    } catch {
      errors.push(`${file.name}：${t('resource.networkError')}`)
    }
  }
  uploading.value = false
  uploadProgress.value = ''
  if (errors.length) alert(t('resource.uploadFailed') + '\n' + errors.join('\n'))
  closeUploadModal()
  await refreshCurrentTab()
}

const canDelete = (resource: Resource) => !auth.isGuest && (auth.isAdmin || resource.user_id === auth.user?.id)

const deleteResource = async (resource: Resource) => {
  if (!confirm(t('resource.deleteConfirm', { name: resource.original_filename }))) return
  try {
    const resp = await fetch(getApiUrl(`/api/files/${resource.id}`), {
      method: 'DELETE', headers: getAuthHeaders(),
    })
    if (resp.ok) {
      if (selectedResource.value === resource.storage_key) {
        selectedResource.value = null
        emit('resource-selected', '', '')
      }
      await refreshCurrentTab()
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

// 加载公共资源
const loadPublicResources = async (forceRefresh = false) => {
  if (CACHE_ENABLED && !forceRefresh) {
    const cached = getItem<Resource[]>(StorageKeys.RESOURCES_CACHE_PUBLIC)
    const cacheTime = getItem<number>(StorageKeys.RESOURCES_CACHE_TIME_PUBLIC)
    // 空数组也视为有效缓存
    if (cached != null && cacheTime && Date.now() - cacheTime < CACHE_TTL) {
      publicResources.value = cached
      // 有缓存且不是用户主动刷新：直接用缓存，不发请求不刷新
      return
    }
  }

  // 只有无缓存 或 用户主动点击刷新时才发请求
  if (forceRefresh) {
    // 用户主动刷新：显示顶部加载条
    publicTopLoading.value = true
    publicFullLoading.value = false
  } else {
    // 首次进入无缓存：显示大转圈
    publicTopLoading.value = false
    publicFullLoading.value = true
  }

  try {
    const resp = await fetch(getApiUrl('/api/files/list?biz_type=personal_global&biz_id=public&page_size=100'), {
      headers: getAuthHeaders(),
      cache: 'no-store' // 主动刷新时跳过浏览器HTTP缓存
    })
    if (resp.ok) {
      const data = await resp.json()
      publicResources.value = (data.data || []).filter((r: Resource) => r.is_public)
      // 空数组也写入缓存
      if (CACHE_ENABLED) {
        setItem(StorageKeys.RESOURCES_CACHE_PUBLIC, publicResources.value)
        setItem(StorageKeys.RESOURCES_CACHE_TIME_PUBLIC, Date.now())
      }
    }
  } catch (e) {
    console.error('公共资源加载失败', e)
  } finally {
    publicTopLoading.value = false
    publicFullLoading.value = false
  }
}

// 加载个人资源
const loadPersonalResources = async (forceRefresh = false) => {
  if (auth.isGuest) {
    personalResources.value = []
    return
  }

  if (CACHE_ENABLED && !forceRefresh) {
    const cached = getItem<Resource[]>(StorageKeys.RESOURCES_CACHE_PERSONAL)
    const cacheTime = getItem<number>(StorageKeys.RESOURCES_CACHE_TIME_PERSONAL)
    // 空数组也视为有效缓存
    if (cached != null && cacheTime && Date.now() - cacheTime < CACHE_TTL) {
      personalResources.value = cached
      // 有缓存且不是用户主动刷新：直接用缓存，不发请求不刷新
      return
    }
  }

  // 只有无缓存 或 用户主动点击刷新时才发请求
  if (forceRefresh) {
    // 用户主动刷新：显示顶部加载条
    personalTopLoading.value = true
    personalFullLoading.value = false
  } else {
    // 首次进入无缓存：显示大转圈
    personalTopLoading.value = false
    personalFullLoading.value = true
  }

  try {
    const resp = await fetch(getApiUrl(`/api/files/list?biz_type=personal_global&biz_id=${auth.user?.id}&page_size=100`), {
      headers: getAuthHeaders(),
      cache: 'no-store' // 主动刷新时跳过浏览器HTTP缓存
    })
    if (resp.ok) {
      const data = await resp.json()
      personalResources.value = data.data || []
      // 空数组也写入缓存
      if (CACHE_ENABLED) {
        setItem(StorageKeys.RESOURCES_CACHE_PERSONAL, personalResources.value)
        setItem(StorageKeys.RESOURCES_CACHE_TIME_PERSONAL, Date.now())
      }
    }
  } catch (e) {
    console.error('个人资源加载失败', e)
  } finally {
    personalTopLoading.value = false
    personalFullLoading.value = false
  }
}

// 刷新当前标签资源
const refreshCurrentTab = () => {
  if (activeTab.value === 'public') {
    loadPublicResources(true)
  } else {
    loadPersonalResources(true)
  }
}

// 标签切换逻辑
watch(activeTab, (tab) => {
  if (tab === 'public' && publicResources.value.length === 0) {
    loadPublicResources()
  } else if (tab === 'personal' && personalResources.value.length === 0 && !auth.isGuest) {
    loadPersonalResources()
  }
})

const selectResource = (resource: Resource) => {
  selectedResource.value = resource.storage_key
  emit('resource-selected', resource.storage_key, resource.original_filename)
  if (isMobile.value) panelOpen.value = false
}

const togglePanel = () => {
  toggle()
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
  // 不再强制展开/收起，尊重用户的存储偏好
}

defineExpose({ toggle: togglePanel })

onMounted(() => { loadPublicResources(); window.addEventListener('resize', handleResize) })
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>
