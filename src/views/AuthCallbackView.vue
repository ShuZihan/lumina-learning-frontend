<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="glass rounded-2xl p-10 text-center">
      <div class="w-12 h-12 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-gray-600">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const message = ref('正在登录，请稍候...')

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')
  if (token) {
    auth.setToken(token)
    await auth.fetchUser()
    router.replace('/')
  } else {
    message.value = '登录失败，请重试'
    setTimeout(() => router.replace('/login'), 2000)
  }
})
</script>
