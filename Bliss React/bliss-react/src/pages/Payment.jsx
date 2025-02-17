import React, { useEffect, useState, useContext } from "react";
import { Box, Typography, TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LockIcon from '@mui/icons-material/Lock';
import http from "../http";
import UserContext from "../contexts/UserContext";
import stepProgress from "../assets/Group 2.png";
import "../styles/Payment.css";

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

  // Error state for validation
  const [cardNumberError, setCardNumberError] = useState("");
  const [expirationDateError, setExpirationDateError] = useState("");
  const [cvvError, setCvvError] = useState("");

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

  // Validation for credit card info
  const validatePaymentInfo = () => {
    let valid = true;

    // Validate card number: remove spaces, must be 16 digits.
    const cleanedCardNumber = cardNumber.replace(/\s/g, "");
    if (!/^\d{16}$/.test(cleanedCardNumber)) {
      setCardNumberError("Card number must be 16 digits.");
      valid = false;
    } else {
      setCardNumberError("");
    }

    // Validate expiration date: should be in MM/YY format and in the future.
    const expRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expRegex.test(expirationDate)) {
      setExpirationDateError("Expiration date must be in MM/YY format.");
      valid = false;
    } else {
      const [month, year] = expirationDate.split("/");
      const expMonth = parseInt(month, 10);
      const expYear = 2000 + parseInt(year, 10); // assumes 20YY format
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        setExpirationDateError("Card is expired.");
        valid = false;
      } else {
        setExpirationDateError("");
      }
    }

    // Validate CVV: must be 3 digits.
    if (!/^\d{3}$/.test(cvv)) {
      setCvvError("CVV must be 3 digits.");
      valid = false;
    } else {
      setCvvError("");
    }

    return valid;
  };

  // Handle proceeding to shipping
  const handleProceedToShipping = async () => {
    if (!userId) {
      alert("Please log in first.");
      return;
    }

    if (!validatePaymentInfo()) {
      alert("Please correct the errors in your payment information.");
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
      <div className="payment-header">
        <Typography variant="h4" gutterBottom>
          Step 2 of 3: Payment
        </Typography>
        <img src={stepProgress} alt="Checkout Steps" className="step-progress" />
      </div>

      <div className="payment-card">
        {/* Payment Information Section */}
        <div className="payment-form">
          <Typography variant="h5" gutterBottom>
            Payment Information
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Card Number"
              placeholder="xxxx xxxx xxxx xxxx"
              variant="outlined"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              error={Boolean(cardNumberError)}
              helperText={cardNumberError}
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
              error={Boolean(expirationDateError)}
              helperText={expirationDateError}
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
              error={Boolean(cvvError)}
              helperText={cvvError}
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

        {/* Order Summary Section */}
        <div className="order-summary">
          <Typography variant="h5" gutterBottom>
            Order Summary
          </Typography>
          {cartItems.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2
              }}
            >
              <img
                src={`${import.meta.env.VITE_FILE_BASE_URL}${item.product.imageFile}`}
                alt={item.product.name}
                style={{
                  width: "60px",
                  height: "60px",
                  objectFit: "cover",
                  marginRight: "1rem"
                }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1">{item.product.name}</Typography>
                <Typography variant="body2">{item.product.type}</Typography>
                {item.productSize && (
                  <Typography variant="body2">
                    Size: {item.productSize.size}ml
                  </Typography>
                )}
                <Typography variant="body2">
                  Quantity: {item.quantity}
                </Typography>
              </Box>
              <Typography variant="subtitle1">
                ${((Number(item.productSize?.price) || Number(item.product.price)) * Number(item.quantity)).toFixed(2)}
              </Typography>
            </Box>
          ))}
          <hr />
          <Typography variant="body1" sx={{ mt: 1 }}>
            Cart Subtotal: ${totalPrice.toFixed(2)}
          </Typography>

          {userVouchers.length > 0 && (
            <FormControl fullWidth sx={{ my: 2 }}>
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
            <Typography variant="body1" sx={{ my: 1 }}>
              Voucher Discount: ${userVouchers.find((v) => v.id === selectedVoucherId)?.value}
            </Typography>
          )}
          <hr />
          <Typography variant="h6" className="grand-total">
            S${finalTotal.toFixed(2)}
          </Typography>
          <Button variant="contained" className="checkout-button" onClick={handleProceedToShipping}>
            Proceed to Shipping
          </Button>
        </div>
      </div>
    </>
  );
}

export default Payment;
