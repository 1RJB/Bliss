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
    TextField,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UserContext from '../contexts/UserContext';

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const [product, setProduct] = useState(null);
    const [wishlists, setWishlists] = useState([]);
    const [selectedWishlist, setSelectedWishlist] = useState("");
    const [newWishlistName, setNewWishlistName] = useState("");
    const [creatingWishlist, setCreatingWishlist] = useState(false);

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

    const handleCreateWishlist = () => {
        if (!newWishlistName.trim()) {
            alert("⚠️ Please enter a wishlist name!");
            return;
        }

        http.post('/wishlist', { name: newWishlistName, description: "My new wishlist" })
            .then((res) => {
                alert("✅ Wishlist created successfully!");
                setWishlists([...wishlists, res.data]); 
                setSelectedWishlist(res.data.id);
                setCreatingWishlist(false); 
                setNewWishlistName(""); 
            })
            .catch((err) => {
                console.error("Error creating wishlist:", err);
                alert("❌ Failed to create wishlist.");
            });
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

                    {/* Wishlist UI */}
                    {user && (
                        <>
                            {wishlists.length > 0 ? (
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
                            ) : (
                                <>
                                    {!creatingWishlist ? (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            sx={{ mt: 2 }}
                                            onClick={() => setCreatingWishlist(true)}
                                        >
                                            Create a Wishlist
                                        </Button>
                                    ) : (
                                        <>
                                            <TextField
                                                label="Wishlist Name"
                                                variant="outlined"
                                                fullWidth
                                                value={newWishlistName}
                                                onChange={(e) => setNewWishlistName(e.target.value)}
                                                sx={{ my: 2 }}
                                            />
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleCreateWishlist}
                                                sx={{ mr: 2 }}
                                            >
                                                Save Wishlist
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                onClick={() => setCreatingWishlist(false)}
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    <Button
                        variant="contained"
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

                    {/* Restored Information */}
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
        </Box>
    );
}

export default ProductDetail;
