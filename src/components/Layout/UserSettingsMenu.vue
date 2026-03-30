<template>
  <div class="mt-auto relative" ref="menuRef" v-if="!auth.isGuest">
    <!-- 用户头像 -->
    <button
      @click.stop="showUserMenu = !showUserMenu"
      class="w-10 h-10 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center text-blue-600 font-medium hover:bg-blue-200 transition-all"
    >
      <img
        v-if="auth.user?.avatar"
        :src="auth.user.avatar"
        :alt="auth.user.nickname || '用户头像'"
        class="w-full h-full object-cover"
      >
      <span v-else>
        {{ (auth.user?.nickname || '?')[0] }}
      </span>
    </button>

    <!-- 用户菜单悬浮窗 -->
    <div
      v-if="showUserMenu"
      class="absolute bottom-12 left-0 bg-white rounded-lg shadow-lg border border-gray-100 w-48 py-2 z-50"
    >
      <div class="px-4 py-2 border-b border-gray-100 mb-1">
        <p class="text-sm font-medium text-gray-800 truncate">{{ auth.user?.nickname || '用户' }}</p>
        <p class="text-xs text-gray-500 truncate capitalize">{{ auth.user?.role || '' }}</p>
      </div>
      <button
        @click="handleLogout"
        class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 transition-all"
      >
        退出登录
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { removeItem, StorageKeys } from '../../utils/storage'

const auth = useAuthStore()
const router = useRouter()
const showUserMenu = ref(false)
const menuRef = ref<HTMLDivElement>()

// 点击外部关闭菜单
const handleClickOutside = (e: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    showUserMenu.value = false
  }
}

const handleLogout = () => {
  // 清除登录状态
  auth.token = null
  auth.user = null
  removeItem(StorageKeys.TOKEN)
  removeItem(StorageKeys.USER)
  // 退出登录时清除所有文件缓存，避免不同用户数据混淆
  removeItem(StorageKeys.RESOURCES_CACHE_PUBLIC)
  removeItem(StorageKeys.RESOURCES_CACHE_TIME_PUBLIC)
  removeItem(StorageKeys.RESOURCES_CACHE_PERSONAL)
  removeItem(StorageKeys.RESOURCES_CACHE_TIME_PERSONAL)
  showUserMenu.value = false
  // 跳转到登录页
  router.push('/login')
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
</style>
