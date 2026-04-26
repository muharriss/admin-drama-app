<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Konfirmasi',
  },
  description: {
    type: String,
    default: 'Apakah anda yakin ingin melanjutkan?',
  },
  confirmLabel: {
    type: String,
    default: 'Ya, Lanjutkan',
  },
  cancelLabel: {
    type: String,
    default: 'Batal',
  },
  color: {
    type: String,
    default: 'secondary',
  },
  icon: {
    type: String,
    default: 'i-lucide-alert-triangle',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

function onConfirm() {
  emit('confirm')
}

function onCancel() {
  isOpen.value = false
  emit('cancel')
}
</script>

<template>
  <UModal v-model:open="isOpen" prevent-close>
    <template #content>
      <UCard :ui="{ body: 'p-6 sm:p-8' }">
        <div class="flex items-start gap-4">
          <div :class="`shrink-0 size-12 rounded-full bg-${color}/10 flex items-center justify-center`">
            <UIcon :name="icon" :class="`size-6 text-${color}`" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-(--ui-text-highlighted)">{{ title }}</h3>
            <p class="mt-2 text-sm text-(--ui-text-muted)">{{ description }}</p>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton :label="cancelLabel" color="neutral" variant="ghost" @click="onCancel" :disabled="loading" />
            <UButton :label="confirmLabel" :color="color" @click="onConfirm" :loading="loading" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
