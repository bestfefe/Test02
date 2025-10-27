<template>
  <div class="home-page">
    <div>
      <h1>Home Page</h1>
    </div>
    <div>
      <Query/>
    </div>
  </div>
</template>

<script setup>
import Query from '@/components/Query/Query.vue';

</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>