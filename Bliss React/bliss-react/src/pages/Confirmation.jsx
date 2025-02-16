import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../contexts/UserContext";
import "../styles/Confirmation.css"; // Updated CSS below
import tick from "../assets/check.png";

function Confirmation() {
  const [transaction, setTransaction] = useState(null);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const userId = user ? user.id : null;

  useEffect(() => {
    if (!userId) return;
    const url = `${import.meta.env.VITE_API_BASE_URL}/api/transaction/latest?userId=${userId}`;
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          return res.text().then((text) => {
            throw new Error(text);
          });
        }
        return res.json();
      })
      .then((data) => setTransaction(data))
      .catch((err) => console.error(err));
  }, [userId]);

  if (!transaction) {
    return <div className="loading">Loading receipt...</div>;
  }

  const items = transaction.transactionItems || [];
  const totalPrice = items.reduce((acc, item) => {
    const price = Number(item.priceAtPurchase) || 0;
    const quantity = Number(item.quantity) || 0;
    return acc + price * quantity;
  }, 0);

  return (
    <div className="confirmation-card">
      {/* Header */}
      <div className="confirmation-header">
        <img src={tick} alt="Success" className="confirmation-tick" />
        <h2>Thank you, {user?.name}!</h2>
        <p>A receipt has been sent to {user?.email}</p>
      </div>

      {/* Receipt Section */}
      <div className="receipt-section">
        <div className="receipt-items">
          {items.map((item) => {
            const lineTotal =
              (Number(item.priceAtPurchase) || 0) *
              (Number(item.quantity) || 0);
            return (
              <div key={item.id} className="receipt-item">
                <div className="item-info">
                  <img
                    src={`${import.meta.env.VITE_FILE_BASE_URL}${item.product.imageFile}`}
                    alt={item.product?.name}
                    className="item-image"
                  />
                  <div className="item-details">
                    <span className="item-name">{item.product?.name}</span>
                    <span className="item-type">
                      {item.product?.type}
                      {item.productSize ? ` | ${item.productSize.size}ml` : ""}
                    </span>
                    <span className="item-quantity">Qty: {item.quantity}</span>
                  </div>
                </div>
                <div className="item-price">
                  ${lineTotal.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
        <div className="receipt-total">
          <span>Total</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Back Button */}
      <button className="back-button" onClick={() => navigate("/")}>
        Back to Homepage
      </button>
    </div>
  );
}

export default Confirmation;
