<template>
  <div class="mb-8">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-12 h-12 rounded-xl bg-amber-100/80 flex items-center justify-center">
        <span class="text-amber-500 text-xl">⚡</span>
      </div>
      <div>
        <h3 class="text-2xl font-bold text-gray-800">选择分析功能</h3>
        <p class="text-gray-500 text-sm">已选择课件: <span class="font-medium text-amber-600">{{ selectedCourse }}</span></p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- 生成学习计划 -->
      <div class="glass-card rounded-2xl p-6 cursor-pointer" @click="startAnalysis('learning_plan')">
        <div class="w-14 h-14 rounded-xl bg-blue-100/80 flex items-center justify-center mb-4">
          <span class="text-blue-500 text-2xl">🗓️</span>
        </div>
        <h4 class="text-xl font-bold text-gray-800 mb-2">生成学习计划</h4>
        <p class="text-gray-500 text-sm mb-4">
          根据课件内容生成详细的阶段性学习计划，包含学习进度安排、重点内容和方法建议。
        </p>
        <div class="flex items-center text-blue-500 font-medium text-sm">
          <span>开始生成</span>
          <span class="ml-2">→</span>
        </div>
      </div>

      <!-- 提取重点知识 -->
      <div class="glass-card rounded-2xl p-6 cursor-pointer" @click="startAnalysis('key_points')">
        <div class="w-14 h-14 rounded-xl bg-emerald-100/80 flex items-center justify-center mb-4">
          <span class="text-emerald-500 text-2xl">📝</span>
        </div>
        <h4 class="text-xl font-bold text-gray-800 mb-2">提取重点知识</h4>
        <p class="text-gray-500 text-sm mb-4">
          自动提炼课件中的核心知识点、重要概念和关键结论，便于快速复习和记忆。
        </p>
        <div class="flex items-center text-emerald-500 font-medium text-sm">
          <span>开始提取</span>
          <span class="ml-2">→</span>
        </div>
      </div>

      <!-- 生成模拟考题 -->
      <div class="glass-card rounded-2xl p-6 cursor-pointer" @click="startAnalysis('mock_questions')">
        <div class="w-14 h-14 rounded-xl bg-purple-100/80 flex items-center justify-center mb-4">
          <span class="text-purple-500 text-2xl">📋</span>
        </div>
        <h4 class="text-xl font-bold text-gray-800 mb-2">生成模拟考题</h4>
        <p class="text-gray-500 text-sm mb-4">
          根据课件内容生成包含选择题、判断题、简答题的模拟试卷，并提供参考答案。
        </p>
        <div class="flex items-center text-purple-500 font-medium text-sm">
          <span>开始生成</span>
          <span class="ml-2">→</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  selectedCourse: string
}>()

const emit = defineEmits<{
  'analysis-start': [filename: string, analysisType: string]
}>()

const startAnalysis = (analysisType: string) => {
  emit('analysis-start', props.selectedCourse, analysisType)
}
</script>
