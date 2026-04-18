import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function PaymentQR({ amount, orderId, onClose, userImage }) {
  const [loading, setLoading] = useState(true); // loader active initially
  const [showConfirm, setShowConfirm] = useState(true); // show yes/no

  const upiId = "aravindsiddharthp@oksbi";
  const name = "Hotel Cafe";

  const payload = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    name
  )}&am=${amount}&cu=INR&tn=Order%20${orderId}`;



 
  // Simulate loading when modal opens
  useEffect(() => {
    setLoading(true);
  }, []);

  return (
    
    <div
    
      className="qr-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="qr-card card"
        style={{
          textAlign: "center",
          background: "#020617",
          padding: "20px",
          borderRadius: "16px",
          color: "#fff",
          minWidth: "280px",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            fontSize: "16px",
            background: "transparent",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
          onClick={onClose}
          
        >
          
          ✕
        </button>
            
        <div className="qr-header">
          <p className="eyebrow">Pay via UPI</p>
          <h3>Amount: {amount > 0 ? `₹${amount}` : ""}</h3>
          <p className="muted">Order #{orderId}</p>
        </div>

        {/* Loader */}
      

        {/* Confirmation + QR */}
        {loading && showConfirm && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "15px",
              marginTop: "10px",
            }}
          >
            {/* {userImage && (
              <img
                key={userImage}
                src={
                  userImage.startsWith("http")
                    ? userImage
                    : `http://localhost:5000${userImage}`
                }
                alt="User"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            )} */}

            <QRCodeCanvas
              value={payload}
              size={220}
              level="H"
              fgColor="#ffffff"
              bgColor="#020617"
            />

            <p>Scan with GPay / PhonePe / Paytm</p>
          </div>
        )}
      </div>

      {/* Simple spinner CSS */}
      <style>
        {`
          .spinner {
            border: 4px solid rgba(255,255,255,0.2);
            border-top: 4px solid #4ade80;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}