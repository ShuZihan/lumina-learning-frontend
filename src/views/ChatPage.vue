<template>
  <div class="flex h-full overflow-hidden">
    <ResourceSelector
      ref="sidebarRef"
      @resource-selected="onResourceSelected"
    />

    <!-- ChatPanel 直接占据全屏 -->
    <div class="flex-1 min-w-0 overflow-x-hidden">
      <ChatPanel
        class="h-full"
        :selected-resource="selectedResource"
        :resource-name="selectedResourceName"
        :analysis-type="selectedAnalysisType ?? ''"
        :initial-message="initialMessage"
        :loading="loading"
        @reset="onReset"
        @analysis-start="onAnalysisStart"
      />
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

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const selectedResource = ref<string | null>(null)
const selectedResourceName = ref('')
const selectedAnalysisType = ref<string | null>(null)
const initialMessage = ref('')
const loading = ref(false)

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
    const response = await fetch(getApiUrl('/analyze'), {
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
</script>
