<template>
  <div class="flex flex-col glass rounded-2xl overflow-hidden">
    <!-- 顶栏 -->
    <div class="flex items-center justify-between px-5 py-3 border-b border-[#e8e8e8] shrink-0">
      <div class="min-w-0">
        <h3 class="text-sm font-semibold text-gray-800 tracking-tight">{{ analysisTypeText }}</h3>
        <p class="text-xs text-gray-400 mt-0.5 truncate">{{ resourceName }}</p>
      </div>
      <button
        @click="emit('reset')"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-500 text-sm hover:bg-gray-100 transition-all shrink-0 ml-4"
      >
        <svg style="width:13px;height:13px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10"/>
          <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
        </svg>
        {{ t('chat.reset') }}
      </button>
    </div>

    <!-- 消息列表 -->
    <div ref="messagesEl" class="flex-1 overflow-y-auto px-5 py-5 space-y-5 min-h-0">

      <!-- 未开始分析时：居中显示三张功能卡片 -->
      <div v-if="messages.length === 0 && !loading && !responding" class="flex flex-col items-center justify-center h-full gap-6 py-4">
        <p class="text-sm text-gray-400">{{ t('chat.selectPrompt') }}</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
          <div class="glass-card rounded-2xl p-5 cursor-pointer group" @click="emit('analysis-start', selectedResource, 'learning_plan')">
            <div class="w-9 h-9 rounded-lg border border-blue-200/70 bg-blue-50/70 flex items-center justify-center mb-4">
              <svg style="width:18px;height:18px" class="text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="11" y2="14"/><line x1="8" y1="18" x2="14" y2="18"/>
              </svg>
            </div>
            <h4 class="text-base font-semibold text-gray-800 mb-1.5 tracking-tight">{{ t('chat.plan.title') }}</h4>
            <p class="text-gray-400 text-sm leading-relaxed mb-4">{{ t('chat.plan.desc') }}</p>
            <div class="flex items-center text-blue-500 text-sm font-medium gap-1 group-hover:gap-2 transition-all duration-150">
              <span>{{ t('chat.plan.action') }}</span>
              <svg style="width:13px;height:13px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </div>

          <div class="glass-card rounded-2xl p-5 cursor-pointer group" @click="emit('analysis-start', selectedResource, 'key_points')">
            <div class="w-9 h-9 rounded-lg border border-emerald-200/70 bg-emerald-50/70 flex items-center justify-center mb-4">
              <svg style="width:18px;height:18px" class="text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
            </div>
            <h4 class="text-base font-semibold text-gray-800 mb-1.5 tracking-tight">{{ t('chat.keyPoints.title') }}</h4>
            <p class="text-gray-400 text-sm leading-relaxed mb-4">{{ t('chat.keyPoints.desc') }}</p>
            <div class="flex items-center text-emerald-500 text-sm font-medium gap-1 group-hover:gap-2 transition-all duration-150">
              <span>{{ t('chat.keyPoints.action') }}</span>
              <svg style="width:13px;height:13px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </div>

          <div class="glass-card rounded-2xl p-5 cursor-pointer group" @click="emit('analysis-start', selectedResource, 'mock_questions')">
            <div class="w-9 h-9 rounded-lg border border-violet-200/70 bg-violet-50/70 flex items-center justify-center mb-4">
              <svg style="width:18px;height:18px" class="text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>
              </svg>
            </div>
            <h4 class="text-base font-semibold text-gray-800 mb-1.5 tracking-tight">{{ t('chat.mockQuestions.title') }}</h4>
            <p class="text-gray-400 text-sm leading-relaxed mb-4">{{ t('chat.mockQuestions.desc') }}</p>
            <div class="flex items-center text-violet-500 text-sm font-medium gap-1 group-hover:gap-2 transition-all duration-150">
              <span>{{ t('chat.mockQuestions.action') }}</span>
              <svg style="width:13px;height:13px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </div>
        </div>
      </div>

      <div v-for="msg in messages" :key="msg.id">
        <!-- 用户消息 -->
        <div v-if="msg.role === 'user'" class="flex justify-end">
          <div class="max-w-[75%] bg-blue-500 text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm leading-relaxed whitespace-pre-wrap">
            {{ msg.content }}
          </div>
        </div>
        <!-- AI消息 -->
        <div v-else class="flex items-start gap-2.5">
          <div class="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center shrink-0 mt-1">
            <svg style="width:12px;height:12px" class="text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>
            </svg>
          </div>
          <div class="min-w-0 flex-1">
            <MarkdownRenderer :content="msg.content" />
            <button
              @click="copyMarkdown(msg.content, msg.id)"
              class="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg v-if="copiedId !== msg.id" style="width:12px;height:12px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              <svg v-else style="width:12px;height:12px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span :class="copiedId === msg.id ? 'text-emerald-500' : ''">{{ copiedId === msg.id ? t('chat.copied') : t('chat.copy') }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 正在输入指示器 -->
      <div v-if="(responding || loading) && !streamingId" class="flex items-start gap-2.5">
        <div class="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center shrink-0">
          <svg style="width:12px;height:12px" class="text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>
          </svg>
        </div>
        <div class="flex items-center gap-1.5 py-2">
          <div class="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
          <div class="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
          <div class="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
        </div>
      </div>
    </div>

    <!-- 输入区 -->
    <div class="shrink-0 px-4 pt-3 pb-4 border-t border-[#e8e8e8]">
      <div class="flex items-end gap-2">
        <textarea
          ref="inputEl"
          v-model="inputText"
          @input="autoResize"
          @keydown="handleKeydown"
          :placeholder="t('chat.placeholder')"
          :disabled="responding"
          rows="1"
          class="flex-1 resize-none rounded-xl border border-[#d1d7dc] px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-400 transition-colors leading-relaxed"
          style="max-height: 120px; overflow-y: auto;"
        ></textarea>
        <button
          @click="sendMessage"
          :disabled="!inputText.trim() || responding"
          class="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
        >
          <svg style="width:15px;height:15px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
      <p class="text-xs text-gray-400 mt-1.5 pl-1">{{ t('chat.keyHint') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { getApiUrl, getAuthHeaders } from '../utils/api'

const { t } = useI18n()
const MarkdownRenderer = defineAsyncComponent(() => import('./MarkdownRenderer.vue'))

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const props = defineProps<{
  selectedResource: string
  resourceName: string
  analysisType: string
  initialMessage: string
  loading?: boolean
}>()

const emit = defineEmits<{
  reset: []
  'analysis-start': [filename: string, analysisType: string]
}>()

const messagesEl = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLTextAreaElement | null>(null)
const inputText = ref('')
const responding = ref(false)
const streamingId = ref<string | null>(null)
const copiedId = ref<string | null>(null)

const copyMarkdown = async (content: string, id: string) => {
  await navigator.clipboard.writeText(content)
  copiedId.value = id
  setTimeout(() => { copiedId.value = null }, 2000)
}

const messages = ref<Message[]>(
  props.initialMessage ? [{ id: '0', role: 'assistant', content: props.initialMessage }] : []
)

watch(() => props.initialMessage, (val) => {
  if (!val) return
  const existing = messages.value.find(m => m.id === '0')
  if (existing) {
    existing.content = val
  } else {
    messages.value.push({ id: '0', role: 'assistant', content: val })
  }
  scrollToBottom()
})

const analysisTypeText = computed(() => {
  const key = `chat.analysisType.${props.analysisType}`
  const val = t(key)
  return val === key ? t('chat.analysisType.default') : val
})

const scrollToBottom = async () => {
  await nextTick()
  if (messagesEl.value) {
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  }
}

const autoResize = () => {
  if (!inputEl.value) return
  inputEl.value.style.height = 'auto'
  inputEl.value.style.height = Math.min(inputEl.value.scrollHeight, 120) + 'px'
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

const sendMessage = async () => {
  const text = inputText.value.trim()
  if (!text || responding.value) return

  messages.value.push({ id: Date.now().toString(), role: 'user', content: text })
  inputText.value = ''
  if (inputEl.value) inputEl.value.style.height = 'auto'
  await scrollToBottom()

  responding.value = true
  const aiMsgId = (Date.now() + 1).toString()
  try {
    const resp = await fetch(getApiUrl('/api/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({
        filename: props.selectedResource,
        messages: messages.value.map(m => ({ role: m.role, content: m.content })),
      }),
    })

    const contentType = resp.headers.get('content-type') || ''
    if (contentType.includes('text/event-stream') && resp.body) {
      streamingId.value = aiMsgId
      messages.value.push({ id: aiMsgId, role: 'assistant', content: '' })
      await scrollToBottom()

      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const aiMsg = messages.value.find(m => m.id === aiMsgId)
        const doneIdx = chunk.indexOf('[DONE]')
        if (doneIdx !== -1) {
          if (aiMsg && doneIdx > 0) aiMsg.content += chunk.substring(0, doneIdx)
          break
        }
        if (chunk.includes('[ERROR]')) {
          if (aiMsg) aiMsg.content = t('chat.errorOccurred') + chunk.replace(/.*\[ERROR\]\s*/, '')
          break
        }
        if (aiMsg) aiMsg.content += chunk
        await scrollToBottom()
      }
    } else {
      const data = await resp.json()
      if (data.success) {
        messages.value.push({ id: aiMsgId, role: 'assistant', content: data.content })
      } else {
        messages.value.push({ id: aiMsgId, role: 'assistant', content: t('chat.errorOccurred') + (data.detail || t('chat.retryLater')) })
      }
    }
  } catch {
    messages.value.push({ id: aiMsgId, role: 'assistant', content: t('chat.networkError') })
  } finally {
    streamingId.value = null
    responding.value = false
    await scrollToBottom()
  }
}

onMounted(() => {
  scrollToBottom()
})
</script>
