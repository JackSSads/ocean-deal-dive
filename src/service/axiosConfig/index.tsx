import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || "10000");
const API_RETRY_ATTEMPTS = parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || "3");

interface ApiError {
  message: string;
  status: number;
  code?: string;
};

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: {
    startTime: Date;
  };
  retry?: number;
  _retry?: boolean;
};

const API: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

API.interceptors.request.use(
  (config: ExtendedAxiosRequestConfig) => {
    config.metadata = { startTime: new Date() };
    
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    };
    
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
      });
    };
    
    return config;
  },
  (error: AxiosError) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response: AxiosResponse) => {
    const config = response.config as ExtendedAxiosRequestConfig;
    const duration = new Date().getTime() - (config.metadata?.startTime?.getTime() || 0);
    
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.status} ${response.config.url} (${duration}ms)`, {
        data: response.data,
        headers: response.headers,
      });
    };
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    console.error("❌ API Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
    });
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const newToken = refreshResponse.data.token;
          localStorage.setItem("token", newToken);
          
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return API(originalRequest);
        };
      } catch (refreshError) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("client");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      };
    };
    
    if (error.response?.status === 403) {
      console.error("Access forbidden - insufficient permissions");
    };
    
    if (error.response?.status === 404) {
      console.error("Resource not found");
    };
    
    if (error.response?.status >= 500) {
      console.error("Server error - please try again later");
    };
    
    const apiError: ApiError = {
      message: (error.response?.data as any)?.message || error.message || "An unexpected error occurred",
      status: error.response?.status || 0,
      code: error.code,
    };
    
    return Promise.reject(apiError);
  }
);

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;
    
    if (!config || !config.retry) {
      config.retry = 0;
    };
    
    if (config.retry >= API_RETRY_ATTEMPTS) {
      return Promise.reject(error);
    };
    
    config.retry += 1;
    
    if (error.code === "ECONNABORTED" || (error.response?.status >= 500 && error.response?.status < 600)) {
      console.log(`🔄 Retrying request (${config.retry}/${API_RETRY_ATTEMPTS}): ${config.url}`);
      
      const delay = Math.pow(2, config.retry) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return API(config);
    };
    
    return Promise.reject(error);
  }
);

export const apiUtils = {
  setAuthToken: (token: string) => {
    localStorage.setItem("token", token);
  },
  
  clearAuth: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("client");
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },
  
  getToken: (): string | null => {
    return localStorage.getItem("token");
  },
};

export { API };
export type { ApiError };
