import axios from "axios";


const options = {
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
}

export const API = axios.create(options);


API.interceptors.response.use(
  async (response) => response.data,
  async (error) => {
    const { config, response } = error;
    const { status, data } = response || {};
    console.log(status, data?.errorCode, config)

    // if (status === 401 && data?.errorCode === "InvalidAccessToken") {
    //     console.log("frontend caught invalid token")
    //     return API(config)
    // }
    return Promise.reject({ status, ...data })
  }
);
