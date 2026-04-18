import { useState, useEffect } from "react";
import { logout } from "../api/api";

export default function MenuBar({ onLogout }) {
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  const handleLogout = () => {
    logout();
    onLogout();
  };

  if (!user) return null;

  return (
    <div style={{ position: "relative", marginLeft: "auto" }}>
      <button
        className="primary"
        onClick={() => setShowMenu(!showMenu)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 12px",
         
        }}
      >
        {user.image && (
          <img
            src={user.image.startsWith('http') ? user.image : `http://localhost:5000${user.image}`}
            alt={user.email}
            onError={(e) => {
              console.error("Failed to load user image:", user.image);
              e.target.style.display = 'none';
            }}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        )}
        <span>{user.email}</span>
        <span style={{ fontSize: "12px" }}>▼</span>
      </button>

      {showMenu && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 998,
            }}
            onClick={() => setShowMenu(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: "8px",
              background: "rgba(15, 23, 42, 0.95)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              padding: "12px",
              minWidth: "200px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
              zIndex: 999,
            }}
          >
            <div
              style={{
                padding: "8px 12px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                marginBottom: "8px",
              }}
            >
              <p
                style={{
                  margin: "0 0 4px",
                  color: "#94a3b8",
                  fontSize: "12px",
                }}
              >
                Signed in as
              </p>
              <p
                style={{
                  margin: 0,
                  color: "#e5e7eb",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                {user.email}
              </p>
            </div>
            <button
              className="ghost"
              onClick={handleLogout}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "8px 12px",
                color: "#f87171",
              }}
            >
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}








