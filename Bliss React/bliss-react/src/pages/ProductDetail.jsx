import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import http from '../http';
import {
    Box,
    Typography,
    Button,
    Divider,
    Select,
    MenuItem,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UserContext from '../contexts/UserContext';

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const [product, setProduct] = useState(null);
    const [wishlists, setWishlists] = useState([]); // Store user's wishlists
    const [selectedWishlist, setSelectedWishlist] = useState(""); // Selected wishlist

    useEffect(() => {
        http.get(`/product/${id}`)
            .then((res) => setProduct(res.data))
            .catch((err) => console.error("Error fetching product:", err));

        if (user) {
            http.get('/wishlist')
                .then((res) => setWishlists(res.data))
                .catch((err) => console.error("Error fetching wishlists:", err));
        }
    }, [id, user]);

    const handleAddToWishlist = () => {
        if (!selectedWishlist) {
            alert("⚠️ Please select a wishlist first!");
            return;
        }

        http.post(`/wishlist/${selectedWishlist}/addProduct/${product.id}`)
            .then(() => {
                alert("✅ Product added to wishlist successfully!");
            })
            .catch((err) => {
                console.error("Error adding product to wishlist:", err);
                alert("❌ Failed to add product to wishlist.");
            });
    };


    const handleAddToCart = async () => {
        if (!user) {
          console.error("User is not logged in.");
          return;
        }
        if (!product) {
          console.error("Product data is not available.");
          return;
        }
        try {
          const response = await fetch("https://localhost:7004/api/Cart/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: product.id, userId: user.id }),
          });
      
          if (!response.ok) {
            console.error("Failed to add product to cart");
            // Optionally display an error message
          } else {
            const data = await response.json();
            console.log("Cart updated successfully:", data);
            // Optionally update your UI or display a success message
          }
        } catch (error) {
          console.error("Error adding product to cart:", error);
        }
      };




    if (!product) return <Typography sx={{ textAlign: 'center', marginTop: 5 }}>Loading...</Typography>;

    return (
        <Box sx={{ backgroundColor: '#F8F9FA', minHeight: '100vh', padding: '40px' }}>
            {/* Back Button */}
            <Button
                startIcon={<ArrowBackIcon />}
                sx={{ marginBottom: '20px', textTransform: 'none', color: '#000' }}
                onClick={() => navigate(-1)}
            >
                Back
            </Button>

            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                padding: '40px'
            }}>
                {/* Product Image */}
                <Box sx={{
                    flex: '1',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#FFF',
                    padding: '20px',
                    borderRadius: '8px',
                    maxWidth: '500px'
                }}>
                    <img
                        src={`${import.meta.env.VITE_FILE_BASE_URL}${product.imageFile}`}
                        alt={product.name}
                        style={{ width: '100%', maxWidth: '400px', objectFit: 'contain' }}
                    />
                </Box>

                {/* Product Info */}
                <Box sx={{ flex: '1', paddingLeft: { md: '40px' }, paddingTop: { xs: '20px', md: '0px' } }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '10px' }}>
                        {product.name}
                    </Typography>

                    <Typography variant="body1" sx={{ color: '#666', marginBottom: '15px' }}>
                        {product.description}
                    </Typography>

                    <Typography variant="body2" sx={{ fontWeight: 'bold', marginBottom: '5px' }}>
                        Size:
                    </Typography>
                    <Typography variant="body2" sx={{ marginBottom: '15px' }}>
                        {product.size || 'N/A'}
                    </Typography>

                    <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '10px' }}>
                        ${product.price}
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{
                            color: '#000',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            marginBottom: '20px'
                        }}
                    >
                        Find in stores →
                    </Typography>

                    {/* Wishlist Selection & Add Button */}
                    {user && wishlists.length > 0 && (
                        <>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', marginBottom: '5px' }}>
                                Select Wishlist:
                            </Typography>
                            <Select
                                value={selectedWishlist}
                                onChange={(e) => setSelectedWishlist(e.target.value)}
                                displayEmpty
                                fullWidth
                                sx={{ my: 2 }}
                            >
                                <MenuItem value="" disabled>Select a wishlist</MenuItem>
                                {wishlists.map(wishlist => (
                                    <MenuItem key={wishlist.id} value={wishlist.id}>{wishlist.name}</MenuItem>
                                ))}
                            </Select>

                            <Button
                                variant="contained"
                                color="success"
                                sx={{ mt: 1 }}
                                onClick={handleAddToWishlist}
                            >
                                Add to Wishlist
                            </Button>
                        </>
                    )}

                    <Button
                        variant="contained"
                        onClick={handleAddToCart}
                        sx={{
                            width: "100%",
                            backgroundColor: "#222",
                            color: "#fff",
                            padding: "12px",
                            textTransform: "none",
                            fontWeight: "bold",
                            "&:hover": { backgroundColor: "#444" },
                            mt: 2,
                        }}
                    >
                        Add to Cart
                    </Button>

                    <Divider sx={{ marginY: '20px' }} />

                    {/* Additional Product Information */}
                    <Typography variant="body2" sx={{ fontWeight: 'bold', marginBottom: '5px' }}>
                        Suited for
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', marginBottom: '10px' }}>
                        {product.suitedFor || 'All skin types'}
                    </Typography>

                    <Typography variant="body2" sx={{ fontWeight: 'bold', marginBottom: '5px' }}>
                        Skin Feel
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', marginBottom: '10px' }}>
                        {product.skinFeel || 'Soft and hydrated'}
                    </Typography>

                    <Typography variant="body2" sx={{ fontWeight: 'bold', marginBottom: '5px' }}>
                        Key Ingredients
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                        {product.ingredients || 'N/A'}
                    </Typography>
                </Box>
            </Box>

            {/* Eco-Friendly Label */}
            <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '40px' }}>
                <img src="/eco-friendly-icon.png" alt="Eco-friendly" style={{ width: '30px', marginRight: '10px' }} />
                <Typography variant="body2" sx={{ color: '#666' }}>
                    Verified more than 80% of the packaging and ingredients are environmentally sustainable.
                    *Tested by third-parties.
                </Typography>
            </Box>
        </Box>
    );
}

export default ProductDetail;
