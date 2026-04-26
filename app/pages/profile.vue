<script setup>
const { getMe, changeName, changePassword, getLoginLogs, getActiveTokens, deleteActiveToken } = useAuthApi()
const { user, token: currentToken, userInitials } = useAuthState()
const toast = useToast()

// Tabs
const activeTab = ref('profil')
const tabs = [
  { id: 'profil', label: 'Pengaturan Profil', icon: 'i-lucide-user-cog' },
  { id: 'sessions', label: 'Sesi Login', icon: 'i-lucide-laptop' },
  { id: 'logs', label: 'Riwayat Login', icon: 'i-lucide-history' },
]

// Data States
const profileData = ref(null)
const profileLoading = ref(true)

const sessionsData = ref([])
const sessionsLoading = ref(false)

const logsData = ref([])
const logsTotal = ref(0)
const logsPage = ref(1)
const logsLoading = ref(false)

// Forms
const nameForm = reactive({ nama: '' })
const nameLoading = ref(false)

const passwordForm = reactive({ lama: '', baru: '', confirm: '' })
const passwordLoading = ref(false)
const pwdErrors = ref({})

// Fetch Profile
const fetchProfile = async () => {
  profileLoading.value = true
  try {
    const res = await getMe()
    profileData.value = res.data
    nameForm.nama = res.data.nama

    // Update global user state (opsional tapi baik untuk sinkronisasi header)
    if (user.value) {
      user.value.nama = res.data.nama
      user.value.akses = res.data.akses
    }
  } catch (err) {
    toast.add({ title: 'Gagal memuat profil', description: err.message, color: 'error' })
  } finally {
    profileLoading.value = false
  }
}

// Fetch Sessions
const fetchSessions = async () => {
  sessionsLoading.value = true
  try {
    const res = await getActiveTokens()
    sessionsData.value = res.data || []
  } catch (err) {
    toast.add({ title: 'Gagal', description: err.message, color: 'error' })
  } finally {
    sessionsLoading.value = false
  }
}

// Fetch Logs
const fetchLogs = async () => {
  logsLoading.value = true
  try {
    const res = await getLoginLogs({ page: logsPage.value, limit: 10, sortorder: 'DESC' })
    logsData.value = res.data || []
    logsTotal.value = res.meta?.pagination?.total || 0
  } catch (err) {
    toast.add({ title: 'Gagal', description: err.message, color: 'error' })
  } finally {
    logsLoading.value = false
  }
}

// Watch Tab
watch(activeTab, (newTab) => {
  if (newTab === 'sessions' && sessionsData.value.length === 0) fetchSessions()
  if (newTab === 'logs' && logsData.value.length === 0) fetchLogs()
})

// Watch Pagination
watch(logsPage, fetchLogs)

// Actions
const handleUpdateName = async () => {
  if (!nameForm.nama.trim()) return toast.add({ title: 'Nama tidak boleh kosong', color: 'error' })
  nameLoading.value = true
  try {
    await changeName({ nama: nameForm.nama })
    toast.add({ title: 'Berhasil', description: 'Nama profil diperbarui', color: 'success' })
    await fetchProfile()
  } catch (err) {
    toast.add({ title: 'Gagal', description: err.message, color: 'error' })
  } finally {
    nameLoading.value = false
  }
}

const handleUpdatePassword = async () => {
  pwdErrors.value = {}
  if (!passwordForm.lama) pwdErrors.value.lama = 'Password lama wajib diisi'
  if (!passwordForm.baru) pwdErrors.value.baru = 'Password baru wajib diisi'
  if (passwordForm.baru !== passwordForm.confirm) pwdErrors.value.confirm = 'Konfirmasi password tidak cocok'

  if (Object.keys(pwdErrors.value).length > 0) return

  passwordLoading.value = true
  try {
    await changePassword({ lama: passwordForm.lama, baru: passwordForm.baru })
    toast.add({ title: 'Berhasil', description: 'Password berhasil diganti', color: 'success' })
    passwordForm.lama = ''
    passwordForm.baru = ''
    passwordForm.confirm = ''
  } catch (err) {
    if (err.errors) pwdErrors.value = err.errors
    else toast.add({ title: 'Gagal', description: err.message, color: 'error' })
  } finally {
    passwordLoading.value = false
  }
}

