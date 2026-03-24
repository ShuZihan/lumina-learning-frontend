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
      <div class="p-4 border-b border-[#e2dacc] flex items-center justify-between">
        <div v-if="!collapsed" class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-blue-100/80 flex items-center justify-center">
            <span class="text-blue-500 text-lg">📚</span>
          </div>
          <h3 class="font-bold text-gray-800">课件列表</h3>
        </div>
        <button
          @click="$emit('toggle-sidebar')"
          class="p-2 rounded-lg hover:bg-white/50 transition-all ml-auto"
        >
          <span class="text-lg">
            {{ collapsed ? '→' : '←' }}
          </span>
        </button>
      </div>

      <!-- 内容区域 -->
      <div
        class="flex-1 overflow-y-auto p-4 pr-2"
        v-if="!collapsed"
      >
        <div v-if="loading" class="text-center py-8">
          <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p class="text-gray-500 text-sm">加载中...</p>
        </div>

        <div v-else-if="courses.length === 0" class="text-center py-8">
          <div class="text-3xl mb-3">📭</div>
          <p class="text-gray-500 text-sm">暂无课件</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="course in courses"
            :key="course.name"
            class="p-3 rounded-xl cursor-pointer transition-all"
            :class="[
              selectedCourse === course.name
                ? 'bg-blue-500/20 border border-blue-500/30'
                : 'hover:bg-white/40 border border-transparent'
            ]"
            @click="selectCourse(course.name)"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-blue-100/80 flex items-center justify-center flex-shrink-0">
                <span class="text-blue-500 text-xl">{{ getFileIcon(course.name) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-800 text-sm line-clamp-1">{{ course.name }}</p>
                <p class="text-xs text-gray-500">{{ formatFileSize(course.size) }}</p>
              </div>
              <div v-if="selectedCourse === course.name" class="text-blue-500 text-sm">✓</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 收起状态的图标列表 -->
      <div v-else class="flex-1 py-4 flex flex-col items-center gap-4">
        <div
          v-for="course in courses"
          :key="course.name"
          class="w-10 h-10 rounded-lg cursor-pointer transition-all flex items-center justify-center"
          :class="[
            selectedCourse === course.name
              ? 'bg-blue-500/20 border border-blue-500/30'
              : 'hover:bg-white/40 border border-transparent'
          ]"
          @click="selectCourse(course.name)"
          :title="course.name"
        >
          <span class="text-xl">{{ getFileIcon(course.name) }}</span>
        </div>
      </div>
    </div>

    <!-- 拖动调整宽度手柄 - 仅宽屏显示 -->
    <div
      v-if="!collapsed && !isMobile"
      class="absolute top-0 right-0 w-1 h-full cursor-col-resize z-10 bg-blue-500/0 hover:bg-blue-500/30 transition-colors"
      @mousedown="startDrag"
    ></div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getApiUrl } from '../utils/api'

const props = defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  'course-selected': [filename: string]
  'toggle-sidebar': []
}>()

interface Course {
  name: string
  size: number
  upload_time: number
  url: string
}

const courses = ref<Course[]>([])
const loading = ref(true)
const selectedCourse = ref<string | null>(null)
const isMobile = ref(window.innerWidth < 768)
const sidebarWidth = ref(320) // 默认宽度320px

// 拖拽相关状态
const isDragging = ref(false)
const startX = ref(0)
const startWidth = ref(0)


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
  const newWidth = Math.max(240, Math.min(600, startWidth.value + deltaX)) // 限制宽度范围240-600px
  sidebarWidth.value = newWidth
}

const stopDrag = () => {
  isDragging.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

const loadCourses = async () => {
  try {
    const response = await fetch(getApiUrl('/api/courses'))
    const data = await response.json()
    courses.value = data.courses
  } catch (error) {
    console.error('加载课件列表失败:', error)
  } finally {
    loading.value = false
  }
}

const selectCourse = (filename: string) => {
  selectedCourse.value = filename
  emit('course-selected', filename)
  if (isMobile.value) {
    emit('toggle-sidebar') // 移动端选择后自动收起侧边栏
  }
}

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase()
  const icons: Record<string, string> = {
    pdf: '📕',
    doc: '📘',
    docx: '📘',
    ppt: '📙',
    pptx: '📙',
    xls: '📗',
    xlsx: '📗'
  }
  return icons[ext || ''] || '📄'
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  loadCourses()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>