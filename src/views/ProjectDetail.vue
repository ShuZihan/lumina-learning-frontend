<template>
  <div v-if="project" class="p-8">
    <!-- 项目头部 -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">{{ project.name }}</h1>
          <p class="text-gray-500">{{ project.description || '暂无描述' }}</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="showInviteModal = true"
            class="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all"
          >
            邀请成员
          </button>
        </div>
      </div>
    </div>

    <!-- Tab导航 -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="flex gap-8">
        <button
          class="py-3 border-b-2 border-amber-500 text-amber-600 font-medium"
        >
          文件
        </button>
        <button
          class="py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium"
          @click="activeTab = 'members'"
        >
          成员
        </button>
      </nav>
    </div>

    <!-- 文件区 - 复用现有ResourceSelector组件 -->
    <div v-if="activeTab === 'files'">
      <ResourceSelector
        :biz-type="'workspace_team_global'"
        :biz-id="project.id"
        :show-upload="true"
      />
    </div>

    <!-- 成员列表 -->
    <div v-if="activeTab === 'members'" class="bg-white rounded-xl shadow-sm p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-800">成员列表 ({{ members.length }}人)</h3>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">用户</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">角色</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">加入时间</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in members" :key="member.id" class="border-b border-gray-100">
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                    <img :src="member.user_avatar || 'https://via.placeholder.com/32'" alt="头像" class="w-full h-full object-cover">
                  </div>
                  <span class="font-medium text-gray-800">{{ member.user_nickname || '未知用户' }}</span>
                </div>
              </td>
              <td class="py-3 px-4">
                <span :class="member.role === 'admin' ? 'text-amber-600 bg-amber-50' : 'text-gray-600 bg-gray-100'" class="px-2 py-1 rounded text-xs font-medium">
                  {{ member.role === 'admin' ? '管理员' : '成员' }}
                </span>
              </td>
              <td class="py-3 px-4 text-gray-500 text-sm">
                {{ new Date(member.joined_at).toLocaleDateString() }}
              </td>
              <td class="py-3 px-4 text-right">
                <button
                  v-if="member.role !== 'admin'"
                  class="text-red-500 hover:text-red-600 text-sm"
                  @click="removeMember(member.user_id)"
                >
                  移除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 邀请模态框 -->
    <InviteModal
      v-model:visible="showInviteModal"
      :course-id="project.id"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ResourceSelector from '../components/ResourceSelector.vue'
import InviteModal from '../components/Project/InviteModal.vue'
import { getApiUrl, getAuthHeaders } from '../utils/api'

const route = useRoute()
const projectId = route.params.projectId as string
const project = ref<any>(null)
const members = ref<any[]>([])
const activeTab = ref('files')
const showInviteModal = ref(false)

const loadProject = async () => {
  try {
    const res = await fetch(getApiUrl(`/projects/${projectId}`), {
      headers: getAuthHeaders()
    })
    if (res.ok) {
      project.value = await res.json()
    }
  } catch (e) {
    console.error('加载项目详情失败:', e)
  }
}

const loadMembers = async () => {
  try {
    const res = await fetch(getApiUrl(`/projects/${projectId}/members`), {
      headers: getAuthHeaders()
    })
    if (res.ok) {
      members.value = await res.json()
    }
  } catch (e) {
    console.error('加载成员列表失败:', e)
  }
}

const removeMember = async (userId: string) => {
  if (!confirm('确定要移除该成员吗？')) return

  try {
    const res = await fetch(getApiUrl(`/projects/${projectId}/members/${userId}`), {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    if (res.ok) {
      await loadMembers()
    }
  } catch (e) {
    console.error('移除成员失败:', e)
    alert('移除失败')
  }
}

onMounted(() => {
  loadProject()
  loadMembers()
})
</script>

<style scoped>
</style>
