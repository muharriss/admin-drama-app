<script setup>
const route = useRoute()
const router = useRouter()
const toast = useToast()
const { getTokenDetail, getTokenUsage, updateToken, deleteToken, toggleTokenStatus } = useTokenApi()

const tokenId = route.params.id

// State
const tokenData = ref(null)
const usageData = ref({ summary: { totalUsage: 0, totalDays: 0 }, dailyData: [] })
const loading = ref(true)
const usageLoading = ref(true)

// Date Range (Default: Last 30 days)
const defaultEnd = new Date()
const defaultStart = new Date()
defaultStart.setDate(defaultEnd.getDate() - 30)

const dateRange = reactive({
  startDate: defaultStart.toISOString().split('T')[0],
  endDate: defaultEnd.toISOString().split('T')[0],
})

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

const editForm = reactive({
  _id: '',
  token: '',
  expiredAt: '',
  maxUse: 1000,
  order: 1,
})
const fieldErrors = ref({})

// Fetch Detail
const fetchDetail = async () => {
  loading.value = true
  try {
    const res = await getTokenDetail(tokenId)
    tokenData.value = res.data

    if (tokenData.value) {
      Object.assign(editForm, {
        _id: tokenData.value._id,
        token: tokenData.value.token,
        expiredAt: tokenData.value.expiredAt ? new Date(tokenData.value.expiredAt).toISOString().slice(0, 16) : '',
        maxUse: tokenData.value.maxUse,
        order: tokenData.value.order,
      })
    }
  } catch (err) {
    toast.add({ title: 'Gagal memuat detail', description: err.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

// Fetch Usage
const fetchUsage = async () => {
  usageLoading.value = true
  try {
    const res = await getTokenUsage(tokenId, {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    })
    usageData.value = {
      dailyData: res.data || [],
      summary: res.meta?.summary || { totalUsage: 0, totalDays: 0 }
    }
  } catch (err) {
    toast.add({ title: 'Gagal memuat histori penggunaan', description: err.message, color: 'error' })
  } finally {
    usageLoading.value = false
  }
}

// Actions
const handleEdit = async () => {
  fieldErrors.value = {}
  if (!editForm.token) fieldErrors.value.token = 'Token string wajib diisi'
  if (!editForm.expiredAt) fieldErrors.value.expiredAt = 'Tanggal expired wajib diisi'

  if (Object.keys(fieldErrors.value).length > 0) return

  loadingStates.edit = true
  try {
    const payload = {
      ...editForm,
      expiredAt: new Date(editForm.expiredAt).toISOString()
    }
    await updateToken(payload)
    toast.add({ title: 'Berhasil', description: 'Data token diupdate', color: 'success' })
    modals.edit = false
    await fetchDetail()
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
    await deleteToken({ _id: tokenId })
    toast.add({ title: 'Berhasil', description: 'Token berhasil dihapus', color: 'success' })
    modals.delete = false
    router.push('/token')
  } catch (err) {
    toast.add({ title: 'Gagal', description: err.message, color: 'error' })
  } finally {
    loadingStates.delete = false
  }
}

const handleToggleStatus = async () => {
  loadingStates.toggle = true
  try {
    await toggleTokenStatus({ _id: tokenId })
    toast.add({ title: 'Berhasil', description: 'Status token diubah', color: 'success' })
    await fetchDetail()
  } catch (err) {
    toast.add({ title: 'Gagal', description: err.message, color: 'error' })
  } finally {
    loadingStates.toggle = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// Chart Helpers
const maxDailyUsage = computed(() => {
  if (!usageData.value.dailyData.length) return 1
  return Math.max(...usageData.value.dailyData.map(d => d.jumlah), 1)
})

const formatShortDate = (dateStr) => {
  const d = new Date(dateStr)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

onMounted(() => {
  fetchDetail()
  fetchUsage()
})
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-6">

    <Head>
      <title>Detail Token — Drama Admin</title>
    </Head>

    <div class="flex items-center gap-3">
      <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" to="/token" />
      <div>
        <h1 class="text-2xl font-bold text-(--ui-text-highlighted)">Detail & Penggunaan Token</h1>
        <p class="text-(--ui-text-muted) text-sm mt-0.5">Analisis histori dan status token bisnis.</p>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <UIcon name="i-lucide-loader-circle" class="size-8 text-secondary animate-spin" />
    </div>

    <div v-else-if="tokenData" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Info Kiri -->
      <div class="lg:col-span-1 space-y-6">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-semibold text-(--ui-text-highlighted)">Token Info</span>
              <UBadge :color="tokenData.effectiveStatus ? 'success' : 'error'" variant="subtle">
                {{ tokenData.effectiveStatus ? 'BISA DIPAKAI' : 'TIDAK BERLAKU' }}
              </UBadge>
            </div>
          </template>

          <div class="space-y-4">
            <div class="bg-(--ui-bg-elevated) p-3 rounded-lg border border-(--ui-border) text-center">
              <p class="text-xs text-(--ui-text-muted) uppercase mb-1">Token String</p>
              <p class="font-mono font-bold text-lg text-secondary break-all">{{ tokenData.token }}</p>
            </div>

            <USeparator />

            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-(--ui-text-muted) uppercase">Status Dasar</p>
                <div class="mt-1 flex items-center gap-2">
                  <USwitch :model-value="tokenData.status" color="secondary" size="sm" :disabled="loadingStates.toggle"
                    @update:model-value="handleToggleStatus" />
                  <span class="text-sm">{{ tokenData.status ? 'Aktif' : 'Nonaktif' }}</span>
                </div>
              </div>
              <div>
                <p class="text-xs text-(--ui-text-muted) uppercase">Urutan</p>
                <p class="font-medium mt-1">{{ tokenData.order }}</p>
              </div>
            </div>

            <USeparator />

            <div>
              <p class="text-xs text-(--ui-text-muted) uppercase mb-1">Penggunaan (Hari Ini)</p>
              <div class="flex items-center justify-between text-sm mb-1">
                <span>{{ (tokenData.usageToday || 0).toLocaleString() }} hits</span>
                <span class="text-(--ui-text-muted)">Max: {{ (tokenData.maxUse || 0).toLocaleString() }}</span>
              </div>
              <UProgress :value="tokenData.usageToday || 0" :max="tokenData.maxUse || 1" size="sm"
                :color="tokenData.isLimitReached ? 'error' : 'secondary'" />
              <p v-if="tokenData.isLimitReached" class="text-xs text-red-500 mt-1 font-medium">Limit usage tercapai!</p>
            </div>

            <USeparator />

            <div>
              <p class="text-xs text-(--ui-text-muted) uppercase mb-1">Waktu Kedaluwarsa</p>
              <p :class="['text-sm font-medium', tokenData.isExpired ? 'text-red-500' : '']">
                {{ formatDate(tokenData.expiredAt) }}
              </p>
              <p v-if="tokenData.isExpired" class="text-xs text-red-500 mt-0.5">Token sudah kedaluwarsa!</p>
            </div>
          </div>

          <template #footer>
            <div class="grid grid-cols-2 gap-2">
              <UButton label="Edit" icon="i-lucide-edit" color="secondary" variant="soft" block
                @click="modals.edit = true" />
              <UButton label="Hapus" icon="i-lucide-trash-2" color="error" variant="soft" block
                @click="modals.delete = true" />
            </div>
          </template>
        </UCard>
      </div>

      <!-- Kanan: Usage Chart -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Summary Cards -->
        <div class="grid grid-cols-2 gap-4">
          <UCard :ui="{ body: 'p-4 flex items-center gap-4' }">
            <div class="size-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
              <UIcon name="i-lucide-bar-chart" class="size-5 text-secondary" />
            </div>
            <div>
              <p class="text-xs text-(--ui-text-muted) uppercase">Total Hits (Filtered)</p>
              <p class="text-xl font-bold">{{ (usageData?.summary?.totalUsage || 0).toLocaleString() }}</p>
            </div>
          </UCard>

          <UCard :ui="{ body: 'p-4 flex items-center gap-4' }">
            <div class="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <UIcon name="i-lucide-calendar-days" class="size-5 text-emerald-500" />
            </div>
            <div>
              <p class="text-xs text-(--ui-text-muted) uppercase">Total Hari Aktif (Filtered)</p>
              <p class="text-xl font-bold">{{ usageData.summary.totalDays }} hari</p>
            </div>
          </UCard>
        </div>

        <!-- Chart Section -->
        <UCard :ui="{ body: 'p-4 sm:p-6' }">
          <template #header>
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-activity" class="size-5 text-secondary" />
                <span class="font-semibold text-(--ui-text-highlighted)">Grafik Penggunaan Harian</span>
              </div>
              <div class="flex items-center gap-2">
                <UInput type="date" v-model="dateRange.startDate" size="sm" @change="fetchUsage" />
                <span class="text-(--ui-text-muted)">-</span>
                <UInput type="date" v-model="dateRange.endDate" size="sm" @change="fetchUsage" />
              </div>
            </div>
          </template>

          <div v-if="usageLoading" class="h-[250px] flex items-center justify-center">
            <UIcon name="i-lucide-loader-circle" class="size-6 text-secondary animate-spin" />
          </div>

          <div v-else-if="usageData.dailyData.length > 0"
            class="h-[250px] flex gap-1.5 sm:gap-2  pb-6 overflow-x-auto overflow-y-hidden border-b border-(--ui-border) relative  ">
            <!-- Grid Lines Y -->
            <div class="absolute inset-0 pointer-events-none flex flex-col justify-between opacity-10">
              <div class="border-t border-white/50 w-full"></div>
              <div class="border-t border-white/50 w-full"></div>
              <div class="border-t border-white/50 w-full"></div>
              <div class="border-t border-white/50 w-full"></div>
            </div>

            <!-- Bars -->
            <div v-for="day in usageData.dailyData" :key="day.tanggal"
              class="relative flex-1 flex flex-col justify-end items-center group min-w-[20px] mt-10">
              <!-- Tooltip on hover -->
              <div
                class="absolute left-1/2 -translate-x-1/2 bg-(--ui-bg-elevated) border border-(--ui-border) px-2 py-1 rounded shadow-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"
                :style="{ bottom: `calc(${(day.jumlah / maxDailyUsage) * 100}% + 8px)` }">
                {{ formatShortDate(day.tanggal) }}: <strong class="text-secondary">{{ day.jumlah }}</strong>
              </div>

              <!-- Bar -->
              <div
                class="w-full max-w-[40px] bg-secondary/70 group-hover:bg-secondary rounded-t-sm transition-all duration-300"
                :style="{ height: `${(day.jumlah / maxDailyUsage) * 100}%`, minHeight: day.jumlah > 0 ? '4px' : '0' }">
              </div>

              <!-- Label X -->
              <span class="absolute -bottom-5 text-[10px] text-(--ui-text-muted) transform -rotate-45 whitespace-nowrap"
                v-if="usageData.dailyData.length <= 15 || usageData.dailyData.indexOf(day) % Math.ceil(usageData.dailyData.length / 10) === 0">
                {{ formatShortDate(day.tanggal) }}
              </span>
            </div>
          </div>

          <div v-else class="h-[250px] flex flex-col items-center justify-center text-center">
            <UIcon name="i-lucide-bar-chart-horizontal" class="size-10 text-(--ui-text-muted) mb-2 opacity-50" />
            <p class="text-(--ui-text-muted) text-sm">Tidak ada data penggunaan pada rentang tanggal ini.</p>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Modals -->
    <UModal v-model:open="modals.edit" title="Edit Data Token">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-(--ui-text-highlighted)">Edit Data Token</h3>
          </template>

          <form @submit.prevent="handleEdit" class="space-y-4">
            <UFormField label="Token String" :error="fieldErrors.token">
              <UInput v-model="editForm.token" placeholder="Misal: API_KEY_1" :disabled="loadingStates.edit"
                class="w-full" uppercase color="secondary"/>
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Batas Maksimal" :error="fieldErrors.maxUse">
                <UInput v-model.number="editForm.maxUse" type="number" :disabled="loadingStates.edit" class="w-full" color="secondary"/>
              </UFormField>

              <UFormField label="Urutan" :error="fieldErrors.order">
                <UInput v-model.number="editForm.order" type="number" :disabled="loadingStates.edit" class="w-full" color="secondary"/>
              </UFormField>
            </div>

            <UFormField label="Batas Kedaluwarsa (Expired At)" :error="fieldErrors.expiredAt">
              <UInput v-model="editForm.expiredAt" type="datetime-local" :disabled="loadingStates.edit"
                class="w-full" color="secondary"/>
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

    <ConfirmDialog v-model="modals.delete" title="Hapus Token?"
      description="Token akan dihapus beserta seluruh histori penggunaannya. Apakah Anda yakin?"
      confirm-label="Ya, Hapus Token" color="error" :loading="loadingStates.delete" @confirm="handleDelete" />
  </div>
</template>

<style scoped>
/* Utility untuk menyembunyikan scrollbar di chart namun tetap bisa discroll touch */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
