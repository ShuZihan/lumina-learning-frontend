import { marked } from 'marked'
import DOMPurify from 'dompurify'
import markedKatex from 'marked-katex-extension'
import 'katex/dist/katex.min.css'

marked.use(markedKatex({ throwOnError: false }))

const DOMPURIFY_CONFIG = {
  ADD_TAGS: ['math', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'mfrac', 'msubsup', 'mover', 'munder', 'mspace', 'mtable', 'mtr', 'mtd', 'annotation'],
  ADD_ATTR: ['xmlns', 'display'],
}

function normalizeLatex(content: string): string {
  return content
    .replace(/([^\n])\s*(\$\$)/g, '$1\n$2')  // $$ 前若无换行则补上
    .replace(/\$\$([^\n$])/g, '$$\n$1')      // $$ 后若紧跟文字则补换行
    .replace(/\\\[/g, '$$').replace(/\\\]/g, '$$')
    .replace(/\\\(/g, '$').replace(/\\\)/g, '$')
}

export function renderMarkdown(content: string): string {
  return DOMPurify.sanitize(marked.parse(normalizeLatex(content)) as string, DOMPURIFY_CONFIG)
}
