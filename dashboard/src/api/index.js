import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.1.41:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const login = (data) => api.post("/auth/login", data);
export const getPlans = () => api.get("/investments/plans");
export const getDashboard = () => api.get("/dashboard");
export const getInvestments = () => api.get("/investments");
export const createInvestment = (data) => api.post("/investments", data);
export const getROIHistory = (id) => api.get(`/investments/${id}/roi-history`);
export const getReferralIncome = () => api.get("/referrals/income");
export const getDirectReferrals = () => api.get("/referrals/direct");
export const getReferralTree = () => api.get("/referrals/tree");
export const runROIJob = () => api.post("/admin/run-roi-job");

export default api;
