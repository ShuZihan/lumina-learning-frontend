import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/auth/callback',
      component: () => import('../views/AuthCallbackView.vue'),
    },
    {
      path: '/',
      component: () => import('../components/Layout/MainLayout.vue'),
      children: [
        {
          path: '',
          component: () => import('../views/ChatPage.vue'),
          // 首页对所有角色可见，但部分功能需要登录
          meta: { requiresAuth: false },
        },
        {
          path: 'dashboard',
          component: () => import('../views/Dashboard.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'projects/:projectId',
          component: () => import('../views/ProjectDetail.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'join/:code',
          component: () => import('../views/JoinView.vue'),
          meta: { requiresAuth: true },
        },
      ]
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  // 只有明确标记 requiresAuth 的路由才需要登录
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return '/login'
  }
})

export default router
