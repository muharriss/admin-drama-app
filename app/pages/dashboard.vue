<script setup>
const { user } = useAuthState()
const { getMe } = useAuthApi()

const statsLoading = ref(true)

const stats = ref([
  {
    label: 'User Admin',
    value: 0,
    icon: 'i-lucide-users',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    ring: 'ring-blue-500/20',
    to: '/user-admin',
  },
  {
    label: 'Provider',
    value: 0,
    icon: 'i-lucide-building-2',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    ring: 'ring-emerald-500/20',
    to: '/provider',
  },
  {
    label: 'Token',
    value: 0,
    icon: 'i-lucide-key-round',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    ring: 'ring-amber-500/20',
    to: '/token',
  },
  {
    label: 'Pengguna',
    value: 0,
    icon: 'i-lucide-contact',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    ring: 'ring-purple-500/20',
    to: '/pengguna',
  },
])

// Fetch stats from APIs
const fetchStats = async () => {
  statsLoading.value = true
  try {
    const [userRes, providerRes, tokenRes, penggunaRes] = await Promise.allSettled([
      useUserAdminApi().getUsers({ page: 1, limit: 1 }),
      useProviderApi().getProviders({ page: 1, limit: 1 }),
      useTokenApi().getTokens(),
      usePenggunaApi().getPengguna({ page: 1, limit: 1 }),
    ])

    if (userRes.status === 'fulfilled') {
      stats.value[0].value = userRes.value.meta?.pagination?.total ?? 0
    }
    if (providerRes.status === 'fulfilled') {
      stats.value[1].value = providerRes.value.meta?.pagination?.total ?? 0
    }
    if (tokenRes.status === 'fulfilled') {
      stats.value[2].value = tokenRes.value.meta?.total ?? tokenRes.value.data?.length ?? 0
    }
    if (penggunaRes.status === 'fulfilled') {
      stats.value[3].value = penggunaRes.value.meta?.pagination?.total ?? 0
    }
  } catch {
    // Silently handle
  } finally {
    statsLoading.value = false
  }
}

// Modul akses user
const accessModules = computed(() => {
  if (!user.value?.akses) return []
  return user.value.akses.map((a) => ({
    name: a.akses,
    code: a._id,
    methods: a.method || [],
    description: a.keterangan || '',
  }))
})

// Greeting berdasarkan jam
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Selamat Pagi'
  if (hour < 15) return 'Selamat Siang'
  if (hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
})

const greetingEmoji = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '☀️'
  if (hour < 15) return '🌤️'
  if (hour < 18) return '🌅'
  return '🌙'
})

// Quick actions
const quickActions = computed(() => {
  const actions = []

  if (hasAccess('provider' || 'user-admin')) {
    actions.push({
      label: 'Kelola User Admin',
      icon: 'i-lucide-users',
      description: 'Tambah & atur admin',
      to: '/user-admin',
      color: 'secondary',
    })
  }
  if (hasAccess('provider')) {
    actions.push({
      label: 'Kelola Provider',
      icon: 'i-lucide-building-2',
      description: 'Atur sumber data drama',
      to: '/provider',
      color: 'secondary',
    })
  }
  if (hasAccess('token')) {
    actions.push({
      label: 'Kelola Token',
      icon: 'i-lucide-key-round',
      description: 'Kelola API token bisnis',
      to: '/token',
      color: 'secondary',
    })
  }
  if (hasAccess('pengguna')) {
    actions.push({
      label: 'Lihat Pengguna',
      icon: 'i-lucide-contact',
      description: 'Data pengguna aplikasi',
      to: '/pengguna',
      color: 'secondary',
    })
  }
  actions.push({
    label: 'Profil Saya',
    icon: 'i-lucide-circle-user',
    description: 'Pengaturan akun Anda',
    to: '/profile',
    color: 'neutral',
  })

  return actions
})

function hasAccess(moduleName) {
  if (!user.value?.akses) return false
  const lower = moduleName.toLowerCase()
  return user.value.akses.some(
    (a) =>
      a._id === lower ||
      a.akses?.toLowerCase().includes(lower) ||
      a._id?.toLowerCase() === lower
  )
}

