<template>
  <div class="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow-sm">
    <div v-if="loading" class="text-center py-8">
      <div class="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-gray-600">正在验证邀请码...</p>
    </div>

    <div v-if="error" class="text-center py-8">
      <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">邀请码无效</h3>
      <p class="text-gray-500 mb-6">{{ error }}</p>
      <button
        @click="$router.push('/dashboard')"
        class="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all"
      >
        返回我的项目
      </button>
    </div>

    <div v-if="project" class="text-center py-8">
      <div class="w-24 h-24 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-6">
        <span class="text-4xl font-bold text-amber-600">{{ project.name.charAt(0) }}</span>
      </div>
      <h3 class="text-2xl font-bold text-gray-800 mb-2">邀请你加入「{{ project.name }}」</h3>
      <p class="text-gray-500 mb-8">{{ project.description || '暂无描述' }}</p>
      <div class="flex gap-3 justify-center">
        <button
          @click="$router.push('/dashboard')"
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
        >
          取消
        </button>
        <button
          @click="handleJoin"
          :disabled="joining"
          class="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all disabled:opacity-50"
        >
          {{ joining ? '加入中...' : '确认加入' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getApiUrl, getAuthHeaders } from '../utils/api'

const route = useRoute()
const router = useRouter()
const code = route.params.code as string

const loading = ref(true)
const joining = ref(false)
const error = ref('')
const project = ref<any>(null)

const validateInvite = async () => {
  loading.value = true
  try {
    // 先尝试加入
    const res = await fetch(getApiUrl('/projects/join'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ code })
    })

    if (res.ok) {
      project.value = await res.json()
      // 加入成功后跳转到项目页
      setTimeout(() => {
        router.push(`/projects/${project.value.id}`)
      }, 2000)
    } else {
      const err = await res.json()
      if (err.detail === '你已加入该项目') {
        // 已加入，直接跳转到项目
        // 这里可以优化为查询项目信息后跳转
        router.push('/dashboard')
      } else {
        error.value = err.detail
      }
    }
  } catch (e) {
    console.error('验证邀请码失败:', e)
    error.value = '验证失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const handleJoin = async () => {
  // 已经在validateInvite里处理了加入逻辑，这里直接跳转
  router.push(`/projects/${project.value.id}`)
}

onMounted(() => {
  validateInvite()
})
</script>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
