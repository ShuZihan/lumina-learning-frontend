<template>
  <div class="h-screen flex flex-col overflow-hidden bg-gray-50">
    <!-- 顶部导航栏 -->
    <nav class="glass-nav shrink-0 z-[70]">
      <div class="px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-3">
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
            登录/注册
          </router-link>

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

    <!-- 下方：侧边栏 + 主内容区 -->
    <div class="flex-1 flex overflow-hidden">
      <!-- 左侧边栏 -->
      <aside class="w-16 border-r border-gray-200 bg-white/80 backdrop-blur-md flex flex-col items-center py-4 gap-6">
        <!-- 导航Tab -->
        <nav class="flex flex-col gap-4">
          <RouterLink
            to="/"
            class="w-10 h-10 rounded-lg flex items-center justify-center text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-all"
            :class="{ 'bg-blue-100 text-blue-600': $route.path === '/' }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </RouterLink>

          <RouterLink
            to="/dashboard"
            class="w-10 h-10 rounded-lg flex items-center justify-center text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-all"
            :class="{ 'bg-blue-100 text-blue-600': $route.path.startsWith('/dashboard') || $route.path.startsWith('/projects') }"
          >
            <!-- 项目线性图标 -->
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </RouterLink>
        </nav>

        <UserSettingsMenu />
      </aside>

      <!-- 主内容区 -->
      <main class="flex-1 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { setLocale } from '../../i18n'
import UserSettingsMenu from './UserSettingsMenu.vue'

const { t, locale } = useI18n()
const auth = useAuthStore()

const toggleLocale = () => setLocale(locale.value === 'zh-CN' ? 'en-US' : 'zh-CN')
</script>

<style scoped>
</style>
