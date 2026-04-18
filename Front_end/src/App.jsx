import { useState, useEffect } from "react";
import Layout from "./components/Layout.jsx";
import Login from "./components/Login.jsx";
import ProductGrid from "./components/ProductGrid.jsx";
import Cart from "./components/Cart.jsx";
import PaymentQR from "./components/PaymentQR.jsx";
import SalesReport from "./components/SalesReport.jsx";
import { useStore } from "./state/useStore.js";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // confirmation modal
  const [showQR, setShowQR] = useState(false); // QR modal
  const [orderMeta, setOrderMeta] = useState(null);

  const store = useStore();
  const {
    products,
    cart,
    totals,
    reports,
    reportRange,
    loading,
    addToCart,
    increment,
    decrement,
    clearCart,
    addProduct,
    editProduct,
    removeProduct,
    payNow,
    setReportRange,
  } = store;

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsAuthenticated(true);
  }, []);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  const handleLogout = () => setIsAuthenticated(false);

  // Step 1: Show confirmation modal
  const handlePay = () => setShowConfirm(true);

  // Step 2: User confirms payment
  const handleConfirmPayment = async () => {
    const order = await payNow();
    if (order) {
      setOrderMeta({
        id: order.id,
        amount: totals.total,
      });
      setShowQR(true);
    }
    setShowConfirm(false);
  };

  // Step 3: User cancels payment
  const handleCancelPayment = () => setShowConfirm(false);

  return (
    <Layout
      onPrint={() => window.print()}
      onClear={clearCart}
      onPay={handlePay}
      onLogout={handleLogout}
    >
      {loading && <p className="muted">Loading…</p>}

      <div className="two-col">
        <div className="col">
          <ProductGrid
            products={products}
            onAddToCart={addToCart}
            onCreate={addProduct}
            onUpdate={editProduct}
            onDelete={removeProduct}
          />
        </div>

        <div className="col">
          <div id="print-bill">
            <Cart
              items={cart}
              totals={totals}
              onIncrement={increment}
              onDecrement={decrement}
              onClear={clearCart}
              onPay={handlePay}
              onPrint={() => window.print()}
            />
          </div>
        </div>
      </div>

      <SalesReport
        daily={reports.daily}
        weekly={reports.weekly}
        monthly={reports.monthly}
        range={reportRange}
        onRangeChange={setReportRange}
      />

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="qr-overlay">
          <div className="qr-card card">
            <p className="eyebrow center">Are you sure you want to pay?</p>
            <div className="qr-buttons" style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "15px" }}>
              <button className="ok-btn" onClick={handleConfirmPayment}>
                Ok
              </button>
              <button className="cancel-btn" onClick={handleCancelPayment}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {loading && (
          <div style={{ margin: "20px 0" }}>
            <div className="spinner" />
            <p>Loading payment...</p>
          </div>
        )}

      {/* QR Modal */}
      {showQR && orderMeta && (
        <PaymentQR
          amount={orderMeta.amount}
          orderId={orderMeta.id}
          onClose={() => setShowQR(false)}
          userImage="/uploads/user123.jpg"
        />
      )}
    </Layout>
  );
}