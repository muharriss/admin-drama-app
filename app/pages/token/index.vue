<script setup>
const { getTokens, createToken, toggleTokenStatus, swapTokenOrder } = useTokenApi()
const toast = useToast()

// State
const tokens = ref([])
const loading = ref(true)

// Filter
const showMobileFilter = ref(false)
const filters = reactive({
  token: '',
  status: 'all',
  expired: 'all',
  sortby: 'order',
  sortorder: 'asc',
})

// Modal Create
const showCreateModal = ref(false)
const createForm = reactive({
  token: '',
  expiredAt: '',
  maxUse: 1000,
  order: 1,
})
const createLoading = ref(false)
const fieldErrors = ref({})

// Fetch Data
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getTokens({
      token: filters.token || undefined,
      status: filters.status !== 'all' ? filters.status : undefined,
      expired: filters.expired !== 'all' ? filters.expired : undefined,
      sortby: filters.sortby,
      sortorder: filters.sortorder,
    })

    tokens.value = res.data || []
  } catch (err) {
    toast.add({ title: 'Gagal memuat data', description: err.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

let filterTimeout
const onFilterChange = () => {
  clearTimeout(filterTimeout)
  filterTimeout = setTimeout(() => {
    fetchData()
  }, 500)
}

// Table columns
const columns = [
  { accessorKey: 'order', header: 'Urutan', size: 80 },
  { accessorKey: 'token', header: 'Token String' },
  { accessorKey: 'usage', header: 'Today Usage' },
  { accessorKey: 'expiredAt', header: 'Kedaluwarsa' },
  { accessorKey: 'status', header: 'Status Aktif' },
  { accessorKey: 'effectiveStatus', header: 'Efektif' },
  { accessorKey: 'actions', header: 'Aksi', size: 80 },
]

// Handlers
const handleCreate = async () => {
  fieldErrors.value = {}
  if (!createForm.token) fieldErrors.value.token = 'Token string wajib diisi'
  if (!createForm.expiredAt) fieldErrors.value.expiredAt = 'Tanggal expired wajib diisi'

  if (Object.keys(fieldErrors.value).length > 0) return

  createLoading.value = true
  try {
    const d = new Date(createForm.expiredAt)
    const formattedExpiredAt = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

    const payload = {
      ...createForm,
      expiredAt: formattedExpiredAt
    }
    await createToken(payload)
    toast.add({ title: 'Berhasil', description: 'Token berhasil ditambahkan', color: 'success' })
    showCreateModal.value = false

    // Reset
    createForm.token = ''
    createForm.expiredAt = ''
    createForm.maxUse = 1000
    createForm.order = 1

    fetchData()
  } catch (err) {
    if (err.errors) fieldErrors.value = err.errors
    else toast.add({ title: 'Gagal', description: err.message, color: 'error' })
  } finally {
    createLoading.value = false
  }
}

const handleToggleStatus = async (tokenRow) => {
  try {
    await toggleTokenStatus({ _id: tokenRow._id })
    toast.add({ title: 'Berhasil', description: `Status token diubah`, color: 'success' })
    fetchData()
  } catch (err) {
    toast.add({ title: 'Gagal', description: err.message, color: 'error' })
  }
}

const handleSwapOrder = async (firstId, secondId) => {
  if (!secondId) return
  try {
    await swapTokenOrder({ firstId, secondId })
    fetchData()
  } catch (err) {
    toast.add({ title: 'Gagal', description: err.message, color: 'error' })
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('id-ID', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// Generate default datetime (besok)
const setDefaultDate = () => {
  const tmr = new Date()
  tmr.setDate(tmr.getDate() + 30) // Default 30 hari ke depan
  tmr.setMinutes(tmr.getMinutes() - tmr.getTimezoneOffset())
  createForm.expiredAt = tmr.toISOString().slice(0, 16)
}

onMounted(() => {
  fetchData()
  setDefaultDate()
})
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">

    <Head>
      <title>Token Bisnis — Drama Admin</title>
    </Head>

    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-(--ui-text-highlighted)">Daftar Token Bisnis</h1>
        <p class="text-(--ui-text-muted) text-sm mt-1">Kelola API Token untuk diakses oleh client eksternal.</p>
      </div>
       <div class="flex items-center gap-2 w-full sm:w-auto">
         <UButton label="Filter" icon="i-lucide-filter" color="neutral" variant="outline" class="sm:hidden flex-1 justify-center" @click="showMobileFilter = !showMobileFilter" />
         <UButton label="Buat Token Baru" icon="i-lucide-plus" @click="showCreateModal = true" color="secondary" class="flex-1 sm:flex-none justify-center"/>
       </div>
    </div>

    <!-- Filter Card -->
    <UCard :class="showMobileFilter ? 'block' : 'hidden sm:block'">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <UFormField label="Cari Token">
          <UInput v-model="filters.token" placeholder="Token string..." icon="i-lucide-search" @input="onFilterChange"
            class="w-full" color="secondary"/>
        </UFormField>

        <UFormField label="Status Dasar">
          <USelect v-model="filters.status" :items="[
            { label: 'Semua', value: 'all' },
            { label: 'Aktif', value: 'true' },
            { label: 'Nonaktif', value: 'false' },
          ]" @change="onFilterChange" class="w-full" color="secondary"/>
        </UFormField>

        <UFormField label="Expired Status">
          <USelect v-model="filters.expired" :items="[
            { label: 'Semua', value: 'all' },
            { label: 'Belum Expired', value: 'false' },
            { label: 'Sudah Expired', value: 'true' },
          ]" @change="onFilterChange" class="w-full" color="secondary"/>
        </UFormField>

        <UFormField label="Sort By">
          <USelect v-model="filters.sortby" :items="[
            { label: 'Urutan Priority', value: 'order' },
            { label: 'Token String', value: 'token' },
            { label: 'Tanggal Expired', value: 'expiredAt' },
          ]" @change="onFilterChange" class="w-full" color="secondary"/>
        </UFormField>

        <UFormField label="Sort Order">
          <USelect v-model="filters.sortorder" :items="[
            { label: 'Ascending', value: 'asc' },
            { label: 'Descending', value: 'desc' },
          ]" @change="onFilterChange" class="w-full" color="secondary"/>
        </UFormField>
      </div>
    </UCard>

    <!-- Table Card -->
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <UTable :data="tokens" :columns="columns" :loading="loading" class="w-full">
        <!-- Urutan Cell -->
        <template #order-cell="{ row, rowIndex }">
          <div class="flex items-center gap-2">
            <span class="font-medium text-center w-6">{{ row.original.order }}</span>
            <div class="flex flex-col gap-0.5">
              <UButton icon="i-lucide-chevron-up" color="neutral" variant="ghost" size="xs" :padded="false"
                :disabled="rowIndex === 0" @click="handleSwapOrder(row.original._id, tokens[rowIndex - 1]?._id)" />
              <UButton icon="i-lucide-chevron-down" color="neutral" variant="ghost" size="xs" :padded="false"
                :disabled="rowIndex === tokens.length - 1"
                @click="handleSwapOrder(row.original._id, tokens[rowIndex + 1]?._id)" />
            </div>
          </div>
        </template>

        <!-- Token Cell -->
        <template #token-cell="{ row }">
          <div class="flex flex-col">
            <span class="font-mono font-medium text-secondary">{{ row.original.token }}</span>
            <span class="text-xs text-(--ui-text-muted)">ID: {{ row.original._id }}</span>
          </div>
        </template>

        <!-- Usage Cell -->
        <template #usage-cell="{ row }">
          <div class="flex flex-col gap-1">
            <UProgress :value="row.original.usageToday || 0" :max="row.original.maxUse || 1" size="sm"
              :color="row.original.isLimitReached ? 'error' : 'secondary'" />
            <span class="text-xs text-(--ui-text-muted)">
              {{ (row.original.usageToday || 0).toLocaleString() }} / {{ (row.original.maxUse || 0).toLocaleString() }}
              <span v-if="row.original.isLimitReached" class="text-red-500 font-medium">(Limit)</span>
            </span>
          </div>
        </template>

        <!-- Expired Cell -->
        <template #expiredAt-cell="{ row }">
          <div class="flex flex-col">
            <span :class="['text-sm', row.original.isExpired ? 'text-red-500 line-through' : '']">
              {{ formatDate(row.original.expiredAt) }}
            </span>
            <span v-if="row.original.isExpired" class="text-xs text-red-500 font-medium">Expired</span>
          </div>
        </template>

        <!-- Status Cell -->
        <template #status-cell="{ row }">
          <USwitch :model-value="row.original.status" color="secondary"
            @update:model-value="handleToggleStatus(row.original)" />
        </template>

        <!-- Effective Status Cell -->
        <template #effectiveStatus-cell="{ row }">
          <UBadge :color="row.original.effectiveStatus ? 'success' : 'error'" variant="subtle" size="sm">
            {{ row.original.effectiveStatus ? 'BISA DIPAKAI' : 'TIDAK BERLAKU' }}
          </UBadge>
        </template>

        <!-- Actions -->
        <template #actions-cell="{ row }">
          <UButton color="neutral" variant="ghost" icon="i-lucide-bar-chart-3" size="sm" label="Lihat detail"
            :to="`/token/${row.original._id}`" title="Lihat Detail & Usage" />
        </template>

        <template #empty>
          <div class="py-12 flex flex-col items-center justify-center text-center">
            <UIcon name="i-lucide-key-round" class="size-12 text-(--ui-text-muted) mb-4 opacity-50" />
            <h3 class="text-lg font-medium text-(--ui-text-highlighted)">Tidak ada data token</h3>
          </div>
        </template>
      </UTable>

      <div class="border-t border-(--ui-border) p-4">
        <p class="text-sm text-(--ui-text-muted)">Total Token: <strong>{{ tokens.length }}</strong></p>
      </div>
    </UCard>

    <!-- Create Modal -->
    <UModal v-model:open="showCreateModal" title="Buat Token Baru">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-(--ui-text-highlighted)">Buat Token Baru</h3>
          </template>

          <form @submit.prevent="handleCreate" class="space-y-4">
            <UFormField label="Token String" :error="fieldErrors.token" help="Hanya huruf/angka/underscore">
              <UInput v-model="createForm.token" placeholder="Misal: API_KEY_1" :disabled="createLoading" class="w-full"
                uppercase color="secondary"/>
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Batas Maksimal Penggunaan" :error="fieldErrors.maxUse">
                <UInput v-model.number="createForm.maxUse" type="number" :disabled="createLoading" class="w-full" color="secondary"/>
              </UFormField>

              <UFormField label="Urutan Prioritas" :error="fieldErrors.order">
                <UInput v-model.number="createForm.order" type="number" :disabled="createLoading" class="w-full" color="secondary"/>
              </UFormField>
            </div>

            <UFormField label="Batas Kedaluwarsa (Expired At)" :error="fieldErrors.expiredAt">
              <UInput v-model="createForm.expiredAt" type="datetime-local" :disabled="createLoading" class="w-full" color="secondary"/>
            </UFormField>

            <div class="flex justify-end gap-3 mt-6">
              <UButton label="Batal" color="neutral" variant="ghost" @click="showCreateModal = false"
                :disabled="createLoading" />
              <UButton type="submit" label="Simpan Token" :loading="createLoading" color="secondary" />
            </div>
          </form>
        </UCard>
      </template>
    </UModal>
    <NuxtLink to="/dashboard" class="flex lg:hidden justify-end items-center gap-1">
      <UIcon name="i-lucide-arrow-left" :size="20" />
      Ke dashboard
    </NuxtLink>
  </div>
</template>