// Current date/time
const currentDate = computed(() => {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

onMounted(() => {
  fetchStats()
})
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-6">

    <Head>
      <title>Dashboard — Drama Admin</title>
    </Head>

    <!-- Welcome Section -->
    <div class="rounded-2xl bg-gradient-to-br from-secondary/15 via-secondary/5 to-transparent border border-secondary/10 p-6 sm:p-8 relative overflow-hidden">
      <!-- Decorative elements -->
      <div class="absolute -right-8 -top-8 size-32 bg-secondary/5 rounded-full blur-2xl"></div>
      <div class="absolute right-20 bottom-0 size-20 bg-secondary/5 rounded-full blur-xl"></div>

      <div class="flex items-start justify-between relative z-10">
        <div>
          <p class="text-sm text-(--ui-text-muted) mb-1">{{ currentDate }}</p>
          <h1 class="text-2xl sm:text-3xl font-bold text-(--ui-text-highlighted)">
            {{ greeting }}, {{ user?.nama || 'Admin' }} 👋
          </h1>
          <p class="text-(--ui-text-muted) mt-2 text-sm sm:text-base">
            Selamat datang di panel admin Drama Apps. Kelola semua modul dari sini.
          </p>
        </div>
        <UBadge v-if="user?.status" color="success" variant="subtle" size="lg" class="hidden sm:flex">
          <UIcon name="i-lucide-circle-check" class="size-3.5 mr-1" />
          Aktif
        </UBadge>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <NuxtLink v-for="stat in stats" :key="stat.label" :to="stat.to" class="group">
        <UCard :ui="{
          root: 'hover:border-secondary/30 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/5 cursor-pointer hover:-translate-y-0.5',
          body: 'p-4 sm:p-5',
        }">
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <div :class="[stat.bg, 'rounded-xl p-2.5 ring-1 flex justify-center items-center', stat.ring, 'transition-transform duration-300 group-hover:scale-110']">
                <UIcon :name="stat.icon" :class="[stat.color, 'size-5']" class=""/>
              </div>
              <UIcon name="i-lucide-arrow-up-right" class="size-4 text-(--ui-text-dimmed) opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <p v-if="statsLoading" class="text-2xl font-bold text-(--ui-text-highlighted)">
                <span class="inline-block w-10 h-7 bg-(--ui-bg-elevated) rounded animate-pulse"></span>
              </p>
              <p v-else class="text-2xl sm:text-3xl font-bold text-(--ui-text-highlighted)">
                {{ stat.value.toLocaleString() }}
              </p>
              <p class="text-xs text-(--ui-text-muted) uppercase tracking-wide font-medium mt-1">{{ stat.label }}</p>
            </div>
          </div>
        </UCard>
      </NuxtLink>
    </div>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Quick Actions -->
      <div class="lg:col-span-2">
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <div class="size-7 rounded-lg bg-secondary/10 flex items-center justify-center">
                <UIcon name="i-lucide-zap" class="size-4 text-secondary" />
              </div>
              <span class="font-semibold text-(--ui-text-highlighted)">Quick Action</span>
            </div>
          </template>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NuxtLink v-for="action in quickActions" :key="action.label" :to="action.to" class="group">
              <div class="flex items-center gap-3 p-3 rounded-xl border border-(--ui-border) hover:border-secondary/30 hover:bg-secondary/5 transition-all duration-200 cursor-pointer">
                <div class="size-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <UIcon :name="action.icon" class="size-5 text-secondary" />
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-(--ui-text-highlighted) truncate">{{ action.label }}</p>
                  <p class="text-xs text-(--ui-text-muted) truncate">{{ action.description }}</p>
                </div>
                <UIcon name="i-lucide-chevron-right" class="size-4 text-(--ui-text-dimmed) ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </NuxtLink>
          </div>
        </UCard>
      </div>

      <!-- Access Modules -->
      <div>
        <UCard class="h-full">
          <template #header>
            <div class="flex items-center gap-2">
              <div class="size-7 rounded-lg bg-secondary/10 flex items-center justify-center">
                <UIcon name="i-lucide-shield-check" class="size-4 text-secondary" />
              </div>
              <span class="font-semibold text-(--ui-text-highlighted)">Hak Akses Anda</span>
            </div>
          </template>

          <div v-if="accessModules.length" class="space-y-3">
            <div v-for="mod in accessModules" :key="mod.code"
              class="rounded-xl border border-(--ui-border) p-3 hover:border-secondary/20 transition-colors">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-(--ui-text-highlighted)">{{ mod.name }}</span>
                <UBadge color="neutral" variant="subtle" size="xs">{{ mod.code }}</UBadge>
              </div>
              <div class="flex flex-wrap gap-1">
                <UBadge v-for="method in mod.methods" :key="method"
                  :color="method === 'DELETE' ? 'error' : method === 'POST' ? 'success' : method === 'PUT' || method === 'PATCH' ? 'warning' : 'info'"
                  variant="subtle" size="xs">
                  {{ method }}
                </UBadge>
              </div>
            </div>
          </div>
          <div v-else class="flex flex-col items-center justify-center py-8 text-center">
            <UIcon name="i-lucide-shield-off" class="size-10 text-(--ui-text-muted) mb-2 opacity-40" />
            <p class="text-sm text-(--ui-text-muted)">Tidak ada modul akses</p>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Info Footer -->
    <UCard :ui="{ body: 'p-4' }">
      <div class="flex items-center gap-3 text-sm text-(--ui-text-muted)">
        <UIcon name="i-lucide-info" class="size-4 shrink-0" />
        <p>
          Login sebagai <strong class="text-(--ui-text-highlighted)">{{ user?.username }}</strong>
          &middot; ID: <code
            class="text-xs bg-(--ui-bg-elevated) px-1.5 py-0.5 rounded">{{ user?.iduser || '—' }}</code>
        </p>
      </div>
    </UCard>
  </div>
</template>
