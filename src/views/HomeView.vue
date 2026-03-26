<template>
  <div class="h-screen flex overflow-hidden">
    <!-- 侧边栏 - 资源选择 -->
    <ResourceSelector
      @resource-selected="onResourceSelected"
      :collapsed="sidebarCollapsed"
      @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed"
    />

    <!-- 主内容区域 -->
    <div class="flex-1 flex flex-col min-h-screen">
      <!-- 导航栏 -->
      <nav class="glass-nav sticky top-0 z-50">
        <div class="container mx-auto px-4 h-16 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <!-- 移动端侧边栏开关 -->
            <button
              @click="sidebarCollapsed = !sidebarCollapsed"
              class="md:hidden p-2 rounded-lg bg-white/50 hover:bg-white/70 transition-all"
            >
              <span class="text-xl">☰</span>
            </button>

            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg animate-float">
              <span class="text-white text-xl font-bold">✨</span>
            </div>
            <div>
              <h1 class="font-bold text-lg text-gray-800">Lumina Learning</h1>
              <p class="text-xs text-gray-500">AI 驱动的资源分析工具</p>
            </div>
          </div>

          <!-- 右侧：用户信息 + 退出 -->
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm text-blue-600 text-sm font-medium border border-white/50 shadow-sm hidden sm:inline-flex items-center">
              <span class="mr-1">🤖</span>Claude AI 驱动
            </span>

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

      <!-- 主要内容 - 独立滚动区域 -->
      <main class="flex-1 overflow-y-auto pt-8 pb-24 px-4 md:px-8">
        <div class="container mx-auto max-w-5xl">
          <!-- 游客提示 -->
          <div v-if="auth.isGuest" class="glass rounded-2xl p-8 mb-8 text-center">
            <h2 class="text-3xl font-bold text-gray-800 mb-4">欢迎使用 Lumina Learning</h2>
            <p class="text-gray-600 max-w-2xl mx-auto mb-6">
              这是一个 AI 驱动的资源分析工具。您当前处于游客模式，只能查看公共资源。
            </p>
            <p class="text-gray-500 max-w-2xl mx-auto">
              登录后可解锁完整功能：
            </p>
            <ul class="text-gray-500 max-w-2xl mx-auto mt-2 text-left list-disc pl-6">
              <li>上传自己的私有资源</li>
              <li>使用 AI 分析功能</li>
              <li>保存和管理个人分析记录</li>
            </ul>
          </div>

          <!-- 已登录用户欢迎区域 -->
          <div v-else-if="!selectedResource" class="glass rounded-2xl p-8 mb-8 text-center">
            <h2 class="text-3xl font-bold text-gray-800 mb-4">欢迎回来，{{ auth.user?.nickname || '用户' }}!</h2>
            <p class="text-gray-600 max-w-2xl mx-auto">
              从左侧选择资源，AI将自动为您生成学习计划、提取重点知识或生成模拟考题，提升学习效率。
            </p>
          </div>

          <!-- 功能选择区域 - 仅登录用户可见 -->
          <FunctionSelector
            v-if="!auth.isGuest && selectedResource"
            :selected-resource="selectedResource"
            @analysis-start="onAnalysisStart"
          />

          <!-- 结果展示区域 - 仅登录用户可见 -->
          <div v-if="!auth.isGuest && (loading || analysisResult)">
            <ResultViewer
              v-if="analysisResult && analysisResult.content && selectedAnalysisType"
              :result="analysisResult"
              :analysis-type="selectedAnalysisType!"
              @reset="onReset"
            />

            <!-- 内联加载状态 -->
            <div v-if="loading" class="glass rounded-2xl p-12 text-center">
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100/80 flex items-center justify-center animate-float">
                <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-2">AI 分析中</h3>
              <p class="text-gray-500">正在处理资源内容，很快就好...</p>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 移动端遮罩层 -->
    <div
      v-if="!sidebarCollapsed && isMobile"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
      @click="sidebarCollapsed = true"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import ResourceSelector from '../components/ResourceSelector.vue'
import FunctionSelector from '../components/FunctionSelector.vue'
import ResultViewer from '../components/ResultViewer.vue'
import { getApiUrl, getAuthHeaders } from '../utils/api'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const selectedResource = ref<string | null>(null)
const selectedAnalysisType = ref<string | null>(null)
const analysisResult = ref<any>(null)
const loading = ref(false)
const sidebarCollapsed = ref(window.innerWidth < 768)
const isMobile = ref(window.innerWidth < 768)

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
  if (window.innerWidth >= 768) {
    sidebarCollapsed.value = false
  }
}

onMounted(() => window.addEventListener('resize', handleResize))
onUnmounted(() => window.removeEventListener('resize', handleResize))

const onResourceSelected = (filename: string) => {
  if (!filename) {
    // 资源被删除时清空选择
    selectedResource.value = null
    analysisResult.value = null
    return
  }
  selectedResource.value = filename
  analysisResult.value = null
}

const onAnalysisStart = async (filename: string, analysisType: string) => {
  loading.value = true
  selectedAnalysisType.value = analysisType
  analysisResult.value = null

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
      analysisResult.value = data.result
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
  selectedResource.value = null
  analysisResult.value = null
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
