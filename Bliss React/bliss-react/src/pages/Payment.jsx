import React, { useEffect, useState, useContext } from "react";
import { Box, Typography, TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LockIcon from '@mui/icons-material/Lock';
import http from "../http";
import UserContext from "../contexts/UserContext";
import stepProgress from "../assets/Group 2.png";

function Payment() {
  // Cart and user state
  const [cartItems, setCartItems] = useState([]);
  const { user } = useContext(UserContext);
  const userId = user ? user.id : null;
  const navigate = useNavigate();

  // Payment form state
  const [cardNumber, setCardNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [cvv, setCvv] = useState("");

  // Voucher state
  const [userVouchers, setUserVouchers] = useState([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState("");
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [finalTotal, setFinalTotal] = useState(0);

  // Fetch cart items
  useEffect(() => {
    if (!userId) return;
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart?userId=${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch cart data");
        return res.json();
      })
      .then((data) => {
        console.log("Fetched cart data:", data);
        setCartItems(data.cartItems || []);
      })
      .catch((err) => console.error("Error fetching cart:", err));
  }, [userId]);

  // Fetch user vouchers
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

  // Calculate total price
  const totalPrice = cartItems.reduce((acc, item) => {
    const price = Number(item.productSize?.price) || Number(item.product.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return acc + price * quantity;
  }, 0);

  // Update final total when voucher changes
  useEffect(() => {
    if (selectedVoucherId) {
      const voucher = userVouchers.find((v) => v.id === selectedVoucherId);
      const discount = voucher ? Number(voucher.value) : 0;
      setFinalTotal(Math.max(totalPrice - discount, 0));
    } else {
      setFinalTotal(totalPrice);
    }
  }, [selectedVoucherId, totalPrice, userVouchers]);

  // Voucher handlers
  const handleVoucherChange = (e) => {
    const newVoucherId = e.target.value;
    setSelectedVoucherId(newVoucherId);
    const selectedVoucher = userVouchers.find((v) => v.id === newVoucherId);
    setVoucherCodeInput(selectedVoucher ? selectedVoucher.code : "");
  };

  const handleCodeInputChange = (e) => {
    setVoucherCodeInput(e.target.value);
  };

  const handleApplyCode = () => {
    const matchedVoucher = userVouchers.find(
      (v) => v.code.toLowerCase() === voucherCodeInput.trim().toLowerCase()
    );
    if (matchedVoucher) {
      setSelectedVoucherId(matchedVoucher.id);
      alert(`Voucher "${matchedVoucher.title}" applied!`);
    } else {
      alert("No voucher found with that code.");
    }
  };

  // Handle proceeding to shipping
  const handleProceedToShipping = async () => {
    if (!userId) {
      alert("Please log in first.");
      return;
    }

    // Delete applied voucher if exists
    if (selectedVoucherId) {
      try {
        await http.delete(`/uservoucher/${selectedVoucherId}`);
      } catch (err) {
        console.error("Error deleting voucher:", err);
      }
    }

    // Update transaction with payment info
    const payload = {
      userId: userId,
      paymentCardNumber: cardNumber,
      paymentExpirationDate: expirationDate,
      paymentCVV: cvv,
      shippingAddress: "",
      preferredDeliveryDateTime: new Date().toISOString()
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/transaction/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error("Failed to update transaction");
      }
      navigate("/shipping", { state: { finalTotal } });
    } catch (error) {
      console.error("Error updating transaction:", error);
      alert("Failed to process payment information. Please try again.");
    }
  };

  return (
    <>
      <div style={{ width: "100%", textAlign: "center", padding: "1rem 0" }}>
        <h2 style={{ marginBottom: "1rem" }}>Step 2 of 3: Payment</h2>
        <img
          src={stepProgress}
          alt="Checkout Steps"
          style={{ width: "100%", maxWidth: "800px" }}
        />
      </div>

      <div className="cart-page">
        {/* Payment Information Section */}
        <div className="cart-main">
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>Payment Information</h3>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
              <TextField
                label="Card Number"
                placeholder="xxxx xxxx xxxx xxxx"
                variant="outlined"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CreditCardIcon />
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                label="Expiration Date"
                placeholder="MM/YY"
                variant="outlined"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon />
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                label="CVV"
                placeholder="xxx"
                variant="outlined"
                type="password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          </div>
        </div>

        {/* Order Summary Section */}
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
                  ${((Number(item.productSize?.price) || Number(item.product.price)) *
                    Number(item.quantity)).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
          <hr />
          <p style={{ margin: "0.5rem 0" }}>
            Cart Subtotal: ${totalPrice.toFixed(2)}
          </p>

          {/* Voucher Section */}
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
