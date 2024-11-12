import axios, { AxiosResponse } from 'axios';
import { store } from '../stores/store';
import { WeatherForecast } from '../models/weatherForecast';

const protocol = window.location.protocol;

axios.defaults.baseURL = protocol === 'https:' ?  import.meta.env.VITE_API_URL : import.meta.env.VITE_API_URL_HTTP;

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

axios.interceptors.request.use((config) => {
  const token = store.userStore.token;
  console.log("Token:", token);
  if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Authorization Header Set:", config.headers.Authorization);
  }
  console.log("Axios Request Headers:", config.headers);
  return config;
});


  const requests = {
    get: <T>(url: string) => axios.get<T>(url).then(responseBody),
    post: <T>(url: string, body: {}) =>
      axios.post<T>(url, body).then(responseBody),
    put: <T>(url: string, body: {}) => axios.put<T>(url, body).then(responseBody),
    del: <T>(url: string) => axios.delete<T>(url).then(responseBody),
  };

  const WeatherForeCast = {
    list: () => requests.get<WeatherForecast[]>('/weatherForecast'),
  }

  const agent = {
    WeatherForeCast
  }

  
  export default agent;


