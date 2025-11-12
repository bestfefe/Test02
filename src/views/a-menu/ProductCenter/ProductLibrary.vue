<!-- views/BlankPage.vue -->
<template>
  <div>
    <h2>当前页面URL：{{ route.path }}</h2>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
const route = useRoute();
</script>

<style scoped>
h2 {
  color: black;
}
</style>