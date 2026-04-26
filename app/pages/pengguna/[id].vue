<script setup>
const route = useRoute()
const { getPenggunaDetail, getHistory, getBookmarks, getUserWatchTime } = usePenggunaApi()
const toast = useToast()

const userId = route.params.id

// State
const pengguna = ref(null)
const loading = ref(true)

// Tabs State
const activeTab = ref('profil')
const tabs = [
  { id: 'profil', label: 'Profil Detail', icon: 'i-lucide-user' },
  { id: 'histori', label: 'Histori Nonton', icon: 'i-lucide-history' },
  { id: 'bookmark', label: 'Bookmark', icon: 'i-lucide-bookmark' },
  { id: 'watchtime', label: 'Watch Time', icon: 'i-lucide-clock' },
]

// Data States for Tabs
const historiData = ref([])
const historiTotal = ref(0)
const historiPage = ref(1)
const historiLoading = ref(false)

const bookmarkData = ref([])
const bookmarkTotal = ref(0)
const bookmarkPage = ref(1)
const bookmarkLoading = ref(false)

const watchtimeData = ref([])
const watchtimeTotal = ref(0)
const watchtimePage = ref(1)
const watchtimeLoading = ref(false)
const watchtimeTotalSeconds = ref(0)

// Fetch Profile
const fetchDetail = async () => {
  loading.value = true
  try {
    const res = await getPenggunaDetail(userId)
    pengguna.value = res.data
  } catch (err) {
    toast.add({ title: 'Gagal memuat profil', description: err.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

// Fetch Histori
const fetchHistori = async () => {
  historiLoading.value = true
  try {
    const res = await getHistory({ userId, page: historiPage.value, limit: 10 })
    historiData.value = res.data || []
    historiTotal.value = res.meta?.pagination?.total || 0
  } catch (err) {
    toast.add({ title: 'Gagal', description: err.message, color: 'error' })
  } finally {
    historiLoading.value = false
  }
}

// Fetch Bookmark
const fetchBookmark = async () => {
  bookmarkLoading.value = true
  try {
    const res = await getBookmarks({ userId, page: bookmarkPage.value, limit: 10 })
    bookmarkData.value = res.data || []
    bookmarkTotal.value = res.meta?.pagination?.total || 0
  } catch (err) {
    toast.add({ title: 'Gagal', description: err.message, color: 'error' })
  } finally {
    bookmarkLoading.value = false
  }
}

// Fetch Watch Time
const fetchWatchTime = async () => {
  watchtimeLoading.value = true
  try {
    const res = await getUserWatchTime(userId, { page: watchtimePage.value, limit: 10 })
    watchtimeData.value = res.data || []
    watchtimeTotal.value = res.meta?.pagination?.total || 0
    watchtimeTotalSeconds.value = res.meta?.summary?.totalSeconds || 0
  } catch (err) {
    toast.add({ title: 'Gagal', description: err.message, color: 'error' })
  } finally {
    watchtimeLoading.value = false
  }
}

// Watch Tab changes
watch(activeTab, (newTab) => {
  if (newTab === 'histori' && historiData.value.length === 0) fetchHistori()
  if (newTab === 'bookmark' && bookmarkData.value.length === 0) fetchBookmark()
  if (newTab === 'watchtime' && watchtimeData.value.length === 0) fetchWatchTime()
})

// Watch Pagination
watch(historiPage, fetchHistori)
watch(bookmarkPage, fetchBookmark)
watch(watchtimePage, fetchWatchTime)

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
const formatDate2 = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('id-ID', {
    year: 'numeric', month: 'long',
  })
}

const formatSeconds = (seconds) => {
  if (!seconds) return '0 mnt'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h} jam ${m} mnt`
  return `${m} mnt`
}

onMounted(() => {
  fetchDetail()
  fetchWatchTime()
})
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-6">

    <Head>
      <title>Detail Pengguna — Drama Admin</title>
    </Head>

    <div class="flex items-center gap-3">
      <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" to="/pengguna" />
      <div>
        <h1 class="text-2xl font-bold text-(--ui-text-highlighted)">Detail Pengguna</h1>
        <p class="text-(--ui-text-muted) text-sm mt-0.5">Informasi akun dan riwayat aktivitas.</p>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <UIcon name="i-lucide-loader-circle" class="size-8 text-secondary animate-spin" />
    </div>

    <div v-else-if="pengguna">
      <!-- Tabs Navigation -->
      <div class="flex overflow-x-auto hide-scrollbar gap-2 mb-6 border-b border-(--ui-border) pb-2">
        <UButton v-for="tab in tabs" :key="tab.id" :label="tab.label" :icon="tab.icon"
          :color="activeTab === tab.id ? 'secondary' : 'neutral'" :variant="activeTab === tab.id ? 'solid' : 'ghost'"
          @click="activeTab = tab.id" />
      </div>

      <!-- TAB: Profil -->
      <div v-if="activeTab === 'profil'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Card Kiri -->
        <UCard class="lg:col-span-1">
          <div class="flex flex-col items-center text-center py-6">
            <UAvatar :text="pengguna.nama ? pengguna.nama.substring(0, 2) : '?'" size="3xl"
              class="mb-4 shadow-lg ring-4 ring-(--ui-border)" :ui="{ root: 'bg-secondary/10 text-secondary' }" />
            <h2 class="text-xl font-bold text-(--ui-text-highlighted)">{{ pengguna.nama || 'Pengguna Tanpa Nama' }}</h2>
            <p class="text-sm text-(--ui-text-muted) mt-1 font-mono break-all">{{ pengguna._id }}</p>

            <div class="mt-4 flex flex-wrap justify-center gap-2">
              <UBadge
                :color="pengguna.sourcePlatform === 'android' ? 'success' : pengguna.sourcePlatform === 'telegram' ? 'info' : 'secondary'"
                variant="subtle">
                Platform: {{ pengguna.sourcePlatform || 'Unknown' }}
              </UBadge>
              <UBadge :color="pengguna.isLinked ? 'success' : 'neutral'" variant="subtle">
                {{ pengguna.isLinked ? 'Linked' : 'Not Linked' }}
              </UBadge>
            </div>
          </div>

          <USeparator />

          <div class="py-4 space-y-4">
            <div v-if="pengguna.email">
              <p class="text-xs text-(--ui-text-muted) uppercase">Email</p>
              <div class="flex items-center gap-2 mt-1">
                <UIcon name="i-lucide-mail" class="size-4 text-(--ui-text-muted)" />
                <span class="text-sm font-medium">{{ pengguna.email || '—' }}</span>
              </div>
            </div>
            <div v-if="pengguna.googleId">
              <p class="text-xs text-(--ui-text-muted) uppercase">Google ID</p>
              <div class="flex items-center gap-2 mt-1">
                <UIcon name="i-lucide-chrome" class="size-4 text-red-500" />
                <span class="text-sm font-medium">{{ pengguna.googleId || '-' }}</span>
              </div>
            </div>
            <div v-if="pengguna.telegramId">
              <p class="text-xs text-(--ui-text-muted) uppercase">Telegram ID</p>
              <div class="flex items-center gap-2 mt-1">
                <UIcon name="i-lucide-send" class="size-4 text-blue-500" />
                <span class="text-sm font-medium">{{ pengguna.telegramId || '-' }}</span>
              </div>
            </div>
            <USeparator />
            <div v-if="pengguna.isLinked">
              <div v-if="pengguna.linkedAccounts.android" class="space-y-4">
                <div>
                  <p class="text-xs text-(--ui-text-muted) uppercase">Email Terhubung</p>
                  <div class="flex items-center gap-2 mt-1">
                    <UIcon name="i-lucide-mail" class="size-4 text-(--ui-text-muted)" />
                    <span class="text-sm font-medium">{{ pengguna.linkedAccounts.android.email }}</span>
                    <UIcon name="i-lucide-link" class="size-4 text-green-500" />
                  </div>
                </div>
                <div>
                  <p class="text-xs text-(--ui-text-muted) uppercase">Google ID</p>
                  <div class="flex items-center gap-2 mt-1">
                    <UIcon name="i-lucide-chrome" class="size-4 text-red-500" />
                    <span class="text-sm font-medium">{{ pengguna.linkedAccounts.android.googleId || '-' }}</span>
                    <UIcon name="i-lucide-link" class="size-4 text-green-500" />
                  </div>
                </div>
              </div>
              <div v-else-if="pengguna.linkedAccounts.telegram">
                <p class="text-xs text-(--ui-text-muted) uppercase">Telegram ID</p>
                <div class="flex items-center gap-2 mt-1">
                  <UIcon name="i-lucide-send" class="size-4 text-blue-500" />
                  <span class="text-sm font-medium">{{ pengguna.linkedAccounts.telegram.telegramId }}</span>
                  <UIcon name="i-lucide-link" class="size-4 text-green-500" />
                </div>
              </div>
            </div>
            <div v-else>
              <div v-if="pengguna.hasTelegram">
                <p class="text-xs text-(--ui-text-muted) uppercase">Email</p>
                <div class="flex items-center gap-2 mt-1">
                  <UIcon name="i-lucide-mail" class="size-4 text-(--ui-text-muted)" />
                  <span class="text-sm font-medium">Tidak Terhubung</span>
                </div>
              </div>
              <div v-else-if="pengguna.hasGoogle">
                <p class="text-xs text-(--ui-text-muted) uppercase">Telegram ID</p>
                <div class="flex items-center gap-2 mt-1">
                  <UIcon name="i-lucide-send" class="size-4 text-blue-500" />
                  <span class="text-sm font-medium">Tidak Terhubung</span>
                </div>
              </div>
            </div>

          </div>
        </UCard>

        <!-- Card Kanan -->
        <UCard class="lg:col-span-2">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-info" class="size-5 text-secondary" />
              <h3 class="font-semibold text-(--ui-text-highlighted)">Informasi Pendaftaran & Preferensi</h3>
            </div>
          </template>

          <div class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p class="text-xs text-(--ui-text-muted) uppercase mb-1">Tanggal Pendaftaran</p>
                <p class="font-medium">{{ formatDate(pengguna.registeredAt) }}</p>
              </div>
              <div>
                <p class="text-xs text-(--ui-text-muted) uppercase mb-1">Tanggal Linked</p>
                <p class="font-medium">{{ formatDate(pengguna.linkedAt) }}</p>
              </div>
            </div>

            <!-- <USeparator /> -->

            <!-- Linked Accounts -->
            <!-- <div>
              <p class="text-xs text-(--ui-text-muted) uppercase mb-2">Status Akun Terhubung</p>
              <div class="bg-(--ui-bg-elevated) p-4 rounded-lg border border-(--ui-border)">
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div class="flex justify-between">
                    <span class="text-(--ui-text-muted)">Telegram:</span>
                    <UBadge :color="pengguna.hasTelegram ? 'success' : 'neutral'" variant="subtle" size="xs">
                      {{ pengguna.hasTelegram ? 'Terhubung' : 'Belum' }}
                    </UBadge>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-(--ui-text-muted)">Google:</span>
                    <UBadge :color="pengguna.hasGoogle ? 'success' : 'neutral'" variant="subtle" size="xs">
                      {{ pengguna.hasGoogle ? 'Terhubung' : 'Belum' }}
                    </UBadge>
                  </div>
                </div>
              </div>
            </div> -->

            <USeparator />

            <!-- Ringkasan Aktivitas -->
            <div>
              <p class="text-xs text-(--ui-text-muted) uppercase mb-2">Ringkasan Aktivitas</p>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div class="bg-(--ui-bg-elevated) p-3 rounded-lg border border-(--ui-border) text-center">
                  <p class="text-lg font-bold text-secondary">{{ pengguna.summary?.historyCount ?? 0 }}</p>
                  <p class="text-xs text-(--ui-text-muted)">Histori</p>
                </div>
                <div class="bg-(--ui-bg-elevated) p-3 rounded-lg border border-(--ui-border) text-center">
                  <p class="text-lg font-bold text-secondary">{{ pengguna.summary?.bookmarkCount ?? 0 }}</p>
                  <p class="text-xs text-(--ui-text-muted)">Bookmark</p>
                </div>
                <div
                  class="bg-(--ui-bg-elevated) p-3 rounded-lg border border-(--ui-border) text-center flex flex-col justify-center items-center">
                  <p class="text-sm font-bold text-secondary">{{ watchtimeTotalSeconds ?
                    formatSeconds(watchtimeTotalSeconds) : 0 }}
                  </p>
                  <p class="text-xs text-(--ui-text-muted)">Watch Time</p>
                </div>
              </div>
            </div>

            <div class="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex items-start gap-3">
              <UIcon name="i-lucide-info" class="size-5 text-blue-500 mt-0.5 shrink-0" />
              <p class="text-sm text-blue-500 dark:text-blue-400">
                Data pengguna bersifat read-only. Pengguna dikelola secara otomatis oleh sistem autentikasi di aplikasi
                client.
              </p>
            </div>
          </div>
        </UCard>
      </div>

      <!-- TAB: Histori -->
      <div v-else-if="activeTab === 'histori'" class="space-y-4">
        <UCard :ui="{ body: 'p-0 sm:p-0' }">
          <UTable :data="historiData" :loading="historiLoading" :columns="[
            { accessorKey: 'dramaTitle', header: 'Judul Drama' },
            { accessorKey: 'nomorEpisode', header: 'Episode' },
            { accessorKey: 'provider', header: 'Provider' },
            { accessorKey: 'platform', header: 'Platform' },
            { accessorKey: 'updatedAt', header: 'Waktu Nonton' }
          ]">
            <template #nomorEpisode-cell="{ row }">
              <UBadge color="secondary" variant="subtle" size="sm">Ep {{ row.original.nomorEpisode || '-' }}</UBadge>
            </template>
            <template #updatedAt-cell="{ row }">
              {{ formatDate(row.original.updatedAt) }}
            </template>
            <template #empty>
              <div class="py-12 flex flex-col items-center justify-center text-(--ui-text-muted)">
                <UIcon name="i-lucide-history" class="size-10 mb-2 opacity-50" />
                <p>Belum ada histori tontonan.</p>
              </div>
            </template>
          </UTable>
          <div v-if="historiTotal > 0" class="border-t border-(--ui-border) p-4 flex justify-between items-center">
            <span class="text-sm text-(--ui-text-muted)">Total: {{ historiTotal }} riwayat</span>
            <UPagination v-model:page="historiPage" :total="historiTotal" :items-per-page="10" active-color="secondary"/>
          </div>
        </UCard>
      </div>

      <!-- TAB: Bookmark -->
      <div v-else-if="activeTab === 'bookmark'" class="space-y-4">
        <UCard :ui="{ body: 'p-0 sm:p-0' }">
          <UTable :data="bookmarkData" :loading="bookmarkLoading" :columns="[
            { accessorKey: 'dramaTitle', header: 'Judul Drama' },
            { accessorKey: 'provider', header: 'Provider' },
            { accessorKey: 'platform', header: 'Platform' },
            { accessorKey: 'updatedAt', header: 'Ditambahkan' }
          ]">
            <template #updatedAt-cell="{ row }">
              {{ formatDate(row.original.updatedAt) }}
            </template>
            <template #empty>
              <div class="py-12 flex flex-col items-center justify-center text-(--ui-text-muted)">
                <UIcon name="i-lucide-bookmark" class="size-10 mb-2 opacity-50" />
                <p>Belum ada daftar bookmark.</p>
              </div>
            </template>
          </UTable>
          <div v-if="bookmarkTotal > 0" class="border-t border-(--ui-border) p-4 flex justify-between items-center">
            <span class="text-sm text-(--ui-text-muted)">Total: {{ bookmarkTotal }} bookmark</span>
            <UPagination v-model:page="bookmarkPage" :total="bookmarkTotal" :items-per-page="10" active-color="secondary"/>
          </div>
        </UCard>
      </div>

      <!-- TAB: Watch Time -->
      <div v-else-if="activeTab === 'watchtime'" class="space-y-4">
        <UCard :ui="{ body: 'p-0 sm:p-0' }">
          <UTable :data="watchtimeData" :loading="watchtimeLoading" :columns="[
            { accessorKey: 'year', header: 'Tahun' },
            { accessorKey: 'month', header: 'Bulan' },
            { accessorKey: 'platform', header: 'Platform' },
            { accessorKey: 'totalSeconds', header: 'Total Waktu Tonton' }
          ]">
            <template #month-cell="{ row }">
              {{ new Date(2000, row.original.month - 1, 1).toLocaleString('id-ID', { month: 'long' }) }}
            </template>
            <template #totalSeconds-cell="{ row }">
              <span class="font-medium text-secondary">{{ formatSeconds(row.original.totalSeconds) }}</span>
            </template>
            <template #empty>
              <div class="py-12 flex flex-col items-center justify-center text-(--ui-text-muted)">
                <UIcon name="i-lucide-clock" class="size-10 mb-2 opacity-50" />
                <p>Belum ada rekaman waktu tonton.</p>
              </div>
            </template>
          </UTable>
          <div v-if="watchtimeTotal > 0" class="border-t border-(--ui-border) p-4 flex justify-between items-center">
            <span class="text-sm text-(--ui-text-muted)">Total: {{ watchtimeTotal }} data</span>
            <UPagination v-model:page="watchtimePage" :total="watchtimeTotal" :items-per-page="10" active-color="secondary"/>
          </div>
        </UCard>
      </div>

    </div>
  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
