import { ref, onMounted } from 'vue'
import { StorageKeys, getItem, setItem, onStorageChange } from '../utils/storage'

/**
 * 侧边栏状态管理 composable
 * 支持本地持久化和跨标签页同步
 */
export function useSidebar() {
  const collapsed = ref(false)
  const initialized = ref(false)

  onMounted(() => {
    // 初始化时读取本地存储
    collapsed.value = getItem(StorageKeys.SIDEBAR_COLLAPSED, false)
    initialized.value = true

    // 监听其他标签页的变化
    const unsubscribe = onStorageChange<boolean>(
      StorageKeys.SIDEBAR_COLLAPSED,
      (value) => {
        if (value !== null) {
          collapsed.value = value
        }
      }
    )

    return unsubscribe
  })

  /**
   * 切换侧边栏状态
   */
  const toggle = () => {
    collapsed.value = !collapsed.value
    setItem(StorageKeys.SIDEBAR_COLLAPSED, collapsed.value)
  }

  /**
   * 设置展开状态
   */
  const expand = () => {
    collapsed.value = false
    setItem(StorageKeys.SIDEBAR_COLLAPSED, false)
  }

  /**
   * 设置折叠状态
   */
  const collapse = () => {
    collapsed.value = true
    setItem(StorageKeys.SIDEBAR_COLLAPSED, true)
  }

  return {
    collapsed,
    initialized,
    toggle,
    expand,
    collapse,
  }
}
