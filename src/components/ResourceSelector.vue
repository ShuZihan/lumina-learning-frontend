<template>
  <aside
    class="fixed md:relative h-screen z-50 ease-in-out"
    :class="[
      collapsed ? 'w-0 md:w-16' : 'w-72',
      !isDragging ? 'transition-all duration-300' : ''
    ]"
    :style="!collapsed && !isMobile ? { width: `${sidebarWidth}px` } : {}"
  >
    <!-- 侧边栏内容 -->
    <div class="h-full bg-[#f3ede0] flex flex-col overflow-hidden relative" style="background-image: inherit; background-size: inherit;">
      <!-- 纸张折痕分界线 -->
      <div class="absolute top-0 right-0 w-[3px] h-full z-10">
        <div class="absolute left-0 top-0 h-full w-[1px] bg-[#d9d1bf]"></div>
        <div class="absolute left-[1px] top-0 h-full w-[2px] bg-[rgba(255,255,255,0.6)]"></div>
      </div>

      <!-- 头部 -->
      <div class="p-4 border-b border-[#e2dacc] flex items-center justify-between flex-shrink-0">
        <div v-if="!collapsed" class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-blue-100/80 flex items-center justify-center">
            <span class="text-blue-500 text-lg">📚</span>
          </div>
          <h3 class="font-bold text-gray-800">资源列表</h3>
        </div>
        <button
          @click="$emit('toggle-sidebar')"
          class="p-2 rounded-lg hover:bg-white/50 transition-all ml-auto"
        >
          <span class="text-lg">{{ collapsed ? '→' : '←' }}</span>
        </button>
      </div>

      <!-- 展开状态 -->
      <template v-if="!collapsed">
        <!-- 分类 Tab -->
        <div class="px-3 pt-3 flex gap-1 border-b border-[#e2dacc] flex-shrink-0">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="px-3 py-1.5 rounded-t-lg text-xs font-medium transition-all"
            :class="activeTab === tab.key
              ? 'bg-white/70 text-blue-600 border border-[#e2dacc] border-b-transparent -mb-px'
              : 'text-gray-500 hover:text-gray-700'"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- 标签筛选器 -->
        <div v-if="allTags.length > 0" class="px-3 py-2 flex flex-wrap gap-1 border-b border-[#e2dacc] flex-shrink-0">
          <button
            v-for="tag in allTags"
            :key="tag"
            @click="toggleTag(tag)"
            class="px-2 py-0.5 rounded-full text-xs transition-all"
            :class="selectedTags.includes(tag)
              ? 'bg-blue-500 text-white'
              : 'bg-white/50 text-gray-600 hover:bg-white/80 border border-[#e2dacc]'"
          >
            {{ tag }}
          </button>
        </div>

        <!-- 资源列表 -->
        <div class="flex-1 overflow-y-auto p-3 pr-2">
          <div v-if="loading" class="text-center py-8">
            <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p class="text-gray-500 text-sm">加载中...</p>
          </div>

          <div v-else-if="filteredResources.length === 0" class="text-center py-8">
            <div class="text-3xl mb-3">📭</div>
            <p class="text-gray-500 text-sm">暂无资源</p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="resource in filteredResources"
              :key="resource.id"
              class="p-3 rounded-xl cursor-pointer transition-all group relative"
              :class="[
                selectedResource === resource.filename
                  ? 'bg-blue-500/20 border border-blue-500/30'
                  : 'hover:bg-white/40 border border-transparent'
              ]"
              @click="selectResource(resource)"
            >
              <div class="flex items-center gap-2">
                <div class="w-9 h-9 rounded-lg bg-blue-100/80 flex items-center justify-center flex-shrink-0">
                  <span class="text-blue-500 text-lg">{{ getFileIcon(resource.file_type) }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-800 text-sm line-clamp-1">{{ resource.original_filename }}</p>
                  <div class="flex items-center gap-1 mt-0.5 flex-wrap">
                    <span class="text-xs text-gray-500">{{ formatFileSize(resource.file_size) }}</span>
                    <span v-if="!resource.is_public" class="text-xs px-1.5 rounded bg-amber-100 text-amber-600">私有</span>
                    <span
                      v-for="tag in (resource.tags || []).slice(0, 2)"
                      :key="tag"
                      class="text-xs px-1.5 rounded bg-blue-100/80 text-blue-600"
                    >{{ tag }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-1 flex-shrink-0">
                  <span v-if="selectedResource === resource.filename" class="text-blue-500 text-sm">✓</span>
                  <!-- 删除按钮：仅所有者或管理员可见 -->
                  <button
                    v-if="canDelete(resource)"
                    @click.stop="deleteResource(resource)"
                    class="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all text-sm"
                    title="删除"
                  >🗑</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 上传按钮（仅登录用户） -->
        <div v-if="!auth.isGuest" class="p-3 border-t border-[#e2dacc] flex-shrink-0">
          <button
            @click="showUploadModal = true"
            class="w-full py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 text-sm font-medium transition-all border border-blue-500/20 hover:border-blue-500/30"
          >
            ＋ 上传资源
          </button>
        </div>
      </template>

      <!-- 收起状态：图标列表，hover 显示全名 -->
      <div v-else class="flex-1 py-4 flex flex-col items-center gap-3 overflow-y-auto">
        <div
          v-for="resource in resources"
          :key="resource.id"
          class="w-10 h-10 rounded-lg cursor-pointer transition-all flex items-center justify-center relative group"
          :class="[
            selectedResource === resource.filename
              ? 'bg-blue-500/20 border border-blue-500/30'
              : 'hover:bg-white/40 border border-transparent'
          ]"
          @click="selectResource(resource)"
          :title="resource.original_filename"
        >
          <span class="text-xl">{{ getFileIcon(resource.file_type) }}</span>
          <!-- Hover tooltip：显示全名 -->
          <div class="absolute left-full ml-2 px-2 py-1 bg-gray-800/90 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 max-w-48 line-clamp-2">
            {{ resource.original_filename }}
          </div>
        </div>
      </div>
    </div>

    <!-- 拖动调整宽度手柄 -->
    <div
      v-if="!collapsed && !isMobile"
      class="absolute top-0 right-0 w-1 h-full cursor-col-resize z-10 bg-blue-500/0 hover:bg-blue-500/30 transition-colors"
      @mousedown="startDrag"
    ></div>

    <!-- 上传 Modal -->
    <Teleport to="body">
      <div v-if="showUploadModal" class="fixed inset-0 z-[200] flex items-center justify-center">
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="closeUploadModal"></div>
        <div class="relative glass rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
          <h3 class="font-bold text-gray-800 text-lg mb-4">上传资源</h3>

          <div class="space-y-4">
            <!-- 文件选择 -->
            <div>
              <label class="block text-sm text-gray-600 mb-1">选择文件</label>
              <input
                ref="fileInputRef"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                @change="onFileSelect"
                class="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-500/10 file:text-blue-600 hover:file:bg-blue-500/20 cursor-pointer"
              />
              <p class="text-xs text-gray-400 mt-1">支持 PDF、Word、PPT、Excel（最大 {{ maxFileSizeMB }}MB）</p>
            </div>

            <!-- 标签 -->
            <div>
              <label class="block text-sm text-gray-600 mb-1">标签（可选，逗号分隔）</label>
              <input
                v-model="uploadForm.tags"
                type="text"
                placeholder="例如：数学, 高中, 代数"
                class="w-full px-3 py-2 rounded-lg bg-white/60 border border-[#e2dacc] text-sm text-gray-700 focus:outline-none focus:border-blue-400"
              />
            </div>

            <!-- 管理员专属：公开/私有开关 -->
            <div v-if="auth.isAdmin" class="flex items-center gap-3 p-3 rounded-lg bg-amber-50/80 border border-amber-200/50">
              <input
                type="checkbox"
                id="isPublicCheck"
                v-model="uploadForm.isPublic"
                class="w-4 h-4 rounded accent-blue-500"
              />
              <label for="isPublicCheck" class="text-sm text-gray-700 cursor-pointer">
                设为公共资源（所有用户可见）
              </label>
            </div>
            <p v-else class="text-xs text-gray-400 bg-white/40 rounded-lg px-3 py-2">
              上传的资源为私有，仅您本人可见。
            </p>
          </div>

          <div class="flex gap-3 mt-6">
            <button
              @click="closeUploadModal"
              class="flex-1 py-2 rounded-xl bg-white/50 text-gray-600 text-sm font-medium hover:bg-white/80 transition-all border border-[#e2dacc]"
            >
              取消
            </button>
            <button
              @click="doUpload"
              :disabled="!uploadForm.file || uploading"
              class="flex-1 py-2 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ uploading ? '上传中...' : '确认上传' }}
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

const props = defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  'resource-selected': [filename: string]
  'toggle-sidebar': []
}>()

