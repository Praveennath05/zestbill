import { useEffect, useMemo, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createOrder,
  getSalesSummary,
} from "../api/api";

const emptyCart = () => [];

export function useStore() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(emptyCart());
  const [loading, setLoading] = useState(false);

  const [reportRange, setReportRange] = useState("daily");

  const [reports, setReports] = useState({
    daily: { total: 0, buckets: [] },
    weekly: { total: 0, buckets: [] },
    monthly: { total: 0, buckets: [] },
  });

  const [lastOrder, setLastOrder] = useState(null);

  /* ================= LOAD ================= */

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    loadProducts();
    loadSalesReports();
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const items = await getProducts();

      // ✅ normalize Mongo _id → id
      setProducts(
        items.map((p) => ({
          ...p,
          id: p._id || p.id,
        }))
      );
    } finally {
      setLoading(false);
    }
  }

  /* ================= PRODUCTS ================= */

  async function addProduct(payload) {
    const created = await createProduct(payload);

    const normalized = {
      ...created,
      id: created._id || created.id,
    };

    setProducts((prev) => [normalized, ...prev]);
  }

  async function editProduct(id, payload) {
    const updated = await updateProduct(id, payload);

    const normalized = {
      ...updated,
      id: updated._id || updated.id,
    };

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? normalized : p))
    );
  }

  async function removeProduct(id) {
    await deleteProduct(id);

    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  /* ================= CART ================= */

  function addToCart(product) {
    const id = product.id || product._id;

    setCart((prev) => {
      const existing = prev.find((p) => p.id === id);

      if (existing) {
        return prev.map((p) =>
          p.id === id ? { ...p, qty: p.qty + 1 } : p
        );
      }

      return [
        ...prev,
        {
          id,
          name: product.name,
          price: Number(product.price),
          image: product.image,
          qty: 1,
        },
      ];
    });
  }

  function increment(id) {
    setCart((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, qty: p.qty + 1 } : p
      )
    );
  }

  function decrement(id) {
    setCart((prev) =>
      prev
        .map((p) =>
          p.id === id ? { ...p, qty: p.qty - 1 } : p
        )
        .filter((p) => p.qty > 0)
    );
  }

  function clearCart() {
    setCart(emptyCart());
  }

  /* ================= TOTALS ================= */

  const totals = useMemo(() => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    const tax = Math.round(subtotal * 0.05);

    return {
      subtotal,
      tax,
      total: subtotal + tax,
    };
  }, [cart]);

  /* ================= REPORTS ================= */

  async function loadSalesReports() {
    const [daily, weekly, monthly] = await Promise.all([
      getSalesSummary("daily"),
      getSalesSummary("weekly"),
      getSalesSummary("monthly"),
    ]);

    setReports({ daily, weekly, monthly });
  }

  /* ================= PAYMENT ================= */

  async function payNow() {
    if (!cart.length) return null;

    const order = await createOrder({
      items: cart,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
    });

    setLastOrder(order);
    setCart(emptyCart());
    await loadSalesReports();

    return order;
  }

  return {
    products,
    cart,
    totals,
    loading,

    reports,
    reportRange,
    setReportRange,

    lastOrder,

    addToCart,
    increment,
    decrement,
    clearCart,

    addProduct,
    editProduct,
    removeProduct,

    payNow,
  };
}
