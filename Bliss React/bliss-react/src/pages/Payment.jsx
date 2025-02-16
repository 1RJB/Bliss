import React, { useState, useEffect, useContext } from "react";
import "../styles/Cart.css"; // Reuse the same CSS
import UserContext from "../contexts/UserContext"; // Ensure this path is correct
import stepProgress from "../assets/Group 2.png"; // Your progress bar image

function Payment() {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useContext(UserContext);
  const userId = user ? user.id : null;

  useEffect(() => {
    if (!userId) return;
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart?userId=${userId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch cart data");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Fetched cart data:", data);
        setCartItems(data.cartItems || []);
      })
      .catch((err) => console.error("Error fetching cart:", err));
  }, [userId]);

  // Calculate total price using the product's price:
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + Number(item.product.price) * Number(item.quantity),
    0
  );

  const handleProceedToShipping = () => {
    // Handle form submission or navigation to shipping page
    alert("Proceeding to Shipping...");
  };

  return (
    <>
      {/* Top Section: Full-Width Progress Bar & Heading */}
      <div style={{ width: "100%", textAlign: "center", padding: "1rem 0" }}>
        <h2 style={{ marginBottom: "1rem" }}>Step 2 of 3: Payment</h2>
        <img
          src={stepProgress}
          alt="Checkout Steps"
          style={{ width: "100%", maxWidth: "800px" }}
        />
      </div>

      <div className="cart-page">
        {/* Left Section: Payment Info */}
        <div className="cart-main">
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>Payment Information</h3>
            {/* Credit/Debit Card Fields */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                maxWidth: "400px",
              }}
            >
              <input
                type="text"
                placeholder="Enter Card Number"
                style={{ padding: "0.5rem" }}
              />
              <input
                type="text"
                placeholder="Enter Expiration Date"
                style={{ padding: "0.5rem" }}
              />
              <input
                type="text"
                placeholder="Enter CVV"
                style={{ padding: "0.5rem" }}
              />
            </div>
          </div>
        </div>

        {/* Right Section: Order Summary */}
        <div className="cart-summary">
          <h3>Order Summary</h3>
          {cartItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <img
                src={`${import.meta.env.VITE_FILE_BASE_URL}${item.product.imageFile}`}
                alt={item.product.name}
                style={{
                  width: "60px",
                  height: "60px",
                  objectFit: "cover",
                  marginRight: "1rem",
                }}
              />
              <div style={{ flexGrow: 1 }}>
                <h4>{item.product.name}</h4>
                <p>{item.product.type}</p>
                <p>Quantity: {item.quantity}</p>
              </div>
              <div>
                <p>
                  $
                  {(Number(item.product.price) * Number(item.quantity)).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
          <hr />
          <p style={{ margin: "0.5rem 0" }}>
            Cart Subtotal: ${totalPrice.toFixed(2)}
          </p>
          
          <hr />
          <p className="grand-total">S${totalPrice.toFixed(2)}</p>
          <button className="checkout-button" onClick={handleProceedToShipping}>
            Proceed to Shipping
          </button>
        </div>
      </div>
    </>
  );
}

export default Payment;
