import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserProvider } from './components/UserProvider';
import { ToastProvider } from './components/ToastProvider';
import axios from 'axios';

// 设置 baseURL
axios.defaults.baseURL = 'http://localhost:8080';

axios.defaults.headers.common['Authorization'] = localStorage.getItem('token') || '';
axios.defaults.headers.post['Content-Type'] = 'application/json';

// 添加请求拦截器（例如添加认证 token）
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 添加响应拦截器（例如处理全局错误）
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response.status === 401) {
            // 处理未授权错误
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

ReactDOM.render((
  <Router basename={process.env.PUBLIC_URL}>
    <ToastProvider>
      <UserProvider>
        <App/>
      </UserProvider>
    </ToastProvider>
  </Router>
), document.getElementById('root'));

