import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../contexts/UserContext";
import "../styles/Shipping.css";
import stepProgress from "../assets/Group 3.png";
import { Box, TextField, Button, Typography } from "@mui/material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { addDays, setHours, setMinutes, setSeconds, setMilliseconds } from "date-fns";

function Shipping() {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // Shipping form fields
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [preferredDeliveryDateTime, setPreferredDeliveryDateTime] = useState(new Date());

  const { user } = useContext(UserContext);
  const userId = user ? user.id : null;
  const navigate = useNavigate();

  // Restrict date/time to next 3 days, 9am–3pm
  const now = new Date();
  const minDate = now;
  const maxDate = addDays(now, 3);
  const minTime = setMilliseconds(setSeconds(setMinutes(setHours(now, 9), 0), 0), 0);
  const maxTime = setMilliseconds(setSeconds(setMinutes(setHours(new Date(), 15), 0), 0), 0);

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

  // Calculate total price using productSize price if available, otherwise product price
  useEffect(() => {
    const newTotal = cartItems.reduce((acc, item) => {
      const price = Number(item.productSize?.price) || Number(item.product.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return acc + price * quantity;
    }, 0);
    setTotalPrice(newTotal);
  }, [cartItems]);

  const handlePlaceOrder = async () => {
    if (!userId) {
      alert("Please log in first.");
      return;
    }
  
    // Build payload for updating transaction with shipping info.
    const payload = {
      userId: userId,
      shippingAddress: `${addressLine1} ${addressLine2}`.trim(),
      preferredDeliveryDateTime: preferredDeliveryDateTime.toISOString(),
      // Payment info assumed to be already set on the Payment page.
      paymentCardNumber: "",
      paymentExpirationDate: "",
      paymentCVV: ""
    };
  
    try {
      // 1. Update the transaction with shipping info.
      const updateResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/transaction/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!updateResponse.ok) {
        console.error("Failed to update transaction with shipping info");
        alert("Failed to update shipping info.");
        return;
      }
  
      // 2. Finalize the transaction.
      const finalizeResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/transaction/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
  
      if (!finalizeResponse.ok) {
        console.error("Failed to finalize transaction");
        alert("Failed to finalize your order.");
        return;
      }
  
      // 3. Navigate to the Confirmation page on success.
      navigate("/confirmation");
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Error placing order.");
    }
  };

  return (
    <>
      <div className="shipping-header">
        <Typography variant="h4" gutterBottom>
          Step 3 of 3: Enter Shipping Information
        </Typography>
        <img src={stepProgress} alt="Checkout Steps" className="step-progress" />
      </div>

      <div className="shipping-card">
        {/* Shipping Information Section */}
        <div className="shipping-form">
          <Typography variant="h5" gutterBottom>
            Shipping Information
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 400 }}>
            <TextField
              label="Address Line 1"
              placeholder="Enter Address Line 1"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              variant="outlined"
            />
            <TextField
              label="Address Line 2"
              placeholder="Enter Address Line 2 (Optional)"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              variant="outlined"
            />
            <TextField
              label="Zip Code"
              placeholder="Enter Zip Code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              variant="outlined"
            />
            <TextField
              label="Phone Number"
              placeholder="Enter Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              variant="outlined"
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Preferred Delivery Date & Time"
                value={preferredDeliveryDateTime}
                onChange={(newValue) => setPreferredDeliveryDateTime(newValue)}
                minDate={minDate}
                maxDate={maxDate}
                minTime={minTime}
                maxTime={maxTime}
                renderInput={(params) => <TextField {...params} variant="outlined" />}
              />
            </LocalizationProvider>
          </Box>
        </div>

        {/* Order Summary Section */}
        <div className="order-summary">
          <Typography variant="h5" gutterBottom>
            Order Summary
          </Typography>
          {cartItems.map((item) => (
            <Box key={item.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <img
                src={`${import.meta.env.VITE_FILE_BASE_URL}${item.product.imageFile}`}
                alt={item.product.name}
                style={{ width: "60px", height: "60px", objectFit: "cover", marginRight: "1rem" }}
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
          <hr />
          <Typography variant="h6" className="grand-total">
            S${totalPrice.toFixed(2)}
          </Typography>
          <Button variant="contained" className="checkout-button" onClick={handlePlaceOrder}>
            Place Your Order
          </Button>
        </div>
      </div>
    </>
  );
}

export default Shipping;
