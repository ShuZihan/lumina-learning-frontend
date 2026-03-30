<template>
  <div v-if="visible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl w-full max-w-md p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-semibold text-gray-800">加入项目</h3>
        <button @click="close" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">邀请码</label>
          <input
            v-model="code"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-center text-lg tracking-widest uppercase"
            placeholder="请输入8位邀请码"
            maxlength="8"
            required
          />
        </div>

        <div class="flex gap-3 justify-end">
          <button
            type="button"
            @click="close"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="loading || code.length < 8"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50"
          >
            {{ loading ? '加入中...' : '加入' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { getApiUrl, getAuthHeaders } from '../../utils/api'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'success': []
}>()

const code = ref('')
const loading = ref(false)

const close = () => {
  code.value = ''
  loading.value = false
  emit('update:visible', false)
}

const handleSubmit = async () => {
  if (code.value.length < 8) return

  loading.value = true
  try {
    const res = await fetch(getApiUrl('/projects/join'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ code: code.value.toUpperCase() })
    })

    if (res.ok) {
      emit('success')
      close()
    } else {
      const err = await res.json()
      alert(err.detail || '加入失败')
    }
  } catch (e) {
    console.error('加入项目失败:', e)
    alert('加入失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

watch(() => props.visible, (val) => {
  if (val) {
    code.value = ''
    loading.value = false
  }
})
</script>

<style scoped>
</style>
