<template>
  <div class="flex flex-col h-full px-0 md:px-10 lg:px-28 bg-white min-w-0 overflow-x-hidden">
    <!-- 顶栏 -->
    <div class="flex items-center justify-between px-0 py-3 shrink-0">
      <div class="min-w-0">
        <h3 class="text-sm font-semibold text-gray-800 tracking-tight">{{ analysisTypeText }}</h3>
        <p class="text-xs text-gray-400 mt-0.5 truncate">{{ resourceName }}</p>
      </div>
      <div class="relative group">
        <button
          ref="resetBtnRef"
          @click="handleReset"
          @mouseenter="handleTooltipEnter"
          @mouseleave="handleTooltipLeave"
          :disabled="messages.length === 0"
          class="flex items-center gap-1.5 px-2 py-1 rounded-lg text-gray-500 text-sm hover:bg-red-50 hover:text-red-600 transition-all shrink-0 ml-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500"
        >
          <svg style="width:15px;height:15px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
        <!-- 浮窗文字 - 直接挂载到body -->
        <Teleport to="body">
          <div
            class="fixed opacity-0 transition-opacity pointer-events-none"
            :style="{ top: tooltipTop, right: tooltipRight, zIndex: 99999, opacity: showTooltip ? 1 : 0 }"
          >
            <div class="bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded whitespace-nowrap">
              {{ t('chat.reset') }}
            </div>
          </div>
        </Teleport>
      </div>
    </div>

    <!-- 消息列表 -->
    <div ref="messagesEl" class="flex-1 overflow-y-auto overflow-x-hidden pl-4 pr-0 md:pl-0 md:pr-0 py-0 space-y-5 min-h-0 min-w-0 bg-white">

      <!-- 未开始分析时：居中显示三张功能卡片 -->
      <div v-if="messages.length === 0 && !loading && !responding" class="flex flex-col items-center justify-center h-full gap-6 py-4">
        <p class="text-sm text-gray-400">{{ t('chat.selectPrompt') }}</p>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full max-w-5xl px-2 md:px-3">
          <!-- 学习计划卡片 -->
          <div class="relative overflow-hidden bg-white rounded-2xl cursor-pointer group shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" @click="emit('analysis-start', selectedResource, 'learning_plan')">
            <!-- 装饰性渐变背景 -->
            <div class="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <!-- 装饰元素 -->
            <div class="absolute -right-8 -top-8 w-24 h-24 bg-blue-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>

            <div class="relative p-7">
              <!-- 图标 -->
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg style="width:22px;height:22px" class="text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="11" y2="14"/><line x1="8" y1="18" x2="14" y2="18"/>
                </svg>
              </div>

              <!-- 标题 -->
              <h4 class="text-lg font-bold text-gray-800 mb-2 tracking-tight group-hover:text-blue-600 transition-colors duration-200">{{ t('chat.plan.title') }}</h4>

              <!-- 描述 -->
              <p class="text-gray-500 text-sm leading-relaxed mb-5">{{ t('chat.plan.desc') }}</p>

              <!-- 操作按钮 -->
              <div class="flex items-center gap-2 text-blue-600 font-semibold text-sm">
                <span>{{ t('chat.plan.action') }}</span>
                <svg style="width:16px;height:16px" class="group-hover:translate-x-1 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>

            <!-- 边框效果 -->
            <div class="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-200 transition-colors duration-200 pointer-events-none"></div>
          </div>

          <!-- 重点知识卡片 -->
          <div class="relative overflow-hidden bg-white rounded-2xl cursor-pointer group shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" @click="emit('analysis-start', selectedResource, 'key_points')">
            <!-- 装饰性渐变背景 -->
            <div class="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <!-- 装饰元素 -->
            <div class="absolute -right-8 -top-8 w-24 h-24 bg-emerald-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>

            <div class="relative p-7">
              <!-- 图标 -->
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                <svg style="width:22px;height:22px" class="text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
              </div>

              <!-- 标题 -->
              <h4 class="text-lg font-bold text-gray-800 mb-2 tracking-tight group-hover:text-emerald-600 transition-colors duration-200">{{ t('chat.keyPoints.title') }}</h4>

              <!-- 描述 -->
              <p class="text-gray-500 text-sm leading-relaxed mb-5">{{ t('chat.keyPoints.desc') }}</p>

              <!-- 操作按钮 -->
              <div class="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                <span>{{ t('chat.keyPoints.action') }}</span>
                <svg style="width:16px;height:16px" class="group-hover:translate-x-1 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>

            <!-- 边框效果 -->
            <div class="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-emerald-200 transition-colors duration-200 pointer-events-none"></div>
          </div>

          <!-- 模拟考题卡片 -->
          <div class="relative overflow-hidden bg-white rounded-2xl cursor-pointer group shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" @click="emit('analysis-start', selectedResource, 'mock_questions')">
            <!-- 装饰性渐变背景 -->
            <div class="absolute inset-0 bg-gradient-to-br from-violet-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <!-- 装饰元素 -->
            <div class="absolute -right-8 -top-8 w-24 h-24 bg-violet-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>

            <div class="relative p-7">
              <!-- 图标 -->
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg shadow-violet-500/25 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg style="width:22px;height:22px" class="text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>
                </svg>
              </div>

              <!-- 标题 -->
              <h4 class="text-lg font-bold text-gray-800 mb-2 tracking-tight group-hover:text-violet-600 transition-colors duration-200">{{ t('chat.mockQuestions.title') }}</h4>

              <!-- 描述 -->
              <p class="text-gray-500 text-sm leading-relaxed mb-5">{{ t('chat.mockQuestions.desc') }}</p>

              <!-- 操作按钮 -->
              <div class="flex items-center gap-2 text-violet-600 font-semibold text-sm">
                <span>{{ t('chat.mockQuestions.action') }}</span>
                <svg style="width:16px;height:16px" class="group-hover:translate-x-1 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>

            <!-- 边框效果 -->
            <div class="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-violet-200 transition-colors duration-200 pointer-events-none"></div>
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

    <!-- 淡入淡出分隔效果 -->
    <div class="h-4 bg-gradient-to-b from-transparent to-white"></div>

    <!-- 输入区 -->
    <div class="shrink-0 px-0 pt-0 pb-0">
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
const resetBtnRef = ref<HTMLButtonElement | null>(null)
const tooltipTop = ref('0px')
const tooltipRight = ref('0px')
const showTooltip = ref(false)
const inputText = ref('')
const responding = ref(false)
const streamingId = ref<string | null>(null)
const copiedId = ref<string | null>(null)

const handleReset = () => {
  messages.value = [];
  emit('reset');
}

const handleTooltipEnter = () => {
  if (resetBtnRef.value) {
    const rect = resetBtnRef.value.getBoundingClientRect()
    tooltipTop.value = rect.top - 28 + 'px'
    tooltipRight.value = window.innerWidth - rect.right + 'px'
    showTooltip.value = true
  }
}

const handleTooltipLeave = () => {
  showTooltip.value = false
}

const copyMarkdown = async (content: string, id: string) => {
  await navigator.clipboard.writeText(content)
  copiedId.value = id
  setTimeout(() => { copiedId.value = null }, 2000)
}

const messages = ref<Message[]>(
  props.initialMessage ? [{ id: '0', role: 'assistant', content: props.initialMessage }] : []
)

watch(() => props.initialMessage, (val) => {
  if (val) {
    const existing = messages.value.find(m => m.id === '0')
    if (existing) {
      existing.content = val
    } else {
      messages.value.push({ id: '0', role: 'assistant', content: val })
    }
  } else {
    messages.value = []
  }
  scrollToBottom()
})

const analysisTypeText = computed(() => {
  if (!props.analysisType) return t('chat.analysisType.default')
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
