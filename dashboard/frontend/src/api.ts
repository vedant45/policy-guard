import axios from "axios";


export function getApi(token: string) {
  return axios.create({
    baseURL: "", // IMPORTANT
    headers: { Authorization: `Bearer ${token}` },
  });
}