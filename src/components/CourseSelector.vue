<template>
  <div class="mb-8">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-12 h-12 rounded-xl bg-blue-100/80 flex items-center justify-center">
        <span class="text-blue-500 text-xl">📚</span>
      </div>
      <div>
        <h3 class="text-2xl font-bold text-gray-800">选择课件</h3>
        <p class="text-gray-500 text-sm">从公开课件库中选择要分析的文件</p>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-gray-500">加载课件列表中...</p>
    </div>

    <div v-else-if="courses.length === 0" class="glass rounded-2xl p-12 text-center">
      <div class="text-4xl mb-4">📭</div>
      <h4 class="text-xl font-bold text-gray-800 mb-2">暂无课件</h4>
      <p class="text-gray-500">请先将课件文件上传到后端的 uploads 目录</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="course in courses"
        :key="course.name"
        class="glass-card rounded-2xl p-6 cursor-pointer"
        :class="{ 'ring-2 ring-blue-500 bg-white/60': selectedCourse === course.name }"
        @click="selectCourse(course.name)"
      >
        <div class="w-14 h-14 rounded-xl bg-blue-100/80 flex items-center justify-center mb-4">
          <span class="text-blue-500 text-2xl">{{ getFileIcon(course.name) }}</span>
        </div>
        <h4 class="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{{ course.name }}</h4>
        <p class="text-gray-500 text-sm mb-4">
          文件大小: {{ formatFileSize(course.size) }}
        </p>
        <div class="flex items-center text-blue-500 font-medium text-sm">
          <span>{{ selectedCourse === course.name ? '已选择' : '选择此课件' }}</span>
          <span class="ml-2">→</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const emit = defineEmits<{
  'course-selected': [filename: string]
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

const loadCourses = async () => {
  try {
    const response = await fetch('/api/courses')
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

onMounted(() => {
  loadCourses()
})
</script>
