<template>
  <div class="flex flex-col glass rounded-2xl overflow-hidden">
    <!-- 顶栏 -->
    <div class="flex items-center justify-between px-5 py-3 border-b border-[#e8e8e8] shrink-0">
      <div class="min-w-0">
        <h3 class="text-sm font-semibold text-gray-800 tracking-tight">{{ analysisTypeText }}</h3>
        <p class="text-xs text-gray-400 mt-0.5 truncate">{{ selectedResource }}</p>
      </div>
      <button
        @click="emit('reset')"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-500 text-sm hover:bg-gray-100 transition-all shrink-0 ml-4"
      >
        <svg style="width:13px;height:13px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10"/>
          <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
        </svg>
        重新选择
      </button>
    </div>

    <!-- 消息列表 -->
    <div ref="messagesEl" class="flex-1 overflow-y-auto px-5 py-5 space-y-5 min-h-0">
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
            <div class="markdown-content chat-markdown" v-html="renderMd(msg.content)"></div>
          </div>
        </div>
      </div>

      <!-- 正在输入指示器 -->
      <div v-if="responding" class="flex items-start gap-2.5">
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
          placeholder="基于文档继续提问..."
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
      <p class="text-xs text-gray-400 mt-1.5 pl-1">Enter 发送 · Shift+Enter 换行</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { marked } from 'marked'
import { getApiUrl, getAuthHeaders } from '../utils/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const props = defineProps<{
  selectedResource: string
  analysisType: string
  initialMessage: string
}>()

const emit = defineEmits<{
  reset: []
}>()

const messagesEl = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLTextAreaElement | null>(null)
const inputText = ref('')
const responding = ref(false)

const messages = ref<Message[]>([
  { id: '0', role: 'assistant', content: props.initialMessage },
])

const analysisTypeText = computed(() => {
  const map: Record<string, string> = {
    learning_plan: '学习计划',
    key_points: '重点知识提取',
    mock_questions: '模拟考题生成',
  }
  return map[props.analysisType] || '分析结果'
})

const renderMd = (content: string): string => {
  return marked.parse(content || '') as string
}

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
  try {
    const resp = await fetch(getApiUrl('/api/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({
        filename: props.selectedResource,
        messages: messages.value.map(m => ({ role: m.role, content: m.content })),
      }),
    })
    const data = await resp.json()
    if (data.success) {
      messages.value.push({ id: (Date.now() + 1).toString(), role: 'assistant', content: data.content })
    } else {
      messages.value.push({ id: (Date.now() + 1).toString(), role: 'assistant', content: `抱歉，出现了错误：${data.detail || '请稍后重试'}` })
    }
  } catch {
    messages.value.push({ id: (Date.now() + 1).toString(), role: 'assistant', content: '网络请求失败，请检查连接后重试。' })
  } finally {
    responding.value = false
    await scrollToBottom()
  }
}

onMounted(() => {
  scrollToBottom()
})
</script>
