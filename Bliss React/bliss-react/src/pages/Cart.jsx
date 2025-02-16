import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, Input, IconButton, Button } from '@mui/material';
import { Search, Clear, Add } from '@mui/icons-material';
import http from '../http';
import dayjs from 'dayjs';
import UserContext from '../contexts/UserContext';
import "../styles/Cart.css";
import Payment from './Payment';
import { useNavigate } from 'react-router-dom';

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const { user } = useContext(UserContext);
    const userId = user ? user.id : null;
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) return;
        fetch(`https://localhost:7004/api/cart?userId=${userId}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch cart data");
                }
                return res.json();
            })
            .then((data) => {
                console.log("Fetched cart data:", data); // Log the complete response
                console.log("Cart items:", data.cartItems); // Log just the cart items array
                setCartItems(data.cartItems || []);
            })
            .catch((err) => console.error("Error fetching cart:", err));
    }, [userId]);




    useEffect(() => {
        const newTotal = cartItems.reduce((acc, item) => {
            const price = Number(item.product.price) || 0;
            const quantity = Number(item.quantity) || 0;
            return acc + price * quantity;
        }, 0);
        setTotalPrice(newTotal);
    }, [cartItems]);

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        try {
            const response = await fetch("https://localhost:7004/api/Cart/item/update", {
                method: "PUT", // Or PATCH if that's your choice
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cartItemId: itemId, quantity: newQuantity }),
            });

            if (!response.ok) {
                console.error("Failed to update quantity");
            } else {
                const updatedItem = await response.json();
                // Update the state to reflect the backend change.
                setCartItems((prevItems) =>
                    prevItems.map((item) =>
                        item.id === itemId ? { ...item, quantity: updatedItem.quantity } : item
                    )
                );
            }
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    };


    const handleIncrement = (item) => {
        // Ensure the current quantity is a valid number; default to 0 if not.
        const currentQuantity = Number(item.quantity) || 0;
        const newQuantity = currentQuantity + 1;
        console.log("log 2 for handlers:", item.id);
        handleUpdateQuantity(item.id, newQuantity);
    };

    const handleDecrement = (item) => {
        const currentQuantity = Number(item.quantity) || 0;
        if (currentQuantity > 1) {
            const newQuantity = currentQuantity - 1;
            handleUpdateQuantity(item.id, newQuantity);
        }
    };


    const handleRemove = async (itemId) => {
        try {
            const response = await fetch(`https://localhost:7004/api/Cart/item/${itemId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                console.error("Failed to remove item");
            } else {
                // Update the local state after successful deletion
                setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
                console.log("Item removed successfully");
            }
        } catch (error) {
            console.error("Error removing item:", error);
        }
    };

    const handleCheckout = async () => {
        try {
          const response = await fetch("https://localhost:7004/api/transaction/init", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ userId: userId })
          });
          if (!response.ok) {
            console.error("Checkout failed.");
            return;
          }
          const transaction = await response.json();
          console.log("Transaction created: ", transaction);
          // Navigate to the shipping page (or confirmation page) after successful checkout.
          navigate("/payment"); // adjust the route as needed
        } catch (error) {
          console.error("Error during checkout: ", error);
        }
      };


    return (
        <div className="cart-page">
            <div className="cart-main">
                <h2>Your Cart</h2>
                {cartItems.length === 0 ? (
                    <p>Your cart is empty.</p>
                ) : (
                    cartItems.map((item) => (
                        <div className="cart-item" key={item.id}>
                            <img
                                src={`${import.meta.env.VITE_FILE_BASE_URL}${item.product.imageFile}`}
                                alt={item.product.name}
                                className="cart-item-image"
                                style={{ width: '100%', maxWidth: '400px', objectFit: 'contain' }}
                            />
                            <div className="cart-item-info">
                                <div className="cart-item-title">
                                    <h4>{item.product.name}</h4>
                                    <p>{item.product.type}</p>
                                </div>
                                <div className="cart-item-controls">
                                    <button onClick={() => handleDecrement(item)}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => handleIncrement(item)}>+</button>
                                    <p className="cart-item-price">${item.product.price * item.quantity}</p>
                                    <button onClick={() => handleRemove(item.id)}>x</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="cart-summary">
                <h3>Summary</h3>
                <p>{cartItems.length} Items</p>
                <p className="grand-total">S${totalPrice}</p>
                <button className="checkout-button" onClick={handleCheckout}>Checkout</button>
            </div>

        </div>
    );
}

export default Cart;