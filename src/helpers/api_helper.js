
import axios from "axios";
import { getToken } from "./jwt-token-access/accessToken";

const token = getToken();

//apply base url for axios
// const API_URL = "http://localhost:8000/";
const API_URL = "https://microfin-backend-dot-thinktank-tms-dev-env.as.r.appspot.com/";

const axiosApi = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: token ?`Bearer ${token}` : null
  }
});

const axiosMediaApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Authorization": token ?`Bearer ${token}` : null,
    "Content-Type": "multipart/form-data",
  }
});


const axiosMediajson = axios.create({
  baseURL: API_URL,
  headers: {
    "Authorization": token ?`Bearer ${token}` : null,
    "Content-Type": "application/json",
  }
});


axiosApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error.response)
);

axiosMediaApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error.response)
);

export async function GET(url, config = {}) {
  return await axiosApi
    .get(url, { ...config })
    .then((response) => response)
    .catch((error) => error);
}

export async function POST(url, data, config = {}) {
  return axiosApi
    .post(url, { ...data }, { ...config })
    .then((response) => response)
    .catch((error) => error);
}

export async function PUT(url, data, config = {}) {
  return axiosApi
    .put(url, { ...data }, { ...config })
    .then((response) => response)
    .catch((error) => error);
}

export async function DELETE(url, config = {}) {
  return await axiosApi
    .delete(url, { ...config })
    .then((response) => response)
    .catch((error) => error);
}

export async function UPLOAD(url, data, config = {}) {
  return await axiosMediaApi
    .post(url, data)
    .then((response) => response)
    .catch((error) => error);
}
export async function UPLOAD_CERTIFCATE(url, data, config = {}) {
  return await axiosMediaApi
    .post(url, data)
    .then((response) => response)
    .catch((error) => error);
}
export async function CREATE_BRANCH(url, data, config = {}) {
  return await axiosMediajson
    .post(url, data)
    .then((response) => response)
    .catch((error) => error);
}
export async function GET_BRANCHES(url, config = {}) {
  return await axiosMediajson
    .get(url)
    .then((response) => response)
    .catch((error) => error);
}
export async function UPDATE_UPLOAD(url, data, config = {}) {
  return await axiosMediaApi
    .put(url, data)
    .then((response) => response)
    .catch((error) => error);
}

