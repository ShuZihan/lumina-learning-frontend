<template>
  <div class="mb-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-800 tracking-tight">{{ analysisTypeText }}</h3>
        <p class="text-gray-400 text-sm mt-0.5">分析完成，可下载保存结果</p>
      </div>
      <div class="flex gap-2">
        <button
          @click="downloadResult"
          class="px-3.5 py-1.5 rounded-lg bg-white/60 border border-[#e2dacc] text-gray-600 text-sm hover:bg-white/90 transition-all flex items-center gap-1.5"
        >
          <svg style="width:14px;height:14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          下载
        </button>
        <button
          @click="emit('reset')"
          class="px-3.5 py-1.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-all flex items-center gap-1.5"
        >
          <svg style="width:14px;height:14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
          </svg>
          重新分析
        </button>
      </div>
    </div>

    <div class="glass rounded-2xl p-8">
      <div class="markdown-content" v-html="renderedMarkdown"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import markedKatex from 'marked-katex-extension'
import 'katex/dist/katex.min.css'

marked.use(markedKatex({ throwOnError: false }))

function normalizeLatex(content: string): string {
  return content
    .replace(/\\\[/g, '$$').replace(/\\\]/g, '$$')
    .replace(/\\\(/g, '$').replace(/\\\)/g, '$')
}

const props = defineProps<{
  result: any
  analysisType: string
}>()

const emit = defineEmits<{
  reset: []
}>()

const analysisTypeText = computed(() => {
  const map: Record<string, string> = {
    learning_plan: '学习计划',
    key_points: '重点知识提取',
    mock_questions: '模拟考题生成'
  }
  return map[props.analysisType] || '分析结果'
})

const renderedMarkdown = computed(() => {
  let content = props.result.content || ''
  // 处理流式输出中的未闭合标题：如果内容有#开头但行尾没有换行，自动补全一个临时换行
  // 避免所有内容都被解析为h1
  const lines = content.split('\n')
  if (lines.length > 0) {
    const lastLine = lines[lines.length - 1]
    // 检查最后一行是否是未闭合的标题
    if (/^#{1,6} /.test(lastLine) && !lastLine.includes('\n')) {
      content += '\n'
    }
  }
  return DOMPurify.sanitize(marked.parse(normalizeLatex(content)) as string, {
    ADD_TAGS: ['math', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'mfrac', 'msubsup', 'mover', 'munder', 'mspace', 'mtable', 'mtr', 'mtd', 'annotation'],
    ADD_ATTR: ['xmlns', 'display'],
  })
})

const downloadResult = () => {
  const content = props.result.content || ''
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${analysisTypeText.value}_${Date.now()}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>
