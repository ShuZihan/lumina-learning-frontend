<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="glass rounded-3xl p-10 w-full max-w-md text-center shadow-xl">
      <!-- Logo -->
      <div class="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center shadow-lg">
        <svg class="w-9 h-9 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>
        </svg>
      </div>

      <h1 class="text-xl font-semibold text-gray-800 mb-1.5 tracking-tight">欢迎使用 Lumina Learning</h1>
      <p class="text-gray-400 mb-8 text-sm">登录后可发起 AI 分析，解锁全部功能</p>

      <!-- Google 登录 -->
      <a
        :href="apiBase + '/api/auth/google'"
        class="flex items-center justify-center gap-2.5 w-full px-5 py-2.5 mb-3 rounded-xl bg-white/80 hover:bg-white border border-[#d1d7dc] hover:border-gray-300 shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-700"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        使用 Google 登录
      </a>

      <!-- 微信登录 -->
      <a
        :href="apiBase + '/api/auth/wechat'"
        class="flex items-center justify-center gap-2.5 w-full px-5 py-2.5 mb-3 rounded-xl bg-white/80 hover:bg-white border border-[#d1d7dc] hover:border-gray-300 shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-700"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="#07C160">
          <path d="M8.69 11.52c-.6 0-1.08-.47-1.08-1.06 0-.58.48-1.06 1.08-1.06.6 0 1.08.48 1.08 1.06 0 .59-.48 1.06-1.08 1.06zm5.62 0c-.6 0-1.08-.47-1.08-1.06 0-.58.48-1.06 1.08-1.06.6 0 1.08.48 1.08 1.06 0 .59-.48 1.06-1.08 1.06zM12 2C6.48 2 2 6.04 2 11c0 3.04 1.55 5.73 3.95 7.44L5 21l2.87-1.56C9.17 19.8 10.55 20 12 20c5.52 0 10-4.04 10-9s-4.48-9-10-9z"/>
        </svg>
        使用微信登录
      </a>

      <!-- 分隔线 -->
      <div class="flex items-center my-5">
        <div class="flex-1 h-px bg-[#e2dacc]"></div>
        <span class="px-4 text-xs text-gray-400">暂不登录</span>
        <div class="flex-1 h-px bg-[#e2dacc]"></div>
      </div>

      <!-- 游客访问 -->
      <button
        @click="visitAsGuest"
        class="text-gray-400 hover:text-gray-600 text-sm transition-colors"
      >
        游客模式浏览
      </button>

      <p class="mt-6 text-xs text-gray-400">
        登录即代表同意服务条款与隐私政策
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// 用于构建完整 OAuth 跳转链接（OAuth 需要浏览器直接跳转，不走 fetch）
const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const visitAsGuest = () => {
  router.push('/')
}
</script>
