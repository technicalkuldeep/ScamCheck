import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

export const analyzeAddress = async (address) => {
  const { data } = await api.post("/analyze", { address });
  return data;
};

export const analyzeWallet = async (address) => {
  const { data } = await api.post("/analyze-wallet", { address });
  return data;
};

export const analyzeToken = async (address) => {
  const { data } = await api.post("/analyze-token", { address });
  return data;
};

export const getRecentScans = async () => {
  const { data } = await api.get("/recent-scans", { params: { limit: 8 } });
  return data;
};