const auth = useAuthStore()

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
const isMobile = ref(window.innerWidth < 768)
const sidebarWidth = ref(320)
const isDragging = ref(false)
const startX = ref(0)
const startWidth = ref(0)
const maxFileSizeMB = Number(import.meta.env.VITE_MAX_FILE_SIZE_MB || 50)

// 分类 Tab
type TabKey = 'all' | 'public' | 'mine'
const activeTab = ref<TabKey>('all')
const tabs = computed<{ key: TabKey; label: string }[]>(() => {
  const list: { key: TabKey; label: string }[] = [{ key: 'all', label: '全部' }]
  if (!auth.isGuest) list.push({ key: 'mine', label: '我的资源' })
  list.push({ key: 'public', label: '公共资源' })
  return list
})

// 标签筛选
const selectedTags = ref<string[]>([])
const allTags = computed(() => {
  const tagSet = new Set<string>()
  resources.value.forEach(c => (c.tags || []).forEach(t => tagSet.add(t)))
  return Array.from(tagSet)
})
const toggleTag = (tag: string) => {
  const i = selectedTags.value.indexOf(tag)
  if (i >= 0) selectedTags.value.splice(i, 1)
  else selectedTags.value.push(tag)
}

// 过滤后资源列表
const filteredResources = computed(() => {
  let list = resources.value
  if (activeTab.value === 'public') {
    list = list.filter(c => c.is_public)
  } else if (activeTab.value === 'mine') {
    list = list.filter(c => c.user_id === auth.user?.id)
  }
  if (selectedTags.value.length > 0) {
    list = list.filter(c => selectedTags.value.every(t => (c.tags || []).includes(t)))
  }
  return list
})

