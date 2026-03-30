<template>
  <div class="p-8">
    <!-- 顶部标题栏 -->
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold text-gray-800">我的项目</h1>
      <div class="flex gap-3">
        <button
          @click="showJoinModal = true"
          class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
        >
          加入项目
        </button>
        <button
          @click="showCreateModal = true"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
        >
          创建项目
        </button>
      </div>
    </div>

    <!-- 项目列表 -->
    <div v-if="projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-9">
      <div
        v-for="project in projects"
        :key="project.id"
        @click="goToProject(project.id)"
        class="bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer border border-gray-100 overflow-hidden"
      >
        <!-- 封面区域：撑满卡片宽度 -->
        <div class="w-full h-40 bg-gradient-to-br from-blue-100 to-blue-100 flex items-center justify-center">
          <span class="text-2xl font-bold text-blue-700">{{ project.name.charAt(0) }}</span>
        </div>
        <!-- 文字内容区域：加内边距 -->
        <div class="p-3">
          <h3 class="text-lg font-semibold text-gray-800 mb-1 truncate">{{ project.name }}</h3>
          <p class="text-sm text-gray-500 mb-3 line-clamp-2">{{ project.description || '暂无描述' }}</p>
          <div class="flex items-center text-xs text-gray-400">
            <span>创建于 {{ new Date(project.created_at).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-20">
      <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      </div>
      <h3 class="text-xl font-medium text-gray-600 mb-2">还没有加入任何项目</h3>
      <p class="text-gray-500 mb-6">创建一个新项目，或者输入邀请码加入现有项目</p>
      <div class="flex gap-3 justify-center">
        <button
          @click="showJoinModal = true"
          class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
        >
          加入项目
        </button>
        <button
          @click="showCreateModal = true"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
        >
          创建项目
        </button>
      </div>
    </div>

    <!-- 创建项目模态框 -->
    <CreateProjectModal
      v-model:visible="showCreateModal"
      @success="loadProjects"
    />

    <!-- 加入项目模态框 -->
    <JoinProjectModal
      v-model:visible="showJoinModal"
      @success="loadProjects"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CreateProjectModal from '../components/Project/CreateProjectModal.vue'
import JoinProjectModal from '../components/Project/JoinProjectModal.vue'
import { getApiUrl, getAuthHeaders } from '../utils/api'

const router = useRouter()
const projects = ref<any[]>([])
const showCreateModal = ref(false)
const showJoinModal = ref(false)

const loadProjects = async () => {
  try {
    const res = await fetch(getApiUrl('/projects'), {
      headers: getAuthHeaders()
    })
    if (res.ok) {
      projects.value = await res.json()
    }
  } catch (e) {
    console.error('加载项目列表失败:', e)
  }
}

const goToProject = (projectId: string) => {
  router.push(`/projects/${projectId}`)
}

onMounted(() => {
  loadProjects()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
