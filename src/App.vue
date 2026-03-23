<template>
  <div class="min-h-screen">
    <!-- 导航栏 -->
    <nav class="glass-nav sticky top-0 z-50">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg animate-float">
            <span class="text-white text-xl font-bold">✨</span>
          </div>
          <div>
            <h1 class="font-bold text-lg text-gray-800">Lumina Learning</h1>
            <p class="text-xs text-gray-500">AI 驱动的课件分析工具</p>
          </div>
        </div>
        <span class="px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm text-blue-600 text-sm font-medium border border-white/50 shadow-sm">
          <span class="mr-1">🤖</span>Claude AI 驱动
        </span>
      </div>
    </nav>

    <!-- 主要内容 -->
    <main class="pt-8 pb-12 px-4">
      <div class="container mx-auto max-w-6xl">
        <!-- 欢迎区域 -->
        <div class="glass rounded-2xl p-8 mb-8 text-center">
          <h2 class="text-3xl font-bold text-gray-800 mb-4">欢迎使用 Lumina Learning</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            选择课件，AI将自动为您生成学习计划、提取重点知识或生成模拟考题，提升学习效率。
          </p>
        </div>

        <!-- 课件选择区域 -->
        <CourseSelector @course-selected="onCourseSelected" />

        <!-- 功能选择区域 -->
        <FunctionSelector
          v-if="selectedCourse"
          :selected-course="selectedCourse"
          @analysis-start="onAnalysisStart"
        />

        <!-- 结果展示区域 -->
        <div v-if="loading || analysisResult">
          <ResultViewer
            v-if="analysisResult && analysisResult.content && selectedAnalysisType"
            :result="analysisResult"
            :analysis-type="selectedAnalysisType!"
            @reset="onReset"
          />

          <!-- 内联加载状态 -->
          <div v-if="loading" class="glass rounded-2xl p-12 text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100/80 flex items-center justify-center animate-float">
              <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">AI 分析中</h3>
            <p class="text-gray-500">正在处理课件内容，很快就好...</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CourseSelector from './components/CourseSelector.vue'
import FunctionSelector from './components/FunctionSelector.vue'
import ResultViewer from './components/ResultViewer.vue'
import { getApiUrl } from './utils/api'

const selectedCourse = ref<string | null>(null)
const selectedAnalysisType = ref<string | null>(null)
const analysisResult = ref<any>(null)
const loading = ref(false)

const onCourseSelected = (filename: string) => {
  selectedCourse.value = filename
  analysisResult.value = null
}

const onAnalysisStart = async (filename: string, analysisType: string) => {
  loading.value = true
  selectedAnalysisType.value = analysisType
  analysisResult.value = null

  try {
    const response = await fetch(getApiUrl('/api/analyze'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filename,
        analysis_type: analysisType
      })
    })

    const data = await response.json()
    if (data.success) {
      analysisResult.value = data.result
    } else {
      alert('分析失败: ' + (data.detail || '未知错误'))
    }
  } catch (error) {
    alert('请求失败，请检查后端服务是否运行')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const onReset = () => {
  selectedCourse.value = null
  analysisResult.value = null
  selectedAnalysisType.value = null
}
</script>
