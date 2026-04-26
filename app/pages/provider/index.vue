<script setup>
const { getProviders, createProvider, toggleProviderStatus, toggleProviderDefault, swapProviderOrder } = useProviderApi()
const toast = useToast()

// State
const providers = ref([])
const total = ref(0)
const loading = ref(true)

// Pagination & Filter
const page = ref(1)
const limit = ref(10)
const filters = reactive({
  nama: '',
  keterangan: '',
  status: 'all',
  default: 'all',
  sortby: 'urutan', // default sort by urutan
  sortorder: 'asc',
})

// Modal Create
const showCreateModal = ref(false)
const createForm = reactive({
  _id: '',
  nama: '',
  keterangan: '',
  icon: '',
  free: 1,
  urutan: 1,
})
const createLoading = ref(false)
const fieldErrors = ref({})

// Fetch Data
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getProviders({
      page: page.value,
      limit: limit.value,
      nama: filters.nama || undefined,
      keterangan: filters.keterangan || undefined,
      status: filters.status !== 'all' ? filters.status : undefined,
      default: filters.default !== 'all' ? filters.default : undefined,
      sortby: filters.sortby,
      sortorder: filters.sortorder,
    })

    providers.value = res.data || []
    total.value = res.meta?.pagination?.total || 0
  } catch (err) {
    toast.add({ title: 'Gagal memuat data', description: err.message, color: 'error' })
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

// Table columns
const columns = [
  { accessorKey: 'icon', header: 'Icon', size: 60 },
  { accessorKey: '_id', header: 'Kode', size: 80 },
  { accessorKey: 'nama', header: 'Nama Provider' },
  { accessorKey: 'urutan', header: 'Urutan', size: 100 },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'default', header: 'Default' },
  { accessorKey: 'actions', header: 'Aksi', size: 100 },
]

// Actions
const handleCreate = async () => {
  fieldErrors.value = {}
  if (!createForm._id) fieldErrors.value._id = 'Kode ID wajib diisi'
  if (!createForm.nama) fieldErrors.value.nama = 'Nama wajib diisi'
  if (!createForm.urutan || createForm.urutan < 1) fieldErrors.value.urutan = 'Urutan minimal 1'

  if (providers.value.some(p => p.urutan === createForm.urutan)) {
    fieldErrors.value.urutan = 'Urutan ini sudah dipakai'
  }

  if (Object.keys(fieldErrors.value).length > 0) return

  createLoading.value = true
  try {
    await createProvider(createForm)
    toast.add({ title: 'Berhasil', description: 'Provider baru berhasil ditambahkan', color: 'success' })
    showCreateModal.value = false

    // Reset form
    Object.assign(createForm, {
      _id: '', nama: '', keterangan: '', icon: '', free: 1, urutan: 1
    })

    fetchData()
  } catch (err) {
    if (err.errors) fieldErrors.value = err.errors
    else toast.add({ title: 'Gagal', description: err.message, color: 'error' })
  } finally {
    createLoading.value = false
  }
}

// Toggle Actions
const handleToggleStatus = async (provider) => {
  try {
    await toggleProviderStatus({ _id: provider._id })
    provider.status = !provider.status // Optimistic update
    toast.add({ title: 'Berhasil', description: `Status ${provider.nama} diubah`, color: 'success' })
  } catch (err) {
    toast.add({ title: 'Gagal', description: err.message, color: 'error' })
    fetchData() // Revert if failed
  }
}

const handleToggleDefault = async (provider) => {
  try {
    await toggleProviderDefault({ _id: provider._id })
    fetchData() // Fetch ulang karena default mungkin mempengaruhi record lain
    toast.add({ title: 'Berhasil', description: `Default ${provider.nama} diubah`, color: 'success' })
  } catch (err) {
    toast.add({ title: 'Gagal', description: err.message, color: 'error' })
  }
}

