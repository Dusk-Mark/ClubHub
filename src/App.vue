<template>
  <RouterView v-slot="{ Component, route }">
    <transition name="page-cinema" mode="out-in">
      <component :is="Component" :key="route.fullPath" />
    </transition>
  </RouterView>
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