const handleRevokeSession = async (tokenId) => {
  try {
    await deleteActiveToken(tokenId)
    toast.add({ title: 'Berhasil', description: 'Sesi dihentikan secara paksa', color: 'success' })
    fetchSessions()
  } catch (err) {
    toast.add({ title: 'Gagal mencabut sesi', description: err.message, color: 'error' })
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('id-ID', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

onMounted(() => {
  fetchProfile()
})
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">

    <Head>
      <title>Profil Saya — Drama Admin</title>
    </Head>

    <div>
      <h1 class="text-2xl font-bold text-(--ui-text-highlighted)">Profil Saya</h1>
      <p class="text-(--ui-text-muted) text-sm mt-1">Kelola data profil, keamanan, dan riwayat aktivitas Anda.</p>
    </div>

    <div v-if="profileLoading" class="flex justify-center py-20">
      <UIcon name="i-lucide-loader-circle" class="size-8 text-secondary animate-spin" />
    </div>

    <div v-else-if="profileData" class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Kolom Kiri: Header & Navigation -->
      <div class="lg:col-span-1 space-y-6">
        <UCard :ui="{ body: 'text-center items-center flex flex-col py-6' }">
          <UAvatar :text="userInitials" size="3xl" class="mb-4 shadow-lg ring-4 ring-(--ui-border)"
            :ui="{ root: 'bg-secondary/10 text-secondary' }" />
          <h2 class="text-xl font-bold text-(--ui-text-highlighted)">{{ profileData.nama }}</h2>
          <p class="text-sm text-(--ui-text-muted) mt-1 font-mono bg-(--ui-bg-elevated) px-2 py-0.5 rounded">
            @{{ profileData.username }}
          </p>
          <UBadge :color="(profileData.status === 'true' || profileData.status === true) ? 'success' : 'error'"
            variant="subtle" class="mt-4">
            {{ (profileData.status === 'true' || profileData.status === true) ? 'Akun Aktif' : 'Akun Nonaktif' }}
          </UBadge>
        </UCard>

        <!-- Vertical Tabs -->
        <UCard :ui="{ body: 'p-2' }">
          <div class="flex flex-col gap-1">
            <UButton v-for="tab in tabs" :key="tab.id" :label="tab.label" :icon="tab.icon"
              :color="activeTab === tab.id ? 'secondary' : 'neutral'" :variant="activeTab === tab.id ? 'soft' : 'ghost'"
              block class="justify-start" @click="activeTab = tab.id" />
          </div>
        </UCard>

        <!-- Hak Akses Summary -->
        <UCard>
          <template #header>
            <span class="font-semibold text-sm text-(--ui-text-highlighted) uppercase">Hak Akses Modul</span>
          </template>
          <div class="space-y-3">
            <div v-if="!profileData.akses || profileData.akses.length === 0"
              class="text-sm text-(--ui-text-muted) italic">
              Tidak ada akses modul.
            </div>
            <div v-for="mod in profileData.akses" :key="mod._id" class="flex flex-col gap-1">
              <span class="text-sm font-medium">{{ mod.keterangan || mod.akses }}</span>
              <div class="flex flex-wrap gap-1">
                <UBadge v-for="m in mod.method" :key="m"
                  :color="m === 'DELETE' ? 'error' : m === 'POST' ? 'success' : m === 'PUT' || m === 'PATCH' ? 'warning' : 'info'"
                  variant="subtle" size="xs">
                  {{ m }}
                </UBadge>
              </div>
              <USeparator class="mt-2" v-if="mod !== profileData.akses[profileData.akses.length - 1]" />
            </div>
          </div>
        </UCard>
      </div>

      <!-- Kolom Kanan: Main Content -->
      <div class="lg:col-span-3 space-y-6">

        <!-- Tab: Profil -->
        <div v-if="activeTab === 'profil'" class="space-y-6">
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-user" class="size-5 text-secondary" />
                <h3 class="font-semibold text-(--ui-text-highlighted)">Informasi Umum</h3>
              </div>
            </template>
            <form @submit.prevent="handleUpdateName" class="space-y-4 max-w-md">
              <UFormField label="Username">
                <UInput v-model="profileData.username" disabled icon="i-lucide-at-sign" class="w-full" />
              </UFormField>

              <UFormField label="Nama Lengkap">
                <UInput v-model="nameForm.nama" placeholder="Masukkan nama..." :disabled="nameLoading" class="w-full" color="secondary"/>
              </UFormField>

              <UButton type="submit" label="Simpan Profil" :loading="nameLoading" color="secondary"/>
            </form>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-lock" class="size-5 text-warning" />
                <h3 class="font-semibold text-(--ui-text-highlighted)">Ganti Password</h3>
              </div>
            </template>
            <form @submit.prevent="handleUpdatePassword" class="space-y-4 max-w-md">
              <UFormField label="Password Lama" :error="pwdErrors.lama">
                <UInput v-model="passwordForm.lama" type="password" placeholder="••••••••" :disabled="passwordLoading"
                  class="w-full" color="secondary"/>
              </UFormField>

              <UFormField label="Password Baru" :error="pwdErrors.baru">
                <UInput v-model="passwordForm.baru" type="password" placeholder="••••••••" :disabled="passwordLoading"
                  class="w-full" color="secondary"/>
              </UFormField>

              <UFormField label="Konfirmasi Password Baru" :error="pwdErrors.confirm">
                <UInput v-model="passwordForm.confirm" type="password" placeholder="••••••••"
                  :disabled="passwordLoading" class="w-full" color="secondary"/>
              </UFormField>

              <UButton type="submit" label="Perbarui Password" color="warning" :loading="passwordLoading" />
            </form>
          </UCard>
        </div>

        <!-- Tab: Sesi Login -->
        <div v-else-if="activeTab === 'sessions'">
          <UCard :ui="{ body: 'p-0 sm:p-0' }">
            <template #header>
              <div class="flex items-center gap-2 p-4 sm:p-6 pb-0 sm:pb-0">
                <UIcon name="i-lucide-laptop" class="size-5 text-secondary" />
                <h3 class="font-semibold text-(--ui-text-highlighted)">Sesi Login Aktif</h3>
              </div>
            </template>

            <UTable :data="sessionsData" :loading="sessionsLoading" :columns="[
              { accessorKey: 'device', header: 'Perangkat / IP' },
              { accessorKey: 'createdAt', header: 'Waktu Login' },
              { accessorKey: 'actions', header: 'Aksi', size: 100 }
            ]">
              <template #device-cell="{ row }">
                <div class="flex items-center gap-3 py-1">
                  <div class="size-8 rounded bg-(--ui-bg-elevated) flex items-center justify-center">
                    <UIcon name="i-lucide-monitor" class="size-4 text-(--ui-text-muted)" />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <p class="text-sm font-medium">{{ row.original.ip || 'Unknown IP' }}</p>
                      <UBadge v-if="row.original.isYou" color="success" size="xs" variant="subtle">Sesi Ini</UBadge>
                    </div>
                    <p class="text-xs text-(--ui-text-muted) truncate max-w-[200px]" :title="row.original.device">
                      {{ row.original.device || 'Unknown Device' }}
                    </p>
                  </div>
                </div>
              </template>
              <template #createdAt-cell="{ row }">
                <span class="text-sm">{{ formatDate(row.original.createdAt) }}</span>
              </template>
              <template #actions-cell="{ row }">
                <UButton v-if="!row.original.isYou" color="error" variant="ghost" size="sm" label="Cabut Akses"
                  @click="handleRevokeSession(row.original._id)" />
                <span v-else class="text-xs text-(--ui-text-muted) italic px-2">Sesi ini</span>
              </template>
              <template #empty>
                <div class="py-8 flex flex-col items-center justify-center text-(--ui-text-muted)">
                  <UIcon name="i-lucide-shield-off" class="size-8 mb-2 opacity-50" />
                  <p>Tidak ada sesi login lainnya.</p>
                </div>
              </template>
            </UTable>
          </UCard>
        </div>

        <!-- Tab: Riwayat Login -->
        <div v-else-if="activeTab === 'logs'">
          <UCard :ui="{ body: 'p-0 sm:p-0' }">
            <template #header>
              <div class="flex items-center gap-2 p-4 sm:p-6 pb-0 sm:pb-0">
                <UIcon name="i-lucide-history" class="size-5 text-secondary" />
                <h3 class="font-semibold text-(--ui-text-highlighted)">Riwayat Login Akun</h3>
              </div>
            </template>

            <UTable :data="logsData" :loading="logsLoading" :columns="[
              { accessorKey: 'device', header: 'Perangkat' },
              { accessorKey: 'ip', header: 'IP Address' },
              { accessorKey: 'keterangan', header: 'Keterangan' },
              { accessorKey: 'createdAt', header: 'Waktu' }
            ]">
              <template #device-cell="{ row }">
                <span class="font-medium text-sm">{{ row.original.device }}</span>
              </template>
              <template #ip-cell="{ row }">
                <span class="font-mono text-xs">{{ row.original.ip }}</span>
              </template>
              <template #keterangan-cell="{ row }">
                <span class="text-xs text-(--ui-text-muted) truncate max-w-[200px] block"
                  :title="row.original.keterangan">
                  {{ row.original.keterangan }}
                </span>
              </template>
              <template #createdAt-cell="{ row }">
                <span class="text-sm">{{ formatDate(row.original.waktulogin) }}</span>
              </template>
              <template #empty>
                <div class="py-8 flex flex-col items-center justify-center text-(--ui-text-muted)">
                  <UIcon name="i-lucide-history" class="size-8 mb-2 opacity-50" />
                  <p>Belum ada log login.</p>
                </div>
              </template>
            </UTable>
            <div v-if="logsTotal > 0" class="border-t border-(--ui-border) p-4 flex justify-between items-center">
              <span class="text-sm text-(--ui-text-muted)">Total: {{ logsTotal }} riwayat</span>
              <UPagination v-model:page="logsPage" :total="logsTotal" :items-per-page="10" active-color="secondary"/>
            </div>
          </UCard>
        </div>

      </div>
    </div>
  </div>
</template>
