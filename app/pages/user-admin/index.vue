<script setup>
const { getUsers, createUser } = useUserAdminApi()
const toast = useToast()

// State
const users = ref([])
const total = ref(0)
const loading = ref(true)

// Pagination & Filter
const page = ref(1)
const limit = ref(10)
const showMobileFilter = ref(false)
const filters = reactive({
  username: '',
  nama: '',
  status: 'all', // 'all' = semua, 'true' = aktif, 'false' = nonaktif
})

// Modal Create
const showCreateModal = ref(false)
const createForm = reactive({ username: '', nama: '' })
const createLoading = ref(false)
const fieldErrors = ref({})

// Fetch Data
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getUsers({
      page: page.value,
      limit: limit.value,
      username: filters.username || undefined,
      nama: filters.nama || undefined,
      status: filters.status !== 'all' ? filters.status : undefined,
    })

    users.value = res.data || []
    total.value = res.meta?.pagination?.total || 0
  } catch (err) {
    toast.add({
      title: 'Gagal memuat data',
      description: err.message,
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

// Watchers untuk auto-fetch saat pagination/filter berubah
watch([page, limit], () => {
  fetchData()
})

// Filter debounce function
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
  { accessorKey: 'nomor', header: 'No', size: 60 },
  { accessorKey: 'username', header: 'Username' },
  { accessorKey: 'nama', header: 'Nama' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'actions', header: 'Aksi', size: 100 },
]

// Handlers
const handleCreate = async () => {
  fieldErrors.value = {}
  if (!createForm.username) fieldErrors.value.username = 'Username wajib diisi'
  if (!createForm.nama) fieldErrors.value.nama = 'Nama wajib diisi'

  if (Object.keys(fieldErrors.value).length > 0) return

  createLoading.value = true
  try {
    await createUser(createForm)
    toast.add({
      title: 'Berhasil',
      description: 'User admin baru berhasil ditambahkan',
      color: 'success',
    })
    showCreateModal.value = false
    createForm.username = ''
    createForm.nama = ''
    fetchData()
  } catch (err) {
    if (err.errors) {
      fieldErrors.value = err.errors
    } else {
      toast.add({
        title: 'Gagal',
        description: err.message,
        color: 'error',
      })
    }
  } finally {
    createLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">

    <Head>
      <title>User Admin — Drama Admin</title>
    </Head>

    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-(--ui-text-highlighted)">Daftar User Admin</h1>
        <p class="text-(--ui-text-muted) text-sm mt-1">Kelola data pengguna panel admin.</p>
      </div>
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <UButton label="Filter" icon="i-lucide-filter" color="neutral" variant="outline" class="sm:hidden flex-1 justify-center" @click="showMobileFilter = !showMobileFilter" />
        <UButton label="Tambah User" icon="i-lucide-plus" @click="showCreateModal = true" color="secondary" class="flex-1 sm:flex-none justify-center"/>
      </div>
    </div>

    <!-- Filter Card -->
    <UCard :class="showMobileFilter ? 'block' : 'hidden sm:block'">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <UFormField label="Filter Username">
          <UInput v-model="filters.username" placeholder="Cari username..." icon="i-lucide-search"
            @input="onFilterChange" class="w-full" color="secondary"/>
        </UFormField>
        <UFormField label="Filter Nama">
          <UInput v-model="filters.nama" placeholder="Cari nama..." icon="i-lucide-search" @input="onFilterChange"
            class="w-full" color="secondary"/>
        </UFormField>
        <UFormField label="Filter Status">
          <USelect v-model="filters.status" :items="[
            { label: 'Semua Status', value: 'all' },
            { label: 'Aktif', value: 'true' },
            { label: 'Nonaktif', value: 'false' },
          ]" @change="onFilterChange" class="w-full" color="secondary"/>
        </UFormField>
      </div>
    </UCard>

    <!-- Table Card -->
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <UTable :data="users" :columns="columns" :loading="loading" class="w-full">
        <template #status-cell="{ row }">
          <UBadge :color="row.original.status ? 'success' : 'error'" variant="subtle" size="sm">
            {{ row.original.status ? 'Aktif' : 'Nonaktif' }}
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex gap-2">
            <UButton color="neutral" variant="ghost" icon="i-lucide-eye" size="sm" label="Lihat detail"
              :to="`/user-admin/${row.original._id}`" />
          </div>
        </template>

        <template #empty>
          <div class="py-12 flex flex-col items-center justify-center text-center">
            <UIcon name="i-lucide-users" class="size-12 text-(--ui-text-muted) mb-4 opacity-50" />
            <h3 class="text-lg font-medium text-(--ui-text-highlighted)">Tidak ada data user</h3>
            <p class="text-sm text-(--ui-text-muted) mt-1">Coba sesuaikan filter pencarian Anda.</p>
          </div>
        </template>
      </UTable>

      <!-- Pagination -->
      <div v-if="total > 0"
        class="border-t border-(--ui-border) p-4 flex items-center justify-between gap-2 flex-wrap">
        <div class="text-sm text-(--ui-text-muted)">
          Menampilkan <span class="font-medium text-(--ui-text-highlighted)">{{ users.length }}</span> dari <span
            class="font-medium text-(--ui-text-highlighted)">{{ total }}</span> user
        </div>
        <UPagination v-model:page="page" :total="total" :items-per-page="limit" :sibling-count="0" show-edges active-color="secondary"/>
      </div>
    </UCard>

    <!-- Modal Create User -->
    <UModal v-model:open="showCreateModal" title="Tambah User Baru">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-user-plus" class="size-5 text-secondary" />
              <h3 class="text-lg font-semibold text-(--ui-text-highlighted)">Tambah User Baru</h3>
            </div>
          </template>

          <form @submit.prevent="handleCreate" class="space-y-4">
            <UFormField label="Username" :error="fieldErrors.username">
              <UInput v-model="createForm.username" placeholder="Masukkan username" autofocus :disabled="createLoading" color="secondary"
                class="w-full" />
            </UFormField>

            <UFormField label="Nama Lengkap" :error="fieldErrors.nama">
              <UInput v-model="createForm.nama" placeholder="Masukkan nama lengkap" :disabled="createLoading" color="secondary"
                class="w-full" />
            </UFormField>

            <div class="flex justify-end gap-3 mt-6">
              <UButton label="Batal" color="neutral" variant="ghost" @click="showCreateModal = false"
                :disabled="createLoading" />
              <UButton type="submit" label="Simpan User" :loading="createLoading" color="secondary"/>
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
