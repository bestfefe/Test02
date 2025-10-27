<template>
  <a-card title="接口登录 Demo" :bordered="false" class="card">
    <div class="form">
      <a-input
          v-model="userId"
          class="userId"
          placeholder="请输入 UserID"
          allow-clear
      />
      <a-button
          type="primary"
          long
          class="login-btn"
          :loading="loading"
          @click="handleLogin"
      >
        登录
      </a-button>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import { useRouter } from 'vue-router';
import request from '@/utils/request';

const router = useRouter();
const userId = ref('');
const loading = ref(false);

const handleLogin = async () => {
  if (!userId.value) {
    Message.warning('请输入 UserID');
    return;
  }

  loading.value = true;
  try {
    const res = await request.post(
        `/api/userSystem/login?weChatUserId=${userId.value}`
    );
    if (res.data.success) {
      Message.success('登录成功');
      localStorage.setItem('token', res.data.data);
      router.push('/home');
    } else {
      Message.error(res.data.message || '登录失败');
    }
  } catch (err) {
    Message.error('请求失败，请检查网络或接口');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}
.userId {
  width: 300px;
}
.login-btn {
  width: 300px;
}
</style>
