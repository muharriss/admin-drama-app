<script setup>
definePageMeta({
  layout: 'auth',
})

const { login, getCaptcha } = useAuthApi()
const { setSession } = useAuthState()
const router = useRouter()
const toast = useToast()

// Form state
const form = reactive({
  username: '',
  password: '',
  hash: '',
  jawaban: '',
})

const loading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')
const fieldErrors = ref({})

// Captcha state
const captcha = reactive({
  gambar: '',
  hash: '',
  loading: false,
  active: false,
})

// Coba load captcha saat mount
onMounted(async () => {
  await loadCaptcha()
})

async function loadCaptcha() {
  captcha.loading = true
  try {
    const result = await getCaptcha()
    if (result.data?.gambar && result.data?.hash) {
      captcha.gambar = result.data.gambar
      captcha.hash = result.data.hash
      captcha.active = true
      form.hash = result.data.hash
    } else {
      captcha.active = false
    }
  } catch {
    // Captcha tidak aktif di backend, lanjutkan tanpa captcha
    captcha.active = false
  } finally {
    captcha.loading = false
  }
}

async function handleSubmit() {
  errorMessage.value = ''
  fieldErrors.value = {}

  // Validasi form sederhana
  if (!form.username.trim()) {
    fieldErrors.value.username = 'Username wajib diisi'
    return
  }
  if (!form.password.trim()) {
    fieldErrors.value.password = 'Password wajib diisi'
    return
  }
  if (captcha.active && !form.jawaban.trim()) {
    fieldErrors.value.jawaban = 'Jawaban captcha wajib diisi'
    return
  }

  loading.value = true

  try {
    const payload = {
      username: form.username.trim(),
      password: form.password,
    }

    if (captcha.active) {
      payload.hash = form.hash
      payload.jawaban = form.jawaban.trim()
    }

    const result = await login(payload)

    if (result.data?.token && result.data?.user) {
      setSession({
        token: result.data.token,
        user: {
          iduser: result.data.iduser,
          ...result.data.user,
        },
      })

      toast.add({
        title: 'Login Berhasil',
        description: `Selamat datang, ${result.data.user.nama}!`,
        icon: 'i-lucide-check-circle',
        color: 'success',
      })

      // Reset validasi state agar middleware re-check
      const validated = useState('auth_validated')
      validated.value = true

      await router.push('/dashboard')
    }
  } catch (err) {
    errorMessage.value = err.message || 'Login gagal, silakan coba lagi'

    if (err.errors) {
      fieldErrors.value = {}
      for (const [key, value] of Object.entries(err.errors)) {
        fieldErrors.value[key] = Array.isArray(value) ? value[0] : value
      }
    }

    // Refresh captcha jika error captcha
    if (captcha.active) {
      await loadCaptcha()
      form.jawaban = ''
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <Head>
      <title>Login — Drama Admin</title>
    </Head>

    <!-- Logo & Title -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center size-16 rounded-2xl bg-secondary/10 backdrop-blur mb-4 ring-1 ring-secondary/20 overflow-hidden">
        <!-- <UIcon name="i-lucide-clapperboard" class="size-8 text-secondary" /> -->
         <img src="/dramabarengicon.svg" alt="logo" >
      </div>
      <h1 class="text-2xl font-bold text-white">Drama Admin</h1>
      <p class="text-sm text-slate-400 mt-1">Masuk ke panel admin</p>
    </div>

    <!-- Login Card -->
    <UCard
      :ui="{
        // root: 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl',
        body: 'p-6 sm:p-8',
      }"
    >
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <!-- Error Alert -->
        <UAlert
          v-if="errorMessage"
          :title="errorMessage"
          color="error"
          icon="i-lucide-alert-circle"
          variant="subtle"
          :close-button="{ onClick: () => (errorMessage = '') }"
        />

        <!-- Username -->
        <UFormField label="Username" :error="fieldErrors.username" >
          <UInput
            color="secondary"
            v-model="form.username"
            id="input-username"
            placeholder="Masukkan username"
            icon="i-lucide-user"
            size="lg"
            autocomplete="username"
            :disabled="loading"
            class="w-full"
          />
        </UFormField>

        <!-- Password -->
        <UFormField label="Password" :error="fieldErrors.password">
          <UInput
            color="secondary"
            v-model="form.password"
            id="input-password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Masukkan password"
            icon="i-lucide-lock"
            size="lg"
            autocomplete="current-password"
            :disabled="loading"
            class="w-full"
          >
            <template #trailing>
              <UButton
                :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                color="neutral"
                variant="link"
                size="sm"
                :padded="false"
                @click="showPassword = !showPassword"
                tabindex="-1"
              />
            </template>
          </UInput>
        </UFormField>

        <!-- Captcha (jika aktif) -->
        <template v-if="captcha.active">
          <UFormField label="Captcha" >
            <div class="relative flex items-center gap-3">
              <div
                class="flex-1 bg-white border border-gray-300 rounded-lg p-2 flex items-center justify-center min-h-[50px]"
                v-html="captcha.gambar"
              />
              <UButton
                icon="i-lucide-refresh-cw"
                color="neutral"
                variant="ghost"
                size="sm"
                :loading="captcha.loading"
                @click="loadCaptcha"
                aria-label="Refresh captcha"
                class="absolute right-3 "
              />
            </div>
          </UFormField>

          <UFormField label="Jawaban Captcha" :error="fieldErrors.jawaban || fieldErrors.general" >
            <UInput
              color="secondary"
              v-model="form.jawaban"
              id="input-captcha"
              placeholder="Masukkan jawaban captcha"
              icon="i-lucide-shield-check"
              size="lg"
              :disabled="loading"
              class="w-full"
            />
          </UFormField>
        </template>

        <!-- General error (misal captcha expire) -->
        <p v-if="fieldErrors.general && !captcha.active" class="text-sm text-red-400">
          {{ fieldErrors.general }}
        </p>

        <!-- Submit -->
        <UButton
          color="secondary"
          type="submit"
          label="Masuk"
          icon="i-lucide-log-in"
          size="lg"
          block
          :loading="loading"
          :disabled="loading"
          class="mt-2"
        />
      </form>
    </UCard>

    <!-- Footer -->
    <!-- <p class="text-center text-xs text-slate-500 mt-6">
      &copy; {{ new Date().getFullYear() }} Drama Admin Panel
    </p> -->
  </div>
</template>
