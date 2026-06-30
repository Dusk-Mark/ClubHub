<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { RouterView } from 'vue-router'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onBeforeMount(() => {
  void userStore.initializeAuth()
})
</script>
