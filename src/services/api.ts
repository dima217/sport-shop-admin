import axios, { AxiosError } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://84.201.188.209:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor для добавления токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Перенаправить на страницу входа
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

export default api;
