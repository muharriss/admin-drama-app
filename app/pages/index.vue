<script setup>
/**
 * Index page — redirect ke dashboard
 */
definePageMeta({
  layout: false,
})

const { isLoggedIn } = useAuthState()

onMounted(() => {
  if (isLoggedIn.value) {
    navigateTo('/dashboard', { replace: true })
  } else {
    navigateTo('/login', { replace: true })
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-900">
    <UIcon name="i-lucide-loader-circle" class="size-8 text-secondary animate-spin" />
  </div>
</template>