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
    <!-- 纸张折痕分界线（整个 aside 右边缘） -->
    <div class="absolute top-0 right-0 w-[3px] h-full z-10 pointer-events-none">
      <div class="absolute left-0 top-0 h-full w-[1px] bg-[#d9d1bf]"></div>
      <div class="absolute left-[1px] top-0 h-full w-[2px] bg-[rgba(255,255,255,0.6)]"></div>
    </div>


    <!-- 桌面端图标条 -->
    <div
      class="hidden md:flex w-10 flex-shrink-0 flex-col items-center pt-2 relative"
      style="background-color: #f3ede0;"
    >
      <button
        @click="panelOpen = !panelOpen"
        class="w-8 h-8 rounded-md flex items-center justify-center transition-all"
        :class="panelOpen ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600 hover:bg-white/60'"
        :title="panelOpen ? '收起侧边栏' : '展开侧边栏'"
      >
        <span class="text-lg">📚</span>
      </button>
      <!-- 图标条与面板之间的小刻痕 -->
      <div class="absolute top-0 right-0 h-full w-[2px] pointer-events-none">
        <div class="absolute inset-0 w-[1px] bg-[#d9d1bf]"></div>
        <div class="absolute left-[1px] inset-y-0 w-[1px] bg-[rgba(255,255,255,0.5)]"></div>
      </div>
    </div>

    <!-- 滑动面板 -->
    <div
      class="flex flex-col overflow-hidden transition-[width] duration-150 ease-in-out"
      :style="{ width: panelOpen ? panelWidth + 'px' : '0px' }"
      style="background-color: #f3ede0; background-image: inherit; background-size: inherit;"
    >
      <!-- 文件树 -->
      <div class="flex-1 overflow-y-auto p-2" :style="{ minWidth: panelWidth + 'px' }">
        <!-- 顶部工具栏 -->
        <div v-if="!auth.isGuest" class="flex items-center gap-0.5 mb-1 px-1">
          <button
            @click="showUploadModal = true"
            title="上传资源"
            class="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-blue-500 hover:bg-white/60 transition-all text-base"
          >+</button>
          <button
            @click="selectedResourceObj && canDelete(selectedResourceObj) && deleteResource(selectedResourceObj)"
            title="删除选中文件"
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

        <div v-if="loading" class="text-center py-8">
          <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p class="text-gray-500 text-sm">加载中...</p>
        </div>

        <template v-else>
          <!-- public/ 文件夹 -->
          <div class="mb-0.5">
            <button
              @click="publicOpen = !publicOpen"
              class="w-full flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-gray-500 hover:bg-white/40 transition-all"
            >
              <span class="text-[10px] transition-transform duration-150 inline-block" :class="publicOpen ? 'rotate-90' : ''">▶</span>
              <span>📁</span>
              <span class="text-gray-600">public</span>
              <span class="ml-auto text-gray-400 font-normal">{{ publicFiles.length }}</span>
            </button>
            <div v-if="publicOpen" class="ml-3 mt-0.5 space-y-px">
              <p v-if="publicFiles.length === 0" class="text-xs text-gray-400 px-2 py-1">暂无文件</p>
              <div
                v-for="resource in publicFiles"
                :key="resource.id"
                class="flex items-center gap-1.5 px-2 py-1 rounded-lg cursor-pointer transition-all"
                :class="selectedResource === resource.filename ? 'bg-blue-500/20' : 'hover:bg-white/40'"
                @click="selectResource(resource)"
              >
                <span class="text-sm flex-shrink-0">{{ getFileIcon(resource.file_type) }}</span>
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
              <span class="text-[10px] transition-transform duration-150 inline-block" :class="mineOpen ? 'rotate-90' : ''">▶</span>
              <span>📁</span>
              <span class="text-gray-600">我的文件</span>
              <span class="ml-auto text-gray-400 font-normal">{{ myFiles.length }}</span>
            </button>
            <div v-if="mineOpen" class="ml-3 mt-0.5 space-y-px">
              <p v-if="myFiles.length === 0" class="text-xs text-gray-400 px-2 py-1">暂无文件</p>
              <div
                v-for="resource in myFiles"
                :key="resource.id"
                class="flex items-center gap-1.5 px-2 py-1 rounded-lg cursor-pointer transition-all"
                :class="selectedResource === resource.filename ? 'bg-blue-500/20' : 'hover:bg-white/40'"
                @click="selectResource(resource)"
              >
                <span class="text-sm flex-shrink-0">{{ getFileIcon(resource.file_type) }}</span>
                <span class="text-xs text-gray-700 truncate flex-1">{{ resource.original_filename }}</span>
                <span class="text-[10px] text-gray-400 flex-shrink-0">{{ formatFileSize(resource.file_size) }}</span>
              </div>
            </div>
          </div>
        </template>
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
          <h3 class="font-bold text-gray-800 text-lg mb-4">上传资源</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-600 mb-1">选择文件</label>
              <input
                ref="fileInputRef"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                @change="onFileSelect"
                class="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-500/10 file:text-blue-600 hover:file:bg-blue-500/20 cursor-pointer"
              />
              <p class="text-xs text-gray-400 mt-1">支持 PDF、Word、PPT、Excel（最大 {{ maxFileSizeMB }}MB，可多选）</p>
              <ul v-if="uploadForm.files.length > 0" class="mt-1.5 flex flex-wrap gap-1">
                <li
                  v-for="(f, i) in uploadForm.files"
                  :key="i"
                  class="flex items-center gap-1 text-xs text-gray-600 bg-white/60 border border-[#e2dacc] rounded px-1.5 py-0.5"
                >
                  <span class="max-w-[120px] truncate">{{ f.name }}</span>
                  <span class="text-gray-400 flex-shrink-0">{{ formatFileSize(f.size) }}</span>
                  <button @click="removeFile(i)" class="text-gray-400 hover:text-red-500 transition-colors leading-none flex-shrink-0">✕</button>
                </li>
              </ul>
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">标签（可选，逗号分隔）</label>
              <input
                v-model="uploadForm.tags"
                type="text"
                placeholder="例如：数学, 高中, 代数"
                class="w-full px-3 py-2 rounded-lg bg-white/60 border border-[#e2dacc] text-sm text-gray-700 focus:outline-none focus:border-blue-400"
              />
            </div>
            <div v-if="auth.isAdmin" class="flex items-center gap-3 p-3 rounded-lg bg-amber-50/80 border border-amber-200/50">
              <input type="checkbox" id="isPublicCheck" v-model="uploadForm.isPublic" class="w-4 h-4 rounded accent-blue-500" />
              <label for="isPublicCheck" class="text-sm text-gray-700 cursor-pointer">设为公共资源（所有用户可见）</label>
            </div>
            <p v-else class="text-xs text-gray-400 bg-white/40 rounded-lg px-3 py-2">上传的资源为私有，仅您本人可见。</p>
          </div>
          <div class="flex gap-3 mt-6">
            <button @click="closeUploadModal" class="flex-1 py-2 rounded-xl bg-white/50 text-gray-600 text-sm font-medium hover:bg-white/80 transition-all border border-[#e2dacc]">取消</button>
            <button @click="doUpload" :disabled="!uploadForm.files.length || uploading" class="flex-1 py-2 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {{ uploadProgress || '确认上传' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getApiUrl, getAuthHeaders } from '../utils/api'
