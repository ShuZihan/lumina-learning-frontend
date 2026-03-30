<template>
  <div v-if="visible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl w-full max-w-md p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-semibold text-gray-800">创建新项目</h3>
        <button @click="close" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">项目名称</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="请输入项目名称"
            required
          />
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">项目描述（可选）</label>
          <textarea
            v-model="form.description"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            rows="3"
            placeholder="请输入项目描述"
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
            :disabled="loading"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50"
          >
            {{ loading ? '创建中...' : '创建' }}
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

const form = ref({
  name: '',
  description: ''
})
const loading = ref(false)

const close = () => {
  form.value = { name: '', description: '' }
  loading.value = false
  emit('update:visible', false)
}

const handleSubmit = async () => {
  if (!form.value.name.trim()) return

  loading.value = true
  try {
    const res = await fetch(getApiUrl('/projects'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(form.value)
    })

    if (res.ok) {
      emit('success')
      close()
    } else {
      const err = await res.json()
      alert(err.detail || '创建失败')
    }
  } catch (e) {
    console.error('创建项目失败:', e)
    alert('创建失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

watch(() => props.visible, (val) => {
  if (val) {
    form.value = { name: '', description: '' }
    loading.value = false
  }
})
</script>

<style scoped>
</style>
