import { Board, Column } from '@prisma/client';
import axios from 'axios';
import Cookies from 'js-cookie';
import { environment } from '../environments/environment.prod';
import { PausedState, StartState } from '@retro-tool/api-interfaces';

export type BoardWithColumn = Board & {
  columns: Column[];
  timer: null | StartState | PausedState;
};

export const apiClient = axios.create({
  baseURL: environment.apiUrl,
});

apiClient.interceptors.request.use(
  function (config) {
    const token = Cookies.get('impersonate_token') ?? Cookies.get('auth_token');
    if (token != null) {
      config.headers.Authorization = token;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

// Add a response interceptor
apiClient.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    // if (error.response?.data?.message) {
    //   toast.notify(error.response?.data?.message, { status: 'error' })
    // }
    return Promise.reject(error);
  },
);