// Swap Order
const handleSwapOrder = async (firstId, secondId) => {
  if (!secondId) return // Tidak bisa swap ke atas di baris pertama, dll.
  try {
    await swapProviderOrder({ firstId, secondId })
    toast.add({ title: 'Berhasil', description: 'Urutan berhasil ditukar', color: 'success' })
    fetchData()
  } catch (err) {
    toast.add({ title: 'Gagal', description: err.message, color: 'error' })
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">

    <Head>
      <title>Provider — Drama Admin</title>
    </Head>

    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-(--ui-text-highlighted)">Daftar Provider</h1>
        <p class="text-(--ui-text-muted) text-sm mt-1">Kelola sumber data drama dan urutannya.</p>
      </div>
      <UButton label="Tambah Provider" icon="i-lucide-plus" color="secondary"
        @click="() => { createForm.urutan = total + 1; showCreateModal = true }" />
    </div>

    <!-- Filters -->
    <UCard>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <UFormField label="Cari Nama">
          <UInput v-model="filters.nama" placeholder="Nama provider..." icon="i-lucide-search" @input="onFilterChange"
            class="w-full" color="secondary"/>
        </UFormField>

        <UFormField label="Status">
          <USelect v-model="filters.status" :items="[
            { label: 'Semua Status', value: 'all' },
            { label: 'Aktif', value: 'true' },
            { label: 'Nonaktif', value: 'false' },
          ]" @change="onFilterChange" class="w-full" color="secondary" />
        </UFormField>

        <UFormField label="Default">
          <USelect v-model="filters.default" :items="[
            { label: 'Semua Default', value: 'all' },
            { label: 'Ya', value: 'true' },
            { label: 'Tidak', value: 'false' },
          ]" @change="onFilterChange" class="w-full" color="secondary" />
        </UFormField>

        <UFormField label="Sort By">
          <USelect v-model="filters.sortby" :items="[
            { label: 'Urutan', value: 'urutan' },
            { label: 'Nama', value: 'nama' },
            { label: 'Tanggal Buat', value: 'createdAt' },
          ]" @change="onFilterChange" class="w-full" color="secondary" />
        </UFormField>

        <UFormField label="Sort Order">
          <USelect v-model="filters.sortorder" :items="[
            { label: 'Ascending', value: 'asc' },
            { label: 'Descending', value: 'desc' },
          ]" @change="onFilterChange" class="w-full" color="secondary" />
        </UFormField>
      </div>
    </UCard>

    <!-- Table -->
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <UTable :data="providers" :columns="columns" :loading="loading" class="w-full">
        <!-- Icon Cell -->
        <template #icon-cell="{ row }">
          <UAvatar v-if="row.original.icon" :src="row.original.icon" size="sm" :alt="row.original.nama" />
          <UAvatar v-else :text="row.original._id.substring(0, 2)" size="sm" color="secondary" />
        </template>

        <!-- Urutan Cell dengan fitur swap -->
        <template #urutan-cell="{ row }">
          <div class="flex items-center gap-2">
            <span class="font-medium text-center w-6">{{ row.original.urutan }}</span>
            <div class="flex flex-col gap-0.5">
              <UButton icon="i-lucide-chevron-up" color="neutral" variant="ghost" size="xs" :padded="false"
                :disabled="providers.findIndex(p => p._id === row.original._id) === 0 && page === 1"
                @click="handleSwapOrder(row.original._id, providers[providers.findIndex(p => p._id === row.original._id) - 1]?._id)" />
              <UButton icon="i-lucide-chevron-down" color="neutral" variant="ghost" size="xs" :padded="false"
                :disabled="providers.findIndex(p => p._id === row.original._id) === providers.length - 1"
                @click="handleSwapOrder(row.original._id, providers[providers.findIndex(p => p._id === row.original._id) + 1]?._id)" />
            </div>
          </div>
        </template>

        <!-- Status Cell Toggle -->
        <template #status-cell="{ row }">
          <USwitch :model-value="row.original.status" color="secondary"
            @update:model-value="handleToggleStatus(row.original)" />
        </template>

        <!-- Default Cell Toggle -->
        <template #default-cell="{ row }">
          <USwitch :model-value="row.original.default" color="secondary"
            @update:model-value="handleToggleDefault(row.original)" />
        </template>

        <!-- Actions -->
        <template #actions-cell="{ row }">
          <UButton color="neutral" variant="ghost" icon="i-lucide-eye" size="sm" label="Lihat detail"
            :to="`/provider/${row.original._id}`" />
        </template>

        <template #empty>
          <div class="py-12 flex flex-col items-center justify-center text-center">
            <UIcon name="i-lucide-building-2" class="size-12 text-(--ui-text-muted) mb-4 opacity-50" />
            <h3 class="text-lg font-medium text-(--ui-text-highlighted)">Tidak ada data provider</h3>
          </div>
        </template>
      </UTable>

      <div v-if="total > 0" class="border-t border-(--ui-border) p-4 flex items-center justify-between">
        <div class="text-sm text-(--ui-text-muted)">
          Total: <span class="font-medium text-(--ui-text-highlighted)">{{ total }}</span> provider
        </div>
        <UPagination v-model:page="page" :total="total" :items-per-page="limit" active-color="secondary"/>
      </div>
    </UCard>

    <!-- Create Modal -->
    <UModal v-model:open="showCreateModal" title="Tambah Provider Baru">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-(--ui-text-highlighted)">Tambah Provider Baru</h3>
          </template>

          <form @submit.prevent="handleCreate" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Kode Provider (ID)" :error="fieldErrors._id" help="Hanya huruf A-Z, max 5 karakter">
                <UInput v-model="createForm._id" placeholder="Misal: AB" :disabled="createLoading" class="w-full"
                  uppercase color="secondary" />
              </UFormField>

              <UFormField label="Urutan" :error="fieldErrors.urutan">
                <UInput v-model.number="createForm.urutan" type="number" min="1" :disabled="createLoading"
                  class="w-full" color="secondary" />
              </UFormField>
            </div>

            <UFormField label="Nama Provider" :error="fieldErrors.nama">
              <UInput v-model="createForm.nama" placeholder="Nama provider..." :disabled="createLoading"
                class="w-full" color="secondary" />
            </UFormField>

            <UFormField label="Keterangan" :error="fieldErrors.keterangan">
              <UTextarea v-model="createForm.keterangan" placeholder="Deskripsi..." autoresize :disabled="createLoading"
                class="w-full" color="secondary" />
            </UFormField>

            <UFormField label="URL Icon" :error="fieldErrors.icon">
              <UInput v-model="createForm.icon" placeholder="https://..." :disabled="createLoading" class="w-full" color="secondary" />
            </UFormField>

            <UFormField label="Jumlah Episode Gratis (Free)" :error="fieldErrors.free"
              help="Masukkan angka, contoh: 10">
              <UInput type="number" v-model.number="createForm.free" placeholder="Jumlah episode..."
                :disabled="createLoading" class="w-full" color="secondary" />
            </UFormField>

            <div class="flex justify-end gap-3 mt-6">
              <UButton label="Batal" color="neutral" variant="ghost" @click="showCreateModal = false"
                :disabled="createLoading" />
              <UButton type="submit" label="Simpan Provider" color="secondary" :loading="createLoading" />
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
