import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Cart.css"; // Reuse your existing CSS
import UserContext from "../contexts/UserContext";
import stepProgress from "../assets/Group 3.png"; // Your shipping progress bar image

function Shipping() {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // Shipping form fields
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [shippingMethod, setShippingMethod] = useState("Standard");

  const { user } = useContext(UserContext);
  const userId = user ? user.id : null;
  const navigate = useNavigate();

  // Fetch cart items
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
        const items = data.cartItems || [];
        setCartItems(items);
      })
      .catch((err) => console.error("Error fetching cart:", err));
  }, [userId]);

  // Calculate total price
  useEffect(() => {
    const newTotal = cartItems.reduce((acc, item) => {
      const price = Number(item.productSize?.price) || Number(item.product.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return acc + price * quantity;
    }, 0);
    setTotalPrice(newTotal);
  }, [cartItems]);

  const handlePlaceOrder = () => {
    // In a real app, you'd send the shipping details & finalize the transaction
    console.log("Placing order with shipping info:", {
      addressLine1,
      addressLine2,
      zipCode,
      phoneNumber,
      shippingMethod
    });

    // Example: finalize transaction or navigate to a confirmation page
    // navigate("/confirmation");
    alert("Order placed successfully!");
  };

  return (
    <>
      {/* Top Section: Full-Width Progress Bar & Heading */}
      <div style={{ width: "100%", textAlign: "center", padding: "1rem 0" }}>
        <h2 style={{ marginBottom: "1rem" }}>Step 3 of 3: Enter Shipping Information</h2>
        <img
          src={stepProgress}
          alt="Checkout Steps"
          style={{ width: "100%", maxWidth: "800px" }}
        />
      </div>

      <div className="cart-page">
        {/* Left Section: Shipping Info */}
        <div className="cart-main">
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>Shipping Information</h3>
            {/* Shipping Form Fields */}
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
                placeholder="Enter Address Line 1"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                style={{ padding: "0.5rem" }}
              />
              <input
                type="text"
                placeholder="Enter Address Line 2 (Optional)"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                style={{ padding: "0.5rem" }}
              />
              <input
                type="text"
                placeholder="Enter ZipCode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                style={{ padding: "0.5rem" }}
              />
              <input
                type="text"
                placeholder="Enter Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={{ padding: "0.5rem" }}
              />
              <select
                style={{ padding: "0.5rem" }}
                value={shippingMethod}
                onChange={(e) => setShippingMethod(e.target.value)}
              >
                <option value="Standard">Standard Shipping</option>
                <option value="Express">Express Shipping</option>
              </select>
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
                {item.productSize && <p>Size: {item.productSize.size}ml</p>}
                <p>Quantity: {item.quantity}</p>
              </div>
              <div>
                <p>
                  $
                  {(
                    (Number(item.productSize?.price) || Number(item.product.price)) *
                    Number(item.quantity)
                  ).toFixed(2)}
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
          <button
            className="checkout-button"
            onClick={handlePlaceOrder}
            style={{ marginTop: "1rem" }}
          >
            Place Your Order
          </button>
        </div>
      </div>
    </>
  );
}

export default Shipping;
