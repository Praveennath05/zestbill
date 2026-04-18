import MenuBar from "./MenuBar.jsx";

export default function Layout({ children, onPrint, onClear, onPay, onLogout }) {
  return (
    <div className="page">
      <header className="topbar">
        <div>
          <h1 > HOTEL </h1>
          <h3>  </h3>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div className="actions">
            <button className="primary" onClick={onClear}>
              Clear cart
            </button>
            <button className="primary" onClick={onPrint}>
              Print bill
            </button>
          </div>
          <MenuBar onLogout={onLogout} />
        </div>
      </header>
      {children}
    </div>
  );
}



