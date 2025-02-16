import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import http from '../http';
import {
    Box,
    Typography,
    Button,
    Divider,
    Select,
    MenuItem,
    TextField,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UserContext from '../contexts/UserContext';
import "../styles/Cart.css";

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const { user } = useContext(UserContext);
    const userId = user ? user.id : null;
    const navigate = useNavigate();

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
                console.log("Cart items:", data.cartItems);
                data.cartItems.forEach((item, index) => {
                    console.log(`Item ${index}:`, item);
                });
                setCartItems(data.cartItems || []);
            })
            .catch((err) => console.error("Error fetching cart:", err));
    }, [userId]);

    

    // Calculate total price using productSize price if available, otherwise product price
    const totalPriceCalculated = cartItems.reduce((acc, item) => {
        const price = Number(item.productSize?.price) || Number(item.product.price) || 0;
        const quantity = Number(item.quantity) || 0;
        return acc + price * quantity;
    }, 0);

    useEffect(() => {
        setTotalPrice(totalPriceCalculated);
    }, [totalPriceCalculated]);

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/Cart/item/update`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cartItemId: itemId, quantity: newQuantity }),
            });

            if (!response.ok) {
                console.error("Failed to update quantity");
            } else {
                const updatedItem = await response.json();
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
        const currentQuantity = Number(item.quantity) || 0;
        const newQuantity = currentQuantity + 1;
        console.log("Incrementing item id:", item.id, "Current quantity:", currentQuantity);
        handleUpdateQuantity(item.id, newQuantity);
    };

    const handleDecrement = (item) => {
        const currentQuantity = Number(item.quantity) || 0;
        if (currentQuantity > 1) {
            const newQuantity = currentQuantity - 1;
            console.log("Decrementing item id:", item.id, "Current quantity:", currentQuantity);
            handleUpdateQuantity(item.id, newQuantity);
        }
    };

    const handleRemove = async (itemId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/Cart/item/${itemId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                console.error("Failed to remove item");
            } else {
                setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
                console.log("Item removed successfully");
            }
        } catch (error) {
            console.error("Error removing item:", error);
        }
    };

    const handleCheckout = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/transaction/init`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: userId })
            });
            if (!response.ok) {
                console.error("Checkout failed.");
                return;
            }
            const transaction = await response.json();
            console.log("Transaction created: ", transaction);
            navigate("/payment");
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
                                    {item.productSize && (
                                        <p>{item.productSize.size}ml</p>
                                    )}
                                </div>
                                <div className="cart-item-controls">
                                    <button onClick={() => handleDecrement(item)}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => handleIncrement(item)}>+</button>
                                    <p className="cart-item-price">
                                        ${((Number(item.productSize?.price) || Number(item.product.price)) * item.quantity).toFixed(2)}
                                    </p>
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
                <p className="grand-total">S${totalPrice.toFixed(2)}</p>
                <button className="checkout-button" onClick={handleCheckout}>Checkout</button>
            </div>
        </div>
    );
}

export default Cart;
