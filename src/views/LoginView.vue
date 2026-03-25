<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="glass rounded-3xl p-10 w-full max-w-md text-center shadow-xl">
      <!-- Logo -->
      <div class="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg animate-float">
        <span class="text-white text-3xl font-bold">✨</span>
      </div>

      <h1 class="text-2xl font-bold text-gray-800 mb-2">欢迎使用 Lumina Learning</h1>
      <p class="text-gray-500 mb-8 text-sm">登录后可发起 AI 分析，解锁全部功能</p>

      <!-- Google 登录 -->
      <a
        :href="apiBase + '/api/auth/google'"
        class="flex items-center justify-center gap-3 w-full px-5 py-3 mb-4 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 shadow-sm transition-all font-medium text-gray-700 hover:shadow-md"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24">
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
        class="flex items-center justify-center gap-3 w-full px-5 py-3 mb-4 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 shadow-sm transition-all font-medium text-gray-700 hover:shadow-md"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="#07C160">
          <path d="M8.69 11.52c-.6 0-1.08-.47-1.08-1.06 0-.58.48-1.06 1.08-1.06.6 0 1.08.48 1.08 1.06 0 .59-.48 1.06-1.08 1.06zm5.62 0c-.6 0-1.08-.47-1.08-1.06 0-.58.48-1.06 1.08-1.06.6 0 1.08.48 1.08 1.06 0 .59-.48 1.06-1.08 1.06zM12 2C6.48 2 2 6.04 2 11c0 3.04 1.55 5.73 3.95 7.44L5 21l2.87-1.56C9.17 19.8 10.55 20 12 20c5.52 0 10-4.04 10-9s-4.48-9-10-9z"/>
        </svg>
        使用微信登录
      </a>

      <!-- 分隔线 -->
      <div class="flex items-center my-6">
        <div class="flex-1 h-px bg-gray-200"></div>
        <span class="px-4 text-sm text-gray-400">暂不登录</span>
        <div class="flex-1 h-px bg-gray-200"></div>
      </div>

      <!-- 游客访问 -->
      <button
        @click="visitAsGuest"
        class="text-gray-500 hover:text-gray-700 text-sm underline underline-offset-2 transition-colors"
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
