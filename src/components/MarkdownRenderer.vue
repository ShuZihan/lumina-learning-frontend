<template>
  <div :id="containerId" class="markdown-content chat-markdown"></div>
</template>

<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'
import Cherry from 'cherry-markdown'
import katex from 'katex'
import 'cherry-markdown/dist/cherry-markdown.css'
import 'katex/dist/katex.min.css'

// 全局声明 katex，供 cherry-markdown 使用
if (typeof window !== 'undefined') {
  ; (window as any).katex = katex
}

const containerId = `cherry-md-${Math.random().toString(36).slice(2)}`
let cherryInstance: any = null

const props = defineProps<{ content: string }>()

onMounted(() => {
  cherryInstance = new Cherry({
      id: containerId,
      value: '',
      themeSettings: {
        mainTheme: 'gray',
      },
      editor: {
        height: 'auto',
        defaultModel: 'previewOnly', // 纯预览模式适合流式场景
      },
      engine: {
        global: {
          flowSessionContext: true,     // 开启流式渲染
          flowSessionCursor: '', // 添加虚拟光标
        },
        syntax: {
          codeBlock: {
            selfClosing: false,
          },
          table: {
            selfClosing: false,
          },
          fontEmphasis: {
            selfClosing: false,
          },
          header: {
            anchorStyle: 'none',
            selfClosing: false,
          },
          link: {
            selfClosing: false,
          },
          image: {
            selfClosing: false,
          },
          mathBlock: {
            selfClosing: false,
            engine: 'katex',
          },
          inlineMath: {
            selfClosing: false,
            engine: 'katex',
          },
        },
      },
      previewer: {
        enablePreviewerBubble: false,
      },
    })
})

watch(() => props.content, (newContent) => {
  if (cherryInstance) {
    cherryInstance.setMarkdown(newContent || '')
  }
})

onUnmounted(() => {
  if (cherryInstance) {
    cherryInstance.destroy()
  }
})
</script>

<style scoped>
.markdown-content :deep(.cherry) {
  --shadow-md: none;
  --drag-border-color: transparent;
}
</style>
