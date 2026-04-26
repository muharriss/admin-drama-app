<script setup>
const route = useRoute()
const router = useRouter()
const toast = useToast()
const { getProviderDetail, updateProvider, deleteProvider, toggleProviderStatus, toggleProviderDefault } = useProviderApi()

const providerId = route.params.id

// State
const provider = ref(null)
const loading = ref(true)

// Modals
const modals = reactive({
  edit: false,
  delete: false,
})

const loadingStates = reactive({
  edit: false,
  delete: false,
  toggle: false,
})

// Edit Form
const editForm = reactive({
  _id: '',
  nama: '',
  keterangan: '',
  icon: '',
  free: 1,
  urutan: 1,
})
const fieldErrors = ref({})

// Fetch
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getProviderDetail(providerId)
    provider.value = res.data

    if (provider.value) {
      Object.assign(editForm, {
        _id: provider.value._id,
        nama: provider.value.nama,
        keterangan: provider.value.keterangan || '',
        icon: provider.value.icon || '',
        free: provider.value.free,
        urutan: provider.value.urutan,
      })
    }
  } catch (err) {
    toast.add({ title: 'Gagal', description: err.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

// Actions
const handleEdit = async () => {
  fieldErrors.value = {}
  if (!editForm.nama) fieldErrors.value.nama = 'Nama wajib diisi'
  if (!editForm.urutan || editForm.urutan < 1) fieldErrors.value.urutan = 'Urutan minimal 1'

  if (Object.keys(fieldErrors.value).length > 0) return

  loadingStates.edit = true
  try {
    await updateProvider(editForm)
    toast.add({ title: 'Berhasil', description: 'Data provider diupdate', color: 'success' })
    modals.edit = false
    await fetchData()
  } catch (err) {
    if (err.errors) fieldErrors.value = err.errors
    else toast.add({ title: 'Gagal', description: err.message, color: 'error' })
  } finally {
    loadingStates.edit = false
  }
}

const handleDelete = async () => {
  loadingStates.delete = true
  try {
    await deleteProvider({ _id: providerId })
    toast.add({ title: 'Berhasil', description: 'Provider dihapus', color: 'success' })
    modals.delete = false
    router.push('/provider')
  } catch (err) {
    toast.add({ title: 'Gagal', description: err.message, color: 'error' })
  } finally {
    loadingStates.delete = false
  }
}

const handleToggleStatus = async () => {
  loadingStates.toggle = true
  try {
    await toggleProviderStatus({ _id: providerId })
    toast.add({ title: 'Berhasil', description: 'Status provider diubah', color: 'success' })
    await fetchData()
  } catch (err) {
    toast.add({ title: 'Gagal', description: err.message, color: 'error' })
  } finally {
    loadingStates.toggle = false
  }
}

const handleToggleDefault = async () => {
  loadingStates.toggle = true
  try {
    await toggleProviderDefault({ _id: providerId })
    toast.add({ title: 'Berhasil', description: 'Status default diubah', color: 'success' })
    await fetchData()
  } catch (err) {
    toast.add({ title: 'Gagal', description: err.message, color: 'error' })
  } finally {
    loadingStates.toggle = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-6">

    <Head>
      <title>Detail Provider — Drama Admin</title>
    </Head>

    <div class="flex items-center gap-3">
      <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" to="/provider" />
      <div>
        <h1 class="text-2xl font-bold text-(--ui-text-highlighted)">Detail Provider</h1>
        <p class="text-(--ui-text-muted) text-sm mt-0.5">Informasi lengkap data provider drama.</p>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <UIcon name="i-lucide-loader-circle" class="size-8 text-secondary animate-spin" />
    </div>

    <div v-else-if="provider" class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Kartu Profil Provider -->
      <div class="lg:col-span-1 space-y-6">
        <UCard :ui="{ body: 'text-center items-center flex flex-col pt-8' }">
          <UAvatar :src="provider.icon" :text="provider._id.substring(0, 2)" size="3xl"
            class="mb-4 shadow-lg ring-4 ring-(--ui-border)" :ui="{ root: 'bg-secondary/10 text-secondary' }" />
          <h2 class="text-xl font-bold text-(--ui-text-highlighted)">{{ provider.nama }}</h2>
          <p class="text-sm text-(--ui-text-muted) mt-1 font-mono bg-(--ui-bg-elevated) px-2 py-0.5 rounded">ID: {{
            provider._id }}</p>

          <div class="flex flex-wrap justify-center gap-2 mt-4">
            <UBadge :color="provider.status ? 'success' : 'error'" variant="subtle">
              {{ provider.status ? 'Aktif' : 'Nonaktif' }}
            </UBadge>
            <UBadge :color="provider.default ? 'secondary' : 'neutral'" variant="subtle">
              {{ provider.default ? 'Default' : 'Bukan Default' }}
            </UBadge>
            <UBadge color="info" variant="subtle">
              {{ provider.free }} Eps Gratis
            </UBadge>
          </div>

          <template #footer>
            <div class="grid grid-cols-2 gap-2">
              <UButton label="Edit Provider" icon="i-lucide-edit" color="secondary" variant="soft" block
                @click="modals.edit = true" />
              <UButton label="Hapus" icon="i-lucide-trash-2" color="error" variant="soft" block
                @click="modals.delete = true" />
            </div>
          </template>
        </UCard>

        <!-- Toggle Controls -->
        <UCard>
          <template #header>
            <span class="font-semibold text-(--ui-text-highlighted)">Kontrol Provider</span>
          </template>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-sm text-(--ui-text-highlighted)">Status Aktif</p>
                <p class="text-xs text-(--ui-text-muted)">Aktifkan untuk menampilkan provider ini.</p>
              </div>
              <USwitch :model-value="provider.status" color="secondary" :disabled="loadingStates.toggle"
                @update:model-value="handleToggleStatus" />
            </div>
            <USeparator />
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-sm text-(--ui-text-highlighted)">Provider Default</p>
                <p class="text-xs text-(--ui-text-muted)">Jadikan sebagai sumber data utama.</p>
              </div>
              <USwitch :model-value="provider.default" color="secondary" :disabled="loadingStates.toggle"
                @update:model-value="handleToggleDefault" />
            </div>
          </div>
        </UCard>
      </div>

      <!-- Detail Info -->
      <div class="lg:col-span-2 space-y-6">
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-info" class="size-5 text-secondary" />
              <span class="font-semibold text-(--ui-text-highlighted)">Informasi Detail</span>
            </div>
          </template>

          <div class="space-y-6">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-(--ui-text-muted) uppercase tracking-wide">Urutan Tampil</p>
                <p class="font-medium mt-1 text-lg">{{ provider.urutan }}</p>
              </div>
              <div>
                <p class="text-xs text-(--ui-text-muted) uppercase tracking-wide">Episode Gratis</p>
                <p class="font-medium mt-1 text-lg">{{ provider.free }} Episode</p>
              </div>
            </div>

            <USeparator />

            <div>
              <p class="text-xs text-(--ui-text-muted) uppercase tracking-wide">Keterangan</p>
              <div
                class="mt-2 bg-(--ui-bg-elevated) p-4 rounded-lg text-sm text-(--ui-text-highlighted) whitespace-pre-wrap min-h-[100px]">
                {{ provider.keterangan || 'Tidak ada deskripsi.' }}
              </div>
            </div>

            <div>
              <p class="text-xs text-(--ui-text-muted) uppercase tracking-wide">Icon URL</p>
              <div class="mt-2 flex items-center gap-2 bg-(--ui-bg-elevated) p-3 rounded-lg overflow-hidden">
                <UIcon name="i-lucide-link" class="size-4 text-(--ui-text-muted) shrink-0" />
                <a v-if="provider.icon" :href="provider.icon" target="_blank"
                  class="text-sm text-secondary hover:underline truncate">
                  {{ provider.icon }}
                </a>
                <span v-else class="text-sm text-(--ui-text-muted)">Belum diatur</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p class="text-xs text-(--ui-text-muted) uppercase tracking-wide mb-1">Dibuat Pada</p>
                <p class="text-sm">{{ provider.createdAt ? new Date(provider.createdAt).toLocaleString('id-ID') : '—' }}
                </p>
              </div>
              <div>
                <p class="text-xs text-(--ui-text-muted) uppercase tracking-wide mb-1">Update Terakhir</p>
                <p class="text-sm">{{ provider.updatedAt ? new Date(provider.updatedAt).toLocaleString('id-ID') : '—' }}
                </p>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Modals -->
    <UModal v-model:open="modals.edit" title="Edit Data Provider">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-(--ui-text-highlighted)">Edit Data Provider</h3>
          </template>

          <form @submit.prevent="handleEdit" class="space-y-4">
            <UFormField label="Kode Provider (ID)">
              <UInput v-model="editForm._id" disabled class="w-full" />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Nama Provider" :error="fieldErrors.nama">
                <UInput v-model="editForm.nama" placeholder="Nama..." :disabled="loadingStates.edit" class="w-full" color="secondary"/>
              </UFormField>

              <UFormField label="Urutan" :error="fieldErrors.urutan">
                <UInput v-model.number="editForm.urutan" type="number" min="1" :disabled="loadingStates.edit"
                  class="w-full" color="secondary"/>
              </UFormField>
            </div>

            <UFormField label="Keterangan" :error="fieldErrors.keterangan">
              <UTextarea v-model="editForm.keterangan" placeholder="Deskripsi..." autoresize
                :disabled="loadingStates.edit" class="w-full" color="secondary"/>
            </UFormField>

            <UFormField label="URL Icon" :error="fieldErrors.icon">
              <UInput v-model="editForm.icon" placeholder="https://..." :disabled="loadingStates.edit" class="w-full" color="secondary"/>
            </UFormField>

            <UFormField label="Jumlah Episode Gratis (Free)" :error="fieldErrors.free">
              <UInput type="number" v-model.number="editForm.free" placeholder="Jumlah episode..."
                :disabled="loadingStates.edit" class="w-full" color="secondary"/>
            </UFormField>

            <div class="flex justify-end gap-3 mt-6">
              <UButton label="Batal" color="neutral" variant="ghost" @click="modals.edit = false"
                :disabled="loadingStates.edit" />
              <UButton type="submit" label="Simpan Perubahan" :loading="loadingStates.edit" color="secondary"/>
            </div>
          </form>
        </UCard>
      </template>
    </UModal>

    <ConfirmDialog v-model="modals.delete" title="Hapus Provider?"
      description="Provider akan dihapus secara permanen beserta semua data yang terhubung. Apakah Anda yakin?"
      confirm-label="Ya, Hapus Provider" color="error" :loading="loadingStates.delete" @confirm="handleDelete" />
  </div>
</template>
