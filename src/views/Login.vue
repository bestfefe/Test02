<template>
  <div class="login-page">
    <LoginForm/>
  </div>
</template>
<script setup lang="ts">
import LoginForm from '../components/Login/Login.vue';
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f6f8;
}
</style>