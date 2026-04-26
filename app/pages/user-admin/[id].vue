<script setup>
const route = useRoute()
const router = useRouter()
const toast = useToast()
const { getUserDetail, getModules, updateUser, resetUserPassword, deleteUser, setUserAccess, deleteUserAccess } = useUserAdminApi()

const userId = route.params.id

// State
const user = ref(null)
const masterModules = ref([])
const loading = ref(true)

// Modals State
const modals = reactive({
  editUser: false,
  setAccess: false,
  deleteUser: false,
  resetPassword: false,
  deleteAccess: false,
})

const loadingStates = reactive({
  edit: false,
  access: false,
  delete: false,
  reset: false,
  deleteAccess: false,
})

// Forms
const editForm = reactive({ nama: '', username: '', status: 'true' })
const accessForm = reactive({ moduleId: '', methods: [] })
const accessToDelete = ref(null)
const methodOptions = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

// Load Data
const fetchData = async () => {
  loading.value = true
  try {
    const [detailRes, moduleRes] = await Promise.all([
      getUserDetail(userId),
      getModules().catch(() => ({ data: [] })) // Fallback jika gagal
    ])

    user.value = detailRes.data
    masterModules.value = moduleRes.data || []

    // Sync edit form
    if (user.value) {
      editForm.nama = user.value.nama
      editForm.username = user.value.username
      editForm.status = user.value.status ? 'true' : 'false'
    }
  } catch (err) {
    toast.add({ title: 'Gagal memuat data', description: err.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

// Actions
const handleEditUser = async () => {
  loadingStates.edit = true
  try {
    await updateUser({
      id: userId,
      nama: editForm.nama,
      username: editForm.username,
      status: editForm.status,
    })
    toast.add({ title: 'Berhasil', description: 'Data user berhasil diupdate', color: 'success' })
    modals.editUser = false
    await fetchData()
  } catch (err) {
    toast.add({ title: 'Gagal', description: err.message, color: 'error' })
  } finally {
    loadingStates.edit = false
  }
}

const handleResetPassword = async () => {
  loadingStates.reset = true
  try {
    await resetUserPassword({ id: userId })
    toast.add({ title: 'Berhasil', description: 'Password berhasil direset ke default', color: 'success' })
    modals.resetPassword = false
  } catch (err) {
    toast.add({ title: 'Gagal', description: err.message, color: 'error' })
  } finally {
    loadingStates.reset = false
  }
}

const handleDeleteUser = async () => {
  loadingStates.delete = true
  try {
    await deleteUser({ id: userId })
    toast.add({ title: 'Berhasil', description: 'User berhasil dihapus', color: 'success' })
    modals.deleteUser = false
    router.push('/user-admin')
  } catch (err) {
    toast.add({ title: 'Gagal', description: err.message, color: 'error' })
  } finally {
    loadingStates.delete = false
  }
}

// Access Actions
const openSetAccess = () => {
  accessForm.moduleId = ''
  accessForm.methods = []
  modals.setAccess = true
}

const handleSetAccess = async () => {
  if (!accessForm.moduleId || accessForm.methods.length === 0) {
    toast.add({ title: 'Validasi', description: 'Pilih modul dan minimal 1 method', color: 'warning' })
    return
  }

  loadingStates.access = true
  try {
    // API contract expects array of JSON strings
    const aksesData = JSON.stringify({
      id: accessForm.moduleId,
      method: accessForm.methods
    })

    await setUserAccess({
      id: userId,
      akses: [aksesData]
    })

    toast.add({ title: 'Berhasil', description: 'Akses modul berhasil ditambahkan', color: 'success' })
    modals.setAccess = false
    await fetchData()
  } catch (err) {
    toast.add({ title: 'Gagal', description: err.message, color: 'error' })
  } finally {
    loadingStates.access = false
  }
}

const confirmDeleteAccess = (modul) => {
  accessToDelete.value = modul
  modals.deleteAccess = true
}

const handleDeleteAccess = async () => {
  if (!accessToDelete.value) return

  loadingStates.deleteAccess = true
  try {
    await deleteUserAccess({
      id: userId,
      akses: accessToDelete.value._id
    })
    toast.add({ title: 'Berhasil', description: 'Akses modul berhasil dihapus', color: 'success' })
    modals.deleteAccess = false
    await fetchData()
  } catch (err) {
    toast.add({ title: 'Gagal', description: err.message, color: 'error' })
  } finally {
    loadingStates.deleteAccess = false
  }
}

// Computed
const availableModules = computed(() => {
  // Hanya tampilkan modul yang belum dimiliki user
  const userModules = user.value?.akses?.map(a => a._id) || []
  return masterModules.value.filter(m => !userModules.includes(m._id))
})

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-6">

    <Head>
      <title>Detail User — Drama Admin</title>
    </Head>

    <!-- Header / Breadcrumb -->
    <div class="flex items-center gap-3">
      <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" to="/user-admin" />
      <div>
        <h1 class="text-2xl font-bold text-(--ui-text-highlighted)">Detail User Admin</h1>
        <p class="text-(--ui-text-muted) text-sm mt-0.5">Informasi profil dan hak akses modul.</p>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <UIcon name="i-lucide-loader-circle" class="size-8 text-secondary animate-spin" />
    </div>

    <div v-else-if="user" class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Kolom Kiri: Info Profil -->
      <div class="space-y-6">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-semibold text-(--ui-text-highlighted)">Profil User</span>
              <UBadge :color="user.status ? 'success' : 'error'" variant="subtle">
                {{ user.status ? 'Aktif' : 'Nonaktif' }}
              </UBadge>
            </div>
          </template>

          <div class="space-y-4">
            <div>
              <p class="text-xs text-(--ui-text-muted) uppercase tracking-wide">ID User</p>
              <p class="font-mono text-sm mt-0.5">{{ user._id }}</p>
            </div>
            <USeparator />
            <div>
              <p class="text-xs text-(--ui-text-muted) uppercase tracking-wide">Username</p>
              <p class="font-medium mt-0.5 text-lg">{{ user.username }}</p>
            </div>
            <USeparator />
            <div>
              <p class="text-xs text-(--ui-text-muted) uppercase tracking-wide">Nama Lengkap</p>
              <p class="font-medium mt-0.5 text-lg">{{ user.nama }}</p>
            </div>
          </div>

          <template #footer>
            <div class="flex flex-col gap-2">
              <UButton label="Edit Profil" icon="i-lucide-edit" color="secondary" variant="soft" block
                @click="modals.editUser = true" />
              <UButton label="Reset Password" icon="i-lucide-key-round" color="warning" variant="soft" block
                @click="modals.resetPassword = true" />
              <UButton label="Hapus User" icon="i-lucide-trash-2" color="error" variant="soft" block
                @click="modals.deleteUser = true" />
            </div>
          </template>
        </UCard>
      </div>

      <!-- Kolom Kanan: Akses Modul -->
      <div class="lg:col-span-2">
        <UCard :ui="{ body: 'p-0 sm:p-0' }">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-shield-check" class="size-5 text-secondary" />
                <span class="font-semibold text-(--ui-text-highlighted)">Daftar Hak Akses</span>
              </div>
              <UButton label="Tambah Akses" icon="i-lucide-plus" size="sm" @click="openSetAccess" color="secondary"/>
            </div>
          </template>

          <!-- Table Hak Akses -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-(--ui-bg-elevated) border-b border-(--ui-border)">
                <tr>
                  <th class="px-4 py-3 font-medium">Modul</th>
                  <th class="px-4 py-3 font-medium">Keterangan</th>
                  <th class="px-4 py-3 font-medium">Methods</th>
                  <th class="px-4 py-3 w-16">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-(--ui-border)">
                <tr v-for="mod in user.akses" :key="mod._id" class="hover:bg-(--ui-bg-elevated)/50 transition-colors">
                  <td class="px-4 py-3">
                    <div class="font-medium text-(--ui-text-highlighted)">{{ mod.akses }}</div>
                    <div class="text-xs text-(--ui-text-muted)">ID: {{ mod._id }}</div>
                  </td>
                  <td class="px-4 py-3 text-(--ui-text-muted) whitespace-normal min-w-[200px]">
                    {{ mod.keterangan || '—' }}
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex flex-wrap gap-1">
                      <UBadge v-for="m in mod.method" :key="m"
                        :color="m === 'DELETE' ? 'error' : m === 'POST' ? 'success' : m === 'PUT' || m === 'PATCH' ? 'warning' : 'info'"
                        variant="subtle" size="xs">
                        {{ m }}
                      </UBadge>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="sm"
                      @click="confirmDeleteAccess(mod)" />
                  </td>
                </tr>
                <tr v-if="!user.akses || user.akses.length === 0">
                  <td colspan="4" class="px-4 py-8 text-center text-(--ui-text-muted)">
                    User belum memiliki akses ke modul manapun.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>
      </div>
    </div>

    <div v-else class="py-20 text-center">
      <UIcon name="i-lucide-user-x" class="size-12 text-(--ui-text-muted) mx-auto mb-4" />
      <h3 class="text-lg font-medium text-(--ui-text-highlighted)">User tidak ditemukan</h3>
      <UButton label="Kembali ke Daftar" color="secondary" variant="soft" class="mt-4" to="/user-admin" />
    </div>

    <!-- Modals -->

    <!-- Edit User Modal -->
    <UModal v-model:open="modals.editUser" title="Edit Profil User">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-(--ui-text-highlighted)">Edit Profil User</h3>
          </template>

          <form @submit.prevent="handleEditUser" class="space-y-4">
            <UFormField label="Username">
              <UInput v-model="editForm.username" disabled class="w-full"/>
              <template #help>Username tidak bisa diubah setelah dibuat.</template>
            </UFormField>

            <UFormField label="Nama Lengkap">
              <UInput v-model="editForm.nama" :disabled="loadingStates.edit" autofocus color="secondary" class="w-full"/>
            </UFormField>

            <UFormField label="Status Akun">
              <USelect v-model="editForm.status" color="secondary"
                :items="[{ label: 'Aktif', value: 'true' }, { label: 'Nonaktif', value: 'false' }]"
                :disabled="loadingStates.edit" class="w-full" />
            </UFormField>

            <div class="flex justify-end gap-3 mt-6">
              <UButton label="Batal" color="neutral" variant="ghost" @click="modals.editUser = false" />
              <UButton type="submit" label="Simpan Perubahan" :loading="loadingStates.edit" color="secondary"/>
            </div>
          </form>
        </UCard>
      </template>
    </UModal>

    <!-- Set Access Modal -->
    <UModal v-model:open="modals.setAccess" title="Tambah Akses Modul">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-(--ui-text-highlighted)">Tambah Hak Akses Modul</h3>
          </template>

          <form @submit.prevent="handleSetAccess" class="space-y-6">
            <UFormField label="Pilih Modul">
              <USelect v-model="accessForm.moduleId" color="secondary"
                :items="availableModules.map(m => ({ label: m.akses, value: m._id, description: m.keterangan }))"
                placeholder="Pilih modul..." class="w-full" />
            </UFormField>

            <UFormField label="Pilih Methods">
              <div class="grid grid-cols-2 gap-3 mt-2">
                <UCheckbox v-for="method in methodOptions" :key="method"
                  :model-value="accessForm.methods.includes(method)" @update:model-value="(val) => {
                    if (val) accessForm.methods.push(method);
                    else accessForm.methods = accessForm.methods.filter(m => m !== method);
                  }" :label="method"
                  :color="method === 'DELETE' ? 'error' : method === 'POST' ? 'success' : method === 'PUT' || method === 'PATCH' ? 'warning' : 'info'" />
              </div>
              <template #help>Minimal pilih satu method untuk modul yang dipilih.</template>
            </UFormField>

            <div class="flex justify-end gap-3 mt-6">
              <UButton label="Batal" color="neutral" variant="ghost" @click="modals.setAccess = false" />
              <UButton type="submit" label="Tambahkan Akses" :loading="loadingStates.access" color="secondary"/>
            </div>
          </form>
        </UCard>
      </template>
    </UModal>

    <!-- Confirm Dialogs -->
    <ConfirmDialog v-model="modals.resetPassword" title="Reset Password?"
      description="Password akan direset ke default. User harus login ulang. Lanjutkan?"
      confirm-label="Ya, Reset Password" color="warning" :loading="loadingStates.reset"
      @confirm="handleResetPassword" />

    <ConfirmDialog v-model="modals.deleteUser" title="Hapus User Admin?"
      description="Tindakan ini tidak dapat dibatalkan. User akan dihapus permanen. Lanjutkan?"
      confirm-label="Ya, Hapus User" color="error" :loading="loadingStates.delete" @confirm="handleDeleteUser" />

    <ConfirmDialog v-model="modals.deleteAccess" title="Hapus Akses Modul?"
      :description="`Apakah anda yakin ingin menghapus hak akses ke modul ${accessToDelete?.akses}?`"
      confirm-label="Ya, Hapus Akses" color="error" :loading="loadingStates.deleteAccess"
      @confirm="handleDeleteAccess" />
  </div>
</template>
