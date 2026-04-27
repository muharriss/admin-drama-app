<script setup>
const { user, clearSession, userInitials } = useAuthState()
const { logout } = useAuthApi()
const router = useRouter()
const toast = useToast()

const loggingOut = ref(false)

// Navigation items — ditampilkan berdasarkan akses user
const navigationItems = computed(() => {
  const items = [
    {
      label: 'Dashboard',
      icon: 'i-lucide-layout-dashboard',
      to: '/dashboard',
    },
  ]

  // Modul User Admin
  if (hasModuleAccess('provider' || 'user-admin')) {
    items.push({
      label: 'User Admin',
      icon: 'i-lucide-users',
      to: '/user-admin',
    })
  }

  // Modul Provider
  if (hasModuleAccess('provider')) {
    items.push({
      label: 'Provider',
      icon: 'i-lucide-building-2',
      to: '/provider',
    })
  }

  // Modul Token
  if (hasModuleAccess('token')) {
    items.push({
      label: 'Token',
      icon: 'i-lucide-key-round',
      to: '/token',
    })
  }

  // Modul Pengguna
  if (hasModuleAccess('pengguna')) {
    items.push({
      label: 'Pengguna',
      icon: 'i-lucide-contact',
      to: '/pengguna',
    })
  }

  return items
})

// Bottom navigation items
const bottomItems = computed(() => [
  {
    label: 'Profil',
    icon: 'i-lucide-circle-user',
    to: '/profile',
  },
])

/**
 * Cek akses modul berdasarkan nama akses user.
 * Matching pakai includes lowercase agar fleksibel.
 */
function hasModuleAccess(moduleName) {
  if (!user.value?.akses) return false
  const lower = moduleName.toLowerCase()
  return user.value.akses.some(
    (a) =>
      a._id === lower ||
      a.akses?.toLowerCase().includes(lower) ||
      a._id?.toLowerCase() === lower
  )
}

// User dropdown items
const userMenuItems = computed(() => [
  [
    {
      label: user.value?.nama || 'Admin',
      slot: 'account',
      disabled: true,
    },
  ],
  [
    {
      label: 'Profil Saya',
      icon: 'i-lucide-circle-user',
      onSelect: () => router.push('/profile'),
    },
  ],
  [
    {
      label: 'Logout',
      icon: 'i-lucide-log-out',
      color: 'error',
      onSelect: handleLogout,
    },
  ],
])

async function handleLogout() {
  if (loggingOut.value) return
  loggingOut.value = true
  try {
    await logout()
  } catch {
    // Tetap logout meski API gagal
  } finally {
    clearSession()
    const validated = useState('auth_validated')
    validated.value = false
    loggingOut.value = false
    await router.push('/login')
  }
}

const open = ref(false)



</script>

<template>
  <button @click="() => open = !open"
    class="lg:hidden fixed top-1/2  cursor-pointer z-20 bg-secondary text-white rounded-r-2xl  font-bold flex justify-center items-center py-3">
    <UIcon name="i-material-symbols-arrow-menu-open" />
  </button>

  <!-- <UDashboardSidebarToggle variant="subtle" class="z-10"/> -->
  <UDashboardGroup>
    <UDashboardSidebar v-model:open="open" id="sidebar-main" collapsible
      :ui="{ footer: 'border-t border-(--ui-border)' }">
      <!-- Sidebar Header: Logo -->
      <template #header="{ collapsed }">
        <div class="flex items-center gap-2">
          <div
            class="relative size-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 overflow-hidden">
            <!-- <UIcon name="i-lucide-clapperboard" class="size-4 text-white" /> -->
            <img src="/dramabarengicon.svg" alt="logo" class="absolute">
            <UDashboardSidebarCollapse variant="ghost" class="hover:opacity-100 opacity-0 z-20" />
          </div>

          <div v-if="!collapsed" class="flex flex-col min-w-0">
            <span class="text-sm font-bold text-(--ui-text-highlighted) truncate">Drama Admin</span>
            <span class="text-xs text-(--ui-text-muted) truncate">Management Panel</span>
          </div>

        </div>
        <UDashboardSidebarCollapse variant="ghost" class="z-30 ml-auto" v-if="!collapsed" />
      </template>

      <!-- Sidebar Body: Navigation -->
      <template #default="{ collapsed }">

        <UNavigationMenu color="secondary" :collapsed="collapsed" :items="navigationItems" orientation="vertical" />
        <UNavigationMenu color="secondary" :collapsed="collapsed" :items="bottomItems" orientation="vertical"
          class="mt-auto" />

      </template>

      <!-- Sidebar Footer: User Info -->
      <template #footer="{ collapsed }">
        <UDropdownMenu :items="userMenuItems"  :content="{align: 'start'}"  >
          <UButton color="neutral" variant="ghost" class="w-full" :block="!collapsed" :square="collapsed">
            <template #leading>
              <UAvatar :text="userInitials" size="2xs" />
            </template>
            <span v-if="!collapsed" class="truncate text-left flex-1">
              {{ user?.nama || 'Admin' }}
            </span>
            <template v-if="!collapsed" #trailing>
              <UIcon name="i-lucide-chevrons-up-down" class="size-4 text-(--ui-text-dimmed)" />
            </template>
          </UButton>
        </UDropdownMenu>
      </template>
    </UDashboardSidebar>

    <!-- Main Content Panel -->
    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar>
          <template #leading>
            <UDashboardSidebarToggle />
          </template>

          <template #right>
            <div class="flex items-center gap-2">
              <UDropdownMenu :items="userMenuItems">
                <UButton color="neutral" variant="ghost" size="sm" :loading="loggingOut">
                  <template #leading>
                    <UAvatar :text="userInitials" size="2xs" />
                  </template>
                  <span class="hidden sm:inline">{{ user?.nama || 'Admin' }}</span>
                </UButton>
              </UDropdownMenu>
            </div>
          </template>
        </UDashboardNavbar>
      </template>

      <!-- Page Content -->
      <div class="flex-1 overflow-y-auto">
        <slot />
      </div>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