// 上传 Modal
const showUploadModal = ref(false)
const uploading = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadForm = ref({
  file: null as File | null,
  tags: '',
  isPublic: false,
})

const onFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  uploadForm.value.file = input.files?.[0] || null
}

const closeUploadModal = () => {
  showUploadModal.value = false
  uploadForm.value = { file: null, tags: '', isPublic: false }
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const doUpload = async () => {
  if (!uploadForm.value.file || uploading.value) return
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', uploadForm.value.file)
    formData.append('tags', uploadForm.value.tags)
    formData.append('is_public', String(uploadForm.value.isPublic))

    const resp = await fetch(getApiUrl('/api/resources/upload'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    })
    const data = await resp.json()
    if (resp.ok && data.success) {
      closeUploadModal()
      await loadResources()
    } else {
      alert('上传失败：' + (data.detail || '未知错误'))
    }
  } catch {
    alert('上传请求失败，请检查网络连接')
  } finally {
    uploading.value = false
  }
}

// 权限判断：是否可以删除
const canDelete = (resource: Resource) => {
  if (auth.isGuest) return false
  return auth.isAdmin || resource.user_id === auth.user?.id
}

const deleteResource = async (resource: Resource) => {
  if (!confirm(`确定删除「${resource.original_filename}」吗？此操作不可恢复。`)) return
  try {
    const resp = await fetch(getApiUrl(`/api/resources/${resource.id}`), {
      method: 'DELETE',
      headers: getAuthHeaders(),
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
  } catch {
    alert('删除请求失败，请检查网络连接')
  }
}

// 拖动调整宽度
const startDrag = (e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  isDragging.value = true
  startX.value = e.clientX
  startWidth.value = sidebarWidth.value
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return
  e.preventDefault()
  e.stopPropagation()
  const deltaX = e.clientX - startX.value
  sidebarWidth.value = Math.max(240, Math.min(600, startWidth.value + deltaX))
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
    const resp = await fetch(getApiUrl('/api/resources'), {
      headers: getAuthHeaders(),
    })
    const data = await resp.json()
    resources.value = data.resources || []
  } catch {
    console.error('加载资源列表失败')
  } finally {
    loading.value = false
  }
}

const selectResource = (resource: Resource) => {
  selectedResource.value = resource.filename
  emit('resource-selected', resource.filename)
  if (isMobile.value) emit('toggle-sidebar')
}

const getFileIcon = (fileType: string) => {
  const ext = (fileType || '').replace('.', '').toLowerCase()
  const icons: Record<string, string> = {
    pdf: '📕', doc: '📘', docx: '📘',
    ppt: '📙', pptx: '📙', xls: '📗', xlsx: '📗',
  }
  return icons[ext] || '📄'
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return '—'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  loadResources()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>