import { useAuthStore } from '../stores/auth'

const emit = defineEmits<{
  'resource-selected': [filename: string]
}>()

const auth = useAuthStore()
const isMobile = ref(window.innerWidth < 768)

// 面板开关状态（桌面默认展开，移动端默认收起）
const panelOpen = ref(!isMobile.value)
// 面板宽度（可拖拽调整）
const panelWidth = ref(240)

interface Resource {
  id: string
  filename: string
  original_filename: string
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
    uploadProgress.value = total > 1 ? `上传中 (${i + 1}/${total})...` : '上传中...'
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('tags', uploadForm.value.tags)
      formData.append('is_public', String(uploadForm.value.isPublic))
      const resp = await fetch(getApiUrl('/api/resources/upload'), {
        method: 'POST', headers: getAuthHeaders(), body: formData,
      })
      const data = await resp.json()
      if (!resp.ok || !data.success) errors.push(`${file.name}：${data.detail || '未知错误'}`)
    } catch {
      errors.push(`${file.name}：网络错误`)
    }
  }
  uploading.value = false
  uploadProgress.value = ''
  if (errors.length) alert('以下文件上传失败：\n' + errors.join('\n'))
  closeUploadModal()
  await loadResources()
}

const canDelete = (resource: Resource) => !auth.isGuest && (auth.isAdmin || resource.user_id === auth.user?.id)

const deleteResource = async (resource: Resource) => {
  if (!confirm(`确定删除「${resource.original_filename}」吗？此操作不可恢复。`)) return
  try {
    const resp = await fetch(getApiUrl(`/api/resources/${resource.id}`), {
      method: 'DELETE', headers: getAuthHeaders(),
    })
    if (resp.ok) {
      if (selectedResource.value === resource.filename) {
        selectedResource.value = null
        emit('resource-selected', '')
      }
      await loadResources()
    } else {
      const data = await resp.json()
      alert('删除失败：' + (data.detail || '未知错误'))
    }
  } catch { alert('删除请求失败，请检查网络连接') }
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
  } catch { console.error('加载资源列表失败') }
  finally { loading.value = false }
}

const selectResource = (resource: Resource) => {
  selectedResource.value = resource.filename
  emit('resource-selected', resource.filename)
  if (isMobile.value) panelOpen.value = false
}

const getFileIcon = (fileType: string) => {
  const ext = (fileType || '').replace('.', '').toLowerCase()
  return ({ pdf: '📕', doc: '📘', docx: '📘', ppt: '📙', pptx: '📙', xls: '📗', xlsx: '📗' } as Record<string, string>)[ext] || '📄'
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
