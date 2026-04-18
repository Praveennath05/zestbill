import axios from "axios";
// AUTH API (NO JWT REQUIRED)
  
const authApi = axios.create({
  baseURL: "http://localhost:5000/api/auth",
});

const appApi = axios.create({
  baseURL: "http://localhost:5000/api",
});

// JWT INTERCEPTOR
appApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// AUTH APIs

export const login = async (email, password) => {
  const res = await authApi.post("/login", { email, pwd: password });
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("user", JSON.stringify(res.data.user));
  return res.data;
};

export const register = async (email, password, image, mobile) => {
  const res = await authApi.post("/register", { email, pwd: password, image, mobile });
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("user", JSON.stringify(res.data.user));
  return res.data;
};

// Changed from mobile → email
export const forgotPassword = (email) =>
  authApi.post("/forgot-password", { email }).then((r) => r.data);

export const verifyOTP = (email, otp) =>
  authApi.post("/verify-otp", { email, otp }).then((r) => r.data);

export const resetPassword = (email, otp, newPassword) =>
  authApi.post("/reset-password", { email, otp, newPassword }).then((r) => r.data);

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// PRODUCT APIs

export const getProducts = async () => {
  const res = await appApi.get("/products");
  return res.data;
};

export const createProduct = async (product) => {
  const res = await appApi.post("/products", product);
  return res.data;
};

export const updateProduct = async (id, product) => {
  const res = await appApi.put(`/products/${id}`, product);
  return res.data;
};

export const deleteProduct = async (id) => {
  await appApi.delete(`/products/${id}`);
  return true;
};

// ORDER APIs

export const createOrder = async (orderData) => {
  const res = await appApi.post("/orders", orderData);
  return res.data;
};

export const getSalesSummary = async (range = "weekly") => {
  try {
    const res = await appApi.get(`/orders/sales?range=${range}`);
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      console.warn("Unauthorized – token expired or missing");
      logout();
      return { total: 0, buckets: [] };
    }
    throw err;
  }
};