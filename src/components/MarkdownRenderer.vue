<template>
  <div :id="containerId" class="markdown-content chat-markdown" style="width: 100% !important; max-width: 100% !important;"></div>
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
      // 禁用所有外部插件
      externals: {
        echarts: null
      }
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

<style>
/* 确保所有cherry-markdown元素背景透明 */
.markdown-content .cherry,
.markdown-content .cherry * {
  --shadow-md: none !important;
  --drag-border-color: transparent !important;
  background-color: transparent !important;
}

/* 表格元素特殊处理 */
.markdown-content .cherry-table {
  width: auto !important;
  min-width: 100% !important;
  max-width: unset !important;
}

.markdown-content .cherry-table th,
.markdown-content .cherry-table td {
  min-width: 100px !important; /* 恢复Cherry默认的最小单元格宽度 */
}

/* 表格容器超宽时滚动 */
.markdown-content .cherry-table-container {
  max-width: 100% !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  padding-bottom: 0.5rem !important;
}

/* Cherry Markdown公式外层容器 - 关键！滚动容器 */
.markdown-content .Cherry-Math {
  max-width: 100% !important;
  width: 100% !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  padding: 0.5rem 0.2rem !important;
  margin: 0.5rem 0 !important;
  display: block !important;
  box-sizing: border-box !important;
  /* 强制不换行 */
  white-space: nowrap !important;
}

/* 块级公式容器 - 允许超出父容器宽度，由父容器提供滚动 */
.markdown-content .Cherry-Math .katex-display {
  margin: 0 !important;
  display: inline-block !important;
  min-width: fit-content !important;
  max-width: unset !important;
  width: auto !important;
}

/* 强制KaTeX内部元素不限制宽度 */
.markdown-content .Cherry-Math .katex,
.markdown-content .Cherry-Math .katex-html {
  max-width: unset !important;
  width: auto !important;
}

/* KaTeX公式本身允许超出，由父容器滚动 */
.markdown-content .katex {
  max-width: unset !important;
}

.markdown-content .katex-html {
  overflow-x: visible !important;
}

/* 行内公式外层容器 */
.markdown-content .Cherry-InlineMath {
  max-width: 100% !important;
  overflow-x: auto !important;
  vertical-align: middle !important;
  display: inline-block !important;
}

/* 行内公式处理 */
.markdown-content .katex-inline {
  max-width: unset !important;
}
</style>
