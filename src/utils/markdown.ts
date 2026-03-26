import { marked } from 'marked'
import DOMPurify from 'dompurify'
import markedKatex from 'marked-katex-extension'
import 'katex/dist/katex.min.css'

marked.use(markedKatex({ throwOnError: false }))

const DOMPURIFY_CONFIG = {
  ADD_TAGS: ['math', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'mfrac', 'msubsup', 'mover', 'munder', 'mspace', 'mtable', 'mtr', 'mtd', 'annotation'],
  ADD_ATTR: ['xmlns', 'display'],
}

function wrapCjkInMath(content: string): string {
  const cjk = /[\u4e00-\u9fff\u3400-\u4dbf\uff00-\uffef]+/g
  // Block math first
  content = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, inner) =>
    '$$' + inner.replace(cjk, '\\text{$&}') + '$$'
  )
  // Inline math $...$ (not $$)
  content = content.replace(/(?<!\$)\$(?!\$)([^\n$]+?)(?<!\$)\$(?!\$)/g, (_, inner) =>
    '$' + inner.replace(/[\u4e00-\u9fff\u3400-\u4dbf\uff00-\uffef]+/g, '\\text{$&}') + '$'
  )
  return content
}

function normalizeLatex(content: string): string {
  // Convert \[...\] and \(...\) first so they also get CJK wrapping and newline normalization
  content = content
    .replace(/\\\[/g, '$$').replace(/\\\]/g, '$$')
    .replace(/\\\(/g, '$').replace(/\\\)/g, '$')
  content = wrapCjkInMath(content)
  return content
    .replace(/([^\n])\s*(\$\$)/g, '$1\n$2')  // $$ 前若无换行则补上
    .replace(/\$\$([^\n$])/g, '$$\n$1')      // $$ 后若紧跟文字则补换行
}

export function renderMarkdown(content: string): string {
  const normalized = normalizeLatex(content)
    .replace(/）\*\*/g, '）** ')
  return DOMPurify.sanitize(marked.parse(normalized) as string, DOMPURIFY_CONFIG)
}
