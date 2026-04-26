<script setup>
const { getPengguna } = usePenggunaApi()
const toast = useToast()

// State
const pengguna = ref([])
const total = ref(0)
const loading = ref(true)

// Pagination & Filter
const page = ref(1)
const limit = ref(10)
const filters = reactive({
  nama: '',
  email: '',
  telegramId: '',
  googleId: '',
  platform: 'all',
  linked: 'all',
  registeredStartDate: '',
  registeredEndDate: '',
  sortby: 'registeredAt',
  sortorder: 'desc',
})

// Modal Filter Tambahan
const showFilterModal = ref(false)

// Fetch Data
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getPengguna({
      page: page.value,
      limit: limit.value,
      nama: filters.nama || undefined,
      email: filters.email || undefined,
      telegramId: filters.telegramId || undefined,
      googleId: filters.googleId || undefined,
      platform: filters.platform !== 'all' ? filters.platform : undefined,
      linked: filters.linked !== 'all' ? filters.linked : undefined,
      registeredStartDate: filters.registeredStartDate || undefined,
      registeredEndDate: filters.registeredEndDate || undefined,
      sortby: filters.sortby,
      sortorder: filters.sortorder,
    })

    pengguna.value = res.data || []
    total.value = res.meta?.pagination?.total || 0
  } catch (err) {
    toast.add({ title: 'Gagal memuat data pengguna', description: err.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

// Watchers
watch([page, limit], () => {
  fetchData()
})

let filterTimeout
const onFilterChange = () => {
  clearTimeout(filterTimeout)
  filterTimeout = setTimeout(() => {
    page.value = 1
    fetchData()
  }, 500)
}

const applyAdvancedFilter = () => {
  showFilterModal.value = false
  page.value = 1
  fetchData()
}

const resetFilters = () => {
  filters.nama = ''
  filters.email = ''
  filters.telegramId = ''
  filters.googleId = ''
  filters.platform = 'all'
  filters.linked = 'all'
  filters.registeredStartDate = ''
  filters.registeredEndDate = ''
  filters.sortby = 'registeredAt'
  filters.sortorder = 'desc'
  applyAdvancedFilter()
}

// Table columns
const columns = [
  { accessorKey: 'nama', header: 'Pengguna' },
  { accessorKey: 'auth', header: 'Autentikasi' },
  { accessorKey: 'platform', header: 'Platform' },
  { accessorKey: 'registeredAt', header: 'Tanggal Daftar' },
  { accessorKey: 'actions', header: 'Aksi', size: 80 },
]

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('id-ID', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">

    <Head>
      <title>Pengguna Aplikasi — Drama Admin</title>
    </Head>

    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-(--ui-text-highlighted)">Daftar Pengguna</h1>
        <p class="text-(--ui-text-muted) text-sm mt-1">Data pengguna dari aplikasi klien (Read-only).</p>
      </div>
      <UButton label="Filter Lanjutan" icon="i-lucide-filter" color="neutral" variant="outline"
        @click="showFilterModal = true" />
    </div>

    <!-- Quick Filter -->
    <UCard>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <UFormField label="Cari Nama">
          <UInput v-model="filters.nama" placeholder="Ketik nama..." icon="i-lucide-search" @input="onFilterChange"
            class="w-full" color="secondary"/>
        </UFormField>

        <UFormField label="Platform">
          <USelect v-model="filters.platform" :items="[
            { label: 'Semua', value: 'all' },
            { label: 'Android', value: 'android' },
            { label: 'Telegram', value: 'telegram' },
          ]" @change="onFilterChange" class="w-full" color="secondary"/>
        </UFormField>

        <UFormField label="Sort By">
          <USelect v-model="filters.sortby" :items="[
            { label: 'Tanggal Daftar', value: 'registeredAt' },
            { label: 'Nama', value: 'nama' },
          ]" @change="onFilterChange" class="w-full" color="secondary"/>
        </UFormField>

        <UFormField label="Sort Order">
          <USelect v-model="filters.sortorder" :items="[
            { label: 'Descending', value: 'desc' },
            { label: 'Ascending', value: 'asc' },
          ]" @change="onFilterChange" class="w-full" color="secondary"/>
        </UFormField>
      </div>
    </UCard>

    <!-- Table -->
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <UTable :data="pengguna" :columns="columns" :loading="loading" class="w-full">
        <!-- Nama Cell -->
        <template #nama-cell="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar :src="row.original.photoUrl" :text="row.original.nama ? row.original.nama.substring(0, 2) : '?'"
              size="sm" />
            <div>
              <p class="font-medium text-(--ui-text-highlighted)">{{ row.original.nama || 'Tanpa Nama' }}</p>
              <p class="text-xs text-(--ui-text-muted)">ID: {{ row.original._id }}</p>
            </div>
          </div>
        </template>

        <!-- Auth Cell -->
        <template #auth-cell="{ row }">
          <div class="flex flex-col gap-1 text-sm">
            <div v-if="row.original.email" class="flex items-center gap-1.5">
              <UIcon name="i-lucide-mail" class="size-3.5 text-(--ui-text-muted)" />
              <span>{{ row.original.email }}</span>
            </div>
            <div v-if="row.original.telegramId" class="flex items-center gap-1.5">
              <UIcon name="i-lucide-send" class="size-3.5 text-blue-500" />
              <span>TG: {{ row.original.telegramId }}</span>
            </div>
            <div v-if="row.original.isLinked" class="flex items-center gap-1.5">
              <UIcon name="i-lucide-link" class="size-3.5 text-red-500" />
              <span>Linked</span>
            </div>
            <span v-if="!row.original.email && !row.original.telegramId && !row.original.googleId"
              class="text-(--ui-text-muted) italic">
              Guest
            </span>
          </div>
        </template>

        <!-- Platform Cell -->
        <template #platform-cell="{ row }">
          <UBadge
            :color="row.original.platform === 'android' ? 'success' : row.original.sourcePlatform === 'telegram' ? 'info' : 'secondary'"
            variant="subtle" size="sm">
            {{ row.original.sourcePlatform || 'Unknown' }}
          </UBadge>
        </template>

        <!-- Created At -->
        <template #registeredAt-cell="{ row }">
          <span class="text-sm">{{ formatDate(row.original.registeredAt) }}</span>
        </template>

        <!-- Actions -->
        <template #actions-cell="{ row }">
          <UButton color="neutral" variant="ghost" icon="i-lucide-eye" size="sm" :to="`/pengguna/${row.original._id}`" label="Lihat detail"
            title="Lihat Detail" />
        </template>

        <template #empty>
          <div class="py-12 flex flex-col items-center justify-center text-center">
            <UIcon name="i-lucide-users" class="size-12 text-(--ui-text-muted) mb-4 opacity-50" />
            <h3 class="text-lg font-medium text-(--ui-text-highlighted)">Tidak ada data pengguna</h3>
          </div>
        </template>
      </UTable>

      <div v-if="total > 0" class="border-t border-(--ui-border) p-4 flex items-center justify-between">
        <div class="text-sm text-(--ui-text-muted)">
          Total: <span class="font-medium text-(--ui-text-highlighted)">{{ total.toLocaleString() }}</span> pengguna
        </div>
        <UPagination v-model:page="page" :total="total" :items-per-page="limit" active-color="secondary"/>
      </div>
    </UCard>

    <!-- Modal Advanced Filter -->
    <UModal v-model:open="showFilterModal" title="Filter Lanjutan">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-filter" class="size-5 text-secondary" />
              <h3 class="text-lg font-semibold text-(--ui-text-highlighted)">Filter Lanjutan</h3>
            </div>
          </template>

          <div class="space-y-4">
            <UFormField label="Email">
              <UInput v-model="filters.email" placeholder="Cari email..." class="w-full" />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Telegram ID">
                <UInput v-model="filters.telegramId" placeholder="ID Telegram..." class="w-full" />
              </UFormField>
              <UFormField label="Google ID">
                <UInput v-model="filters.googleId" placeholder="ID Google..." class="w-full" />
              </UFormField>
            </div>

            <UFormField label="Status Akun (Linked)">
              <USelect v-model="filters.linked" :items="[
                { label: 'Semua', value: 'all' },
                { label: 'Terkoneksi', value: 'true' },
                { label: 'Tidak Terkoneksi', value: 'false' },
              ]" class="w-full" />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Daftar Mulai">
                <UInput type="date" v-model="filters.registeredStartDate" class="w-full" />
              </UFormField>
              <UFormField label="Daftar Sampai">
                <UInput type="date" v-model="filters.registeredEndDate" class="w-full" />
              </UFormField>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <UButton label="Reset Filter" color="error" variant="soft" @click="resetFilters" />
              <UButton label="Terapkan Filter" color="secondary" @click="applyAdvancedFilter" />
            </div>
          </div>
        </UCard>
      </template>
    </UModal>
    <NuxtLink to="/dashboard" class="flex lg:hidden justify-end items-center gap-1">
      <UIcon name="i-lucide-arrow-left" :size="20" />
      Ke dashboard
    </NuxtLink>
  </div>
</template>
