import React, { useEffect, useState, useContext } from "react";
import { Box, Typography, Grid, Card, CardContent, CardMedia, Button, FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import http from "../http";
import dayjs from "dayjs";
import UserContext from "../contexts/UserContext";
import stepProgress from "../assets/Group 2.png"; // Your progress bar image
// import { toast } from "react-toastify"; // If you use react-toastify, uncomment

function Payment() {
  const [cartItems, setCartItems] = useState([]);
  const [userVouchers, setUserVouchers] = useState([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState("");
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [finalTotal, setFinalTotal] = useState(0);
  const { user } = useContext(UserContext);
  const userId = user ? user.id : null;
  const navigate = useNavigate();

  // Fetch cart items for the current user
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

  // Fetch available vouchers for the current user
  useEffect(() => {
    if (!userId) return;
    http
      .get(`/uservoucher/seemyvouchers?userId=${userId}`)
      .then((res) => {
        console.log("Fetched user vouchers:", res.data);
        setUserVouchers(res.data);
      })
      .catch((err) => console.error("Error fetching user vouchers:", err));
  }, [userId]);

  // Calculate the cart subtotal
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + Number(item.productSize.price) * Number(item.quantity),
    0
  );

  // Recalculate final total whenever the selected voucher or cart total changes
  useEffect(() => {
    if (selectedVoucherId) {
      const voucher = userVouchers.find((v) => v.id === selectedVoucherId);
      const discount = voucher ? Number(voucher.value) : 0;
      setFinalTotal(Math.max(totalPrice - discount, 0));
    } else {
      setFinalTotal(totalPrice);
    }
  }, [selectedVoucherId, totalPrice, userVouchers]);

  // Handler for voucher selection change (dropdown)
  const handleVoucherChange = (e) => {
    const newVoucherId = e.target.value;
    setSelectedVoucherId(newVoucherId);

    // Fill the input field with the selected voucher's code
    const selectedVoucher = userVouchers.find((v) => v.id === newVoucherId);
    if (selectedVoucher) {
      setVoucherCodeInput(selectedVoucher.code);
    } else {
      setVoucherCodeInput("");
    }
  };

  // Handler for manual voucher code input change
  const handleCodeInputChange = (e) => {
    setVoucherCodeInput(e.target.value);
  };

  // Handler for applying voucher code manually
  const handleApplyCode = () => {
    const matchedVoucher = userVouchers.find(
      (v) => v.code.toLowerCase() === voucherCodeInput.trim().toLowerCase()
    );
    if (matchedVoucher) {
      setSelectedVoucherId(matchedVoucher.id);
      // toast.success(`Voucher "${matchedVoucher.title}" applied!`);
      alert(`Voucher "${matchedVoucher.title}" applied!`);
    } else {
      alert("No voucher found with that code.");
    }
  };

  // When "Proceed to Shipping" is clicked, delete the applied voucher and navigate to shipping page
  const handleProceedToShipping = async () => {
    if (selectedVoucherId) {
      try {
        await http.delete(`/uservoucher/${selectedVoucherId}`);
      } catch (err) {
        console.error("Error deleting voucher:", err);
        // Optionally alert the user, but continue with navigation
      }
    }
    // Pass the finalTotal to the shipping page (you can adjust how you pass state)
    navigate("/shipping", { state: { finalTotal } });
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
                  {(
                    Number(item.productSize.price) * Number(item.quantity)
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
          <hr />
          <p style={{ margin: "0.5rem 0" }}>
            Cart Subtotal: ${totalPrice.toFixed(2)}
          </p>

          {/* Voucher selection dropdown */}
          {userVouchers.length > 0 && (
            <FormControl fullWidth style={{ marginBottom: "1rem" }}>
              <InputLabel id="voucher-select-label">Apply Voucher</InputLabel>
              <Select
                labelId="voucher-select-label"
                value={selectedVoucherId}
                onChange={handleVoucherChange}
                label="Apply Voucher"
              >
                <MenuItem value="">None</MenuItem>
                {userVouchers.map((voucher) => (
                  <MenuItem key={voucher.id} value={voucher.id}>
                    {voucher.title} - ${voucher.value} off
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Manual voucher code input */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Enter Voucher Code"
              value={voucherCodeInput}
              onChange={handleCodeInputChange}
            />
            <Button variant="contained" onClick={handleApplyCode} sx={{ mt: 1 }}>
              Apply Code
            </Button>
          </Box>

          {/* Display discount details if a voucher is applied */}
          {selectedVoucherId && (
            <p style={{ margin: "0.5rem 0" }}>
              Voucher Discount: $
              {userVouchers.find((v) => v.id === selectedVoucherId)?.value}
            </p>
          )}
          <hr />
          <p className="grand-total">S${finalTotal.toFixed(2)}</p>
          <button className="checkout-button" onClick={handleProceedToShipping}>
            Proceed to Shipping
          </button>
        </div>
      </div>
    </>
  );
}

export default Payment;
