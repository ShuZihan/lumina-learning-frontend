<template>
  <!-- 紧凑模式：一排小按钮 -->
  <div v-if="compact" class="shrink-0 flex items-center gap-2 py-2 px-1 flex-wrap">
    <span class="text-xs text-gray-400 mr-1">分析：</span>
    <button @click="startAnalysis('learning_plan')" class="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200/70 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors">学习计划</button>
    <button @click="startAnalysis('key_points')" class="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/70 text-emerald-600 text-xs font-medium hover:bg-emerald-100 transition-colors">提取重点</button>
    <button @click="startAnalysis('mock_questions')" class="px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-200/70 text-violet-600 text-xs font-medium hover:bg-violet-100 transition-colors">模拟考题</button>
  </div>

  <!-- 普通模式：大卡片 -->
  <div v-else class="mb-8">
    <div class="flex items-center gap-3 mb-6">
      <div>
        <h3 class="text-xl font-semibold text-gray-800 tracking-tight">选择分析功能</h3>
        <p class="text-gray-400 text-sm mt-0.5">已选择：<span class="text-amber-600 font-medium">{{ selectedResource }}</span></p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- 生成学习计划 -->
      <div class="glass-card rounded-2xl p-5 cursor-pointer group" @click="startAnalysis('learning_plan')">
        <div class="w-9 h-9 rounded-lg border border-blue-200/70 bg-blue-50/70 flex items-center justify-center mb-4">
          <svg class="w-4.5 h-4.5 text-blue-500" style="width:18px;height:18px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
            <line x1="8" y1="14" x2="11" y2="14"/>
            <line x1="8" y1="18" x2="14" y2="18"/>
          </svg>
        </div>
        <h4 class="text-base font-semibold text-gray-800 mb-1.5 tracking-tight">生成学习计划</h4>
        <p class="text-gray-400 text-sm leading-relaxed mb-4">
          根据资源内容生成阶段性学习计划，包含进度安排与方法建议。
        </p>
        <div class="flex items-center text-blue-500 text-sm font-medium gap-1 group-hover:gap-2 transition-all duration-150">
          <span>开始生成</span>
          <svg style="width:13px;height:13px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </div>

      <!-- 提取重点知识 -->
      <div class="glass-card rounded-2xl p-5 cursor-pointer group" @click="startAnalysis('key_points')">
        <div class="w-9 h-9 rounded-lg border border-emerald-200/70 bg-emerald-50/70 flex items-center justify-center mb-4">
          <svg style="width:18px;height:18px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
        </div>
        <h4 class="text-base font-semibold text-gray-800 mb-1.5 tracking-tight">提取重点知识</h4>
        <p class="text-gray-400 text-sm leading-relaxed mb-4">
          自动提炼核心知识点与关键结论，便于快速复习和记忆。
        </p>
        <div class="flex items-center text-emerald-500 text-sm font-medium gap-1 group-hover:gap-2 transition-all duration-150">
          <span>开始提取</span>
          <svg style="width:13px;height:13px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </div>

      <!-- 生成模拟考题 -->
      <div class="glass-card rounded-2xl p-5 cursor-pointer group" @click="startAnalysis('mock_questions')">
        <div class="w-9 h-9 rounded-lg border border-violet-200/70 bg-violet-50/70 flex items-center justify-center mb-4">
          <svg style="width:18px;height:18px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-violet-500">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="9" y1="13" x2="15" y2="13"/>
            <line x1="9" y1="17" x2="13" y2="17"/>
          </svg>
        </div>
        <h4 class="text-base font-semibold text-gray-800 mb-1.5 tracking-tight">生成模拟考题</h4>
        <p class="text-gray-400 text-sm leading-relaxed mb-4">
          生成选择题、判断题、简答题模拟试卷，并附参考答案。
        </p>
        <div class="flex items-center text-violet-500 text-sm font-medium gap-1 group-hover:gap-2 transition-all duration-150">
          <span>开始生成</span>
          <svg style="width:13px;height:13px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  selectedResource: string
  compact?: boolean
}>()

const emit = defineEmits<{
  'analysis-start': [filename: string, analysisType: string]
}>()

const startAnalysis = (analysisType: string) => {
  emit('analysis-start', props.selectedResource, analysisType)
}
</script>
