<template>
  <div>
    <Child :msg="message"></Child>
  </div>
</template>

<script setup lang="ts">
import Child from '../components/Test/TestProps.vue'
const message = '你好，我是父组件传来的内容'
</script>