import axios from 'axios';

const instance = axios.create({
    // 不把 /api 写在 baseURL，写空或使用环境变量（但不要自动加 /api）
    baseURL: '',
    timeout: 10000,
});

// 请求拦截器：自动附加 token
instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 响应拦截器：直接返回 response（保持和你原来逻辑一致）
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default instance;
