<template>
  <div class="mb-8">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-emerald-100/80 flex items-center justify-center">
          <span class="text-emerald-500 text-xl">📊</span>
        </div>
        <div>
          <h3 class="text-2xl font-bold text-gray-800">{{ analysisTypeText }}</h3>
          <p class="text-gray-500 text-sm">分析完成，点击下载按钮可以保存结果</p>
        </div>
      </div>
      <div class="flex gap-3">
        <button
          @click="downloadResult"
          class="px-4 py-2 rounded-xl bg-white/60 border border-white/40 text-gray-700 font-medium hover:bg-white/80 transition-all flex items-center gap-2"
        >
          <span>💾</span>
          下载 Markdown
        </button>
        <button
          @click="emit('reset')"
          class="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2"
        >
          <span>↻</span>
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
  return marked.parse(content)
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
