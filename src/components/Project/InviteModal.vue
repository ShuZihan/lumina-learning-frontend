<template>
  <div v-if="visible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl w-full max-w-md p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-semibold text-gray-800">邀请成员</h3>
        <button @click="close" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-if="!invitation" class="mb-6">
        <p class="text-gray-600 mb-4">生成邀请链接，其他用户可以通过链接或邀请码加入项目</p>
        <div class="flex gap-3">
          <select v-model="expiresDays" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
            <option :value="1">1天有效</option>
            <option :value="7" selected>7天有效</option>
            <option :value="30">30天有效</option>
            <option :value="null">永久有效</option>
          </select>
          <button
            @click="generateInvite"
            :disabled="loading"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50"
          >
            {{ loading ? '生成中...' : '生成' }}
          </button>
        </div>
      </div>

      <div v-if="invitation" class="mb-6">
        <p class="text-green-600 mb-2 font-medium">✅ 邀请链接生成成功！</p>
        <div class="bg-gray-50 rounded-lg p-3 mb-3">
          <p class="text-sm text-gray-700 mb-2">邀请链接：</p>
          <div class="flex items-center gap-2">
            <input type="text" :value="inviteUrl" class="flex-1 px-2 py-1 border border-gray-300 rounded text-sm bg-white" readonly />
            <button @click="copyLink" class="px-2 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300">
              复制
            </button>
          </div>
        </div>
        <div class="bg-gray-50 rounded-lg p-3">
          <p class="text-sm text-gray-700 mb-2">邀请码：</p>
          <div class="text-2xl font-mono tracking-widest text-center text-blue-600 font-bold">
            {{ invitation.code }}
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-3">
          {{ invitation.expires_at ? `有效期至 ${new Date(invitation.expires_at).toLocaleString()}` : '永久有效' }}
          · 已使用 {{ invitation.used_count }} 次
        </p>
      </div>

      <div class="flex justify-end">
        <button
          @click="close"
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
        >
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { getApiUrl, getAuthHeaders } from '../../utils/api'

const props = defineProps<{
  visible: boolean
  courseId: string
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const expiresDays = ref<number | null>(7)
const loading = ref(false)
const invitation = ref<any>(null)
const inviteUrl = ref('')

const close = () => {
  invitation.value = null
  loading.value = false
  emit('update:visible', false)
}

const generateInvite = async () => {
  loading.value = true
  try {
    const res = await fetch(getApiUrl(`/projects/${props.courseId}/invitations`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({
        expires_days: expiresDays.value,
        max_uses: null
      })
    })

    if (res.ok) {
      invitation.value = await res.json()
      inviteUrl.value = `${window.location.origin}/join/${invitation.value.code}`
    }
  } catch (e) {
    console.error('生成邀请链接失败:', e)
    alert('生成失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const copyLink = async () => {
  await navigator.clipboard.writeText(inviteUrl.value)
  alert('链接已复制到剪贴板')
}

watch(() => props.visible, (val) => {
  if (val) {
    invitation.value = null
    loading.value = false
  }
})
</script>

<style scoped>
</style>
