import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getApiUrl } from '../utils/api'

export interface User {
  id: string
  openid: string
  provider: string
  nickname: string | null
  avatar: string | null
  role: 'guest' | 'user' | 'admin'
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isGuest = computed(() => !token.value)

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  async function fetchUser() {
    if (!token.value) return
    try {
      const resp = await fetch(getApiUrl('/api/auth/me'), {
        headers: { Authorization: `Bearer ${token.value}` },
      })
      if (resp.ok) {
        user.value = await resp.json()
      } else {
        logout()
      }
    } catch {
      logout()
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  // 初始化时如果有 token 就拉取用户信息
  if (token.value) {
    fetchUser()
  }

  return { token, user, isAuthenticated, isAdmin, isGuest, setToken, fetchUser, logout }
})
