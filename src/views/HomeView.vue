<template>
  <div class="h-screen flex flex-col overflow-hidden">
    <!-- 导航栏 - 全宽 -->
    <nav class="glass-nav shrink-0 z-[70]">
      <div class="px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- 手机端侧边栏开关 -->
          <button
            class="md:hidden p-2 rounded-lg hover:bg-white/60 text-gray-600 transition-colors"
            @click="sidebarRef?.toggle()"
          >
            <span class="text-base leading-none">☰</span>
          </button>
          <div class="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center shadow-lg">
            <svg class="w-5 h-5 md:w-6 md:h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>
            </svg>
          </div>
          <h1 class="font-bold text-base md:text-lg text-gray-800">Lumina Learning</h1>
        </div>

        <!-- 右侧：用户信息 + 退出 -->
        <div class="flex items-center gap-3">
          <!-- 游客状态 -->
          <div v-if="auth.isGuest" class="flex items-center gap-2">
            <span class="text-sm text-gray-700 font-medium">游客</span>
          </div>
          <!-- 登录用户状态 -->
          <div v-else class="flex items-center gap-2">
            <img
              v-if="auth.user?.avatar"
              :src="auth.user.avatar"
              class="w-8 h-8 rounded-full border-2 border-white/60 shadow-sm"
              :alt="auth.user.nickname || '用户'"
              referrerpolicy="no-referrer"
            />
            <span v-else class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-medium shadow-sm">
              {{ (auth.user?.nickname || '?')[0] }}
            </span>
            <span class="text-sm text-gray-700 font-medium hidden sm:block">{{ auth.user?.nickname || '用户' }}</span>
            <span v-if="auth.isAdmin" class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">管理员</span>
          </div>
          <button
            @click="handleLogout"
            class="px-3 py-1.5 rounded-lg bg-white/50 hover:bg-white/80 text-gray-600 text-sm border border-white/50 transition-all"
          >
            {{ auth.isGuest ? '登录' : '退出' }}
          </button>
        </div>
      </div>
    </nav>

    <!-- 侧边栏 + 主内容 -->
    <div class="flex-1 flex overflow-hidden">
      <ResourceSelector
        ref="sidebarRef"
        @resource-selected="onResourceSelected"
      />

      <main
        class="flex-1 px-4 md:px-8"
        :class="chatActive ? 'overflow-hidden flex flex-col pt-4 pb-2' : 'overflow-y-auto pt-8 pb-24'"
      >
        <div
          class="container mx-auto max-w-5xl"
          :class="chatActive ? 'flex-1 flex flex-col min-h-0' : ''"
        >
          <!-- 欢迎区域（未选择资源时） -->
          <div v-if="!selectedResource && !chatActive" class="glass rounded-2xl p-8 mb-8 text-center">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">
              {{ auth.isGuest ? '欢迎使用 Lumina Learning' : `欢迎回来，${auth.user?.nickname || '用户'}!` }}
            </h2>
            <p class="text-gray-600 max-w-2xl mx-auto">
              从左侧选择资源，AI 将自动为您生成学习计划、提取重点知识或生成模拟考题，提升学习效率。
            </p>
            <p v-if="auth.isGuest" class="text-gray-400 text-sm mt-3">
              <router-link to="/login" class="text-blue-500 hover:underline">登录</router-link>后可上传自己的私有资源。
            </p>
          </div>

          <!-- 对话面板 -->
          <ChatPanel
            v-if="chatActive && selectedResource"
            class="flex-1 min-h-0"
            :selected-resource="selectedResource"
            :resource-name="selectedResourceName"
            :analysis-type="selectedAnalysisType ?? ''"
            :initial-message="initialMessage"
            :loading="loading"
            @reset="onReset"
            @analysis-start="onAnalysisStart"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ResourceSelector from '../components/ResourceSelector.vue'
import ChatPanel from '../components/ChatPanel.vue'
import { getApiUrl, getAuthHeaders } from '../utils/api'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const sidebarRef = ref<{ toggle: () => void } | null>(null)
const selectedResource = ref<string | null>(null)
const selectedResourceName = ref('')
const selectedAnalysisType = ref<string | null>(null)
const chatActive = ref(false)
const initialMessage = ref('')
const loading = ref(false)

const onResourceSelected = (filename: string, originalFilename: string) => {
  selectedResource.value = filename || null
  selectedResourceName.value = originalFilename
  chatActive.value = !!filename
  initialMessage.value = ''
  selectedAnalysisType.value = null
}

const onAnalysisStart = async (filename: string, analysisType: string) => {
  loading.value = true
  selectedAnalysisType.value = analysisType

  try {
    const response = await fetch(getApiUrl('/api/analyze'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ filename, analysis_type: analysisType }),
    })

    if (response.status === 401) {
      auth.logout()
      router.push('/login')
      return
    }

    const data = await response.json()
    if (data.success) {
      initialMessage.value = data.result.content
      chatActive.value = true
    } else {
      alert('分析失败: ' + (data.detail || '未知错误'))
    }
  } catch (error) {
    alert('请求失败，请检查后端服务是否运行')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const onReset = () => {
  chatActive.value = false
  initialMessage.value = ''
  selectedAnalysisType.value = null
}

const handleLogout = () => {
  if (auth.isGuest) {
    router.push('/login')
  } else {
    auth.logout()
    router.push('/login')
  }
}
</script>
