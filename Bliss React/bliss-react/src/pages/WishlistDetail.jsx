import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';
import http from '../http';
import UserContext from '../contexts/UserContext';

function WishlistDetail() {
    const { id } = useParams();
    const [wishlist, setWishlist] = useState(null);
    const { user } = useContext(UserContext);

    useEffect(() => {
        http.get(`/wishlist/${id}`)
            .then((res) => {
                console.log("Wishlist API Response:", res.data);  // ✅ Log Response
                setWishlist(res.data);
            })
            .catch(err => console.error("Error fetching wishlist:", err));
    }, [id]);

    const removeProduct = (productId) => {
        http.delete(`/wishlist/${id}/removeProduct/${productId}`)
            .then(() => {
                getWishlist();
            })
            .catch(err => console.error("Error removing product:", err));
    };

    if (!wishlist) return <Typography>Loading...</Typography>;

    return (
        <Box>
            <Typography variant="h5" sx={{ my: 2 }}>
                {wishlist.name}
            </Typography>
            <Typography>{wishlist.description}</Typography>

            <Grid container spacing={2} sx={{ mt: 2 }}>
                {wishlist?.products?.length > 0 ? (  // ✅ Fix conditional check
                    wishlist.products.map((product) => (
                        <Grid item xs={12} md={6} lg={4} key={product.id}> {/* ✅ Fix casing */}
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">{product.name}</Typography> {/* ✅ Correct casing */}
                                    <Typography>{product.description}</Typography> {/* ✅ Correct casing */}
                                    <Typography sx={{ fontWeight: 'bold' }}>${product.price}</Typography> {/* ✅ Correct casing */}
                                    {user && user.id === wishlist.userId && (
                                        <IconButton color="error" onClick={() => removeProduct(product.id)}> {/* ✅ Correct casing */}
                                            <Delete />
                                        </IconButton>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Typography sx={{ mt: 2 }}>No products in this wishlist.</Typography>
                )}
            </Grid>
        </Box>
    );
}

export default WishlistDetail;
