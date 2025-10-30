<template>
  <p>子组件接受到的数据是:{{msg}}</p>

</template>

<script setup lang="ts">
defineProps<{
  msg:string
    }>()
</script>