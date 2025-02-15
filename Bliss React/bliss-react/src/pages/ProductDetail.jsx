import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import http from '../http';
import {
    Box,
    Typography,
    Button,
    Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);

    useEffect(() => {
        http.get(`/product/${id}`)
            .then((res) => setProduct(res.data))
            .catch((err) => console.error("Error fetching product:", err));
    }, [id]);

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

                    <Button
                        variant="contained"
                        sx={{
                            width: '100%',
                            backgroundColor: '#222',
                            color: '#fff',
                            padding: '12px',
                            textTransform: 'none',
                            fontWeight: 'bold',
                            '&:hover': { backgroundColor: '#444' }
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
