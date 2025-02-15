import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, IconButton, Button } from '@mui/material';
import { Delete } from '@mui/icons-material';
import http from '../http';
import UserContext from '../contexts/UserContext';

function WishlistDetail() {
    const { id } = useParams();
    const [wishlist, setWishlist] = useState(null);
    const { user } = useContext(UserContext);

    const getWishlist = () => {
        http.get(`/wishlist/${id}`).then((res) => {
            setWishlist(res.data);
        });
    };

    const removeProduct = (productId) => {
        http.delete(`/wishlist/${id}/removeProduct/${productId}`).then(() => {
            getWishlist();
        });
    };

    useEffect(() => {
        getWishlist();
    }, [id]);

    if (!wishlist) return <Typography>Loading...</Typography>;

    return (
        <Box>
            <Typography variant="h5" sx={{ my: 2 }}>
                {wishlist.name}
            </Typography>
            <Typography>{wishlist.description}</Typography>

            <Grid container spacing={2} sx={{ mt: 2 }}>
                {wishlist.products.map((product) => (
                    <Grid item xs={12} md={6} lg={4} key={product.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{product.name}</Typography>
                                <Typography>{product.description}</Typography>
                                <Typography sx={{ fontWeight: 'bold' }}>${product.price}</Typography>
                                {user && user.id === wishlist.userId && (
                                    <IconButton color="error" onClick={() => removeProduct(product.id)}>
                                        <Delete />
                                    </IconButton>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default WishlistDetail;
