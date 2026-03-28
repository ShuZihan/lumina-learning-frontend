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

        <!-- 右侧：用户区 + 语言切换 -->
        <div class="flex items-center gap-2">
          <!-- 游客状态：登录/注册按钮 -->
          <router-link
            v-if="auth.isGuest"
            to="/login"
            class="px-3 py-1.5 rounded-lg bg-white/50 hover:bg-white/80 text-gray-600 text-sm border border-white/50 transition-all"
          >
            {{ t('nav.loginOrRegister') }}
          </router-link>

          <!-- 登录用户状态：hover 下拉退出 -->
          <div v-else class="relative group">
            <!-- 触发区域 -->
            <div class="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/60 cursor-pointer transition-all select-none">
              <img
                v-if="auth.user?.avatar"
                :src="auth.user.avatar"
                class="w-7 h-7 rounded-full border-2 border-white/60 shadow-sm"
                :alt="auth.user.nickname || t('nav.user')"
                referrerpolicy="no-referrer"
              />
              <span v-else class="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-medium shadow-sm">
                {{ (auth.user?.nickname || '?')[0] }}
              </span>
              <span class="text-sm text-gray-700 font-medium hidden sm:block">{{ auth.user?.nickname || t('nav.user') }}</span>
              <span v-if="auth.isAdmin" class="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">{{ t('nav.admin') }}</span>
              <!-- 下拉箭头 -->
              <svg class="w-3 h-3 text-gray-400 transition-transform duration-150 group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>

            <!-- 下拉菜单 -->
            <div class="absolute right-0 top-[calc(100%+4px)] w-36 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 z-[80]">
              <div class="glass rounded-xl shadow-lg py-1 border border-white/40">
                <button
                  @click="handleLogout"
                  class="w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-red-500 hover:bg-white/60 transition-colors rounded-lg"
                >
                  {{ t('nav.logout') }}
                </button>
              </div>
            </div>
          </div>

          <!-- 语言切换：固定最右侧 -->
          <button
            @click="toggleLocale"
            class="w-8 h-8 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-white/60 transition-all border border-transparent hover:border-white/50 flex items-center justify-center"
          >
            {{ locale === 'zh-CN' ? 'EN' : '中' }}
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

      <!-- ChatPanel 直接占据全屏 -->
      <div class="flex-1 min-w-0 overflow-x-hidden">
        <ChatPanel
          v-if="selectedResource"
          class="h-full"
          :selected-resource="selectedResource"
          :resource-name="selectedResourceName"
          :analysis-type="selectedAnalysisType ?? ''"
          :initial-message="initialMessage"
          :loading="loading"
          @reset="onReset"
          @analysis-start="onAnalysisStart"
        />

        <!-- 未选择资源时的提示 -->
        <div v-else class="h-full flex items-center justify-center bg-gray-50">
          <div class="glass rounded-2xl p-8 text-center">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">
              {{ auth.isGuest ? t('home.welcomeGuest') : t('home.welcomeBack', { name: auth.user?.nickname || t('nav.user') }) }}
            </h2>
            <p class="text-gray-600 max-w-2xl mx-auto">
              {{ t('home.description') }}
            </p>
            <p v-if="auth.isGuest" class="text-gray-400 text-sm mt-3">
              <router-link to="/login" class="text-blue-500 hover:underline">{{ t('home.loginLink') }}</router-link>{{ t('home.loginPrompt') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import ResourceSelector from '../components/ResourceSelector.vue'
import ChatPanel from '../components/ChatPanel.vue'
import { getApiUrl, getAuthHeaders } from '../utils/api'
import { useAuthStore } from '../stores/auth'
import { setLocale } from '../i18n'

const { t, locale } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const sidebarRef = ref<{ toggle: () => void } | null>(null)
const selectedResource = ref<string | null>(null)
const selectedResourceName = ref('')
const selectedAnalysisType = ref<string | null>(null)
const initialMessage = ref('')
const loading = ref(false)

const toggleLocale = () => setLocale(locale.value === 'zh-CN' ? 'en-US' : 'zh-CN')

const onResourceSelected = (filename: string, originalFilename: string) => {
  selectedResource.value = filename || null
  selectedResourceName.value = originalFilename
  initialMessage.value = ''
  selectedAnalysisType.value = null
}

const onAnalysisStart = async (filename: string, analysisType: string) => {
  loading.value = true
  selectedAnalysisType.value = analysisType
  initialMessage.value = ''

  try {
    const response = await fetch(getApiUrl('/api/analyze'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ filename, analysis_type: analysisType }),
    })

    if (response.status === 401) {
      auth.logout()
      router.push('/login')
      return
    }

    if (!response.ok) {
      const data = await response.json()
      alert(t('error.analysisFailed') + ': ' + (data.detail || t('resource.unknownError')))
      return
    }

    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('text/event-stream') && response.body) {
      loading.value = false
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const doneIdx = chunk.indexOf('[DONE]')
        if (doneIdx !== -1) {
          if (doneIdx > 0) initialMessage.value += chunk.substring(0, doneIdx)
          break
        }
        if (chunk.includes('[ERROR]')) {
          alert(t('error.analysisFailed') + ': ' + chunk.replace(/.*\[ERROR\]\s*/, ''))
          break
        }
        initialMessage.value += chunk
      }
    } else {
      const data = await response.json()
      if (data.success) {
        initialMessage.value = data.result.content
      } else {
        alert(t('error.analysisFailed') + ': ' + (data.detail || t('resource.unknownError')))
      }
    }
  } catch (error) {
    alert(t('error.requestFailed'))
    console.error(error)
  } finally {
    loading.value = false
  }
}

const onReset = () => {
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
