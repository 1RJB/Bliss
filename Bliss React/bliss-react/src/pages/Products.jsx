import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Typography,
    Grid,
    Select,
    MenuItem,
    InputBase,
    IconButton,
    Button,
    Slider,
    Divider
} from '@mui/material';
import { Search, Clear, Edit } from '@mui/icons-material';
import http from '../http';
import UserContext from '../contexts/UserContext';

function Products() {
    const [productList, setProductList] = useState([]);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ type: '', price: [0, 500] });
    const [currency, setCurrency] = useState("SGD");
    const [convertedPrices, setConvertedPrices] = useState({});
    const { user } = useContext(UserContext);
    const [selectedSizes, setSelectedSizes] = useState({});


    useEffect(() => {
        getProducts();
    }, [filters, search]);

    const getProducts = () => {
        const { type, price } = filters;
        const query = `/product?search=${search}&type=${type}&priceMin=${price[0]}&priceMax=${price[1]}`;

        http.get(query)
            .then((res) => {
                setProductList(res.data);
                convertPrices(res.data, currency);

                // ✅ Set default size selection
                let defaultSizes = {};
                res.data.forEach(product => {
                    if (product.sizes.length > 0) {
                        defaultSizes[product.id] = product.sizes[0].size; // Set first size as default
                    }
                });
                setSelectedSizes(defaultSizes);
            })
            .catch((err) => {
                console.error("Error fetching products:", err);
            });
    };


    const convertPrices = async (products, toCurrency) => {
        let updatedPrices = {};
        for (let product of products) {
            try {
                const res = await http.get(`/currency/convert`, {
                    params: { amount: product.price, from: "SGD", to: toCurrency }
                });
                updatedPrices[product.id] = res.data.converted.toFixed(2);
            } catch (error) {
                console.error("Error converting currency:", error);
            }
        }
        setConvertedPrices(updatedPrices);
    };

    const onPriceChange = (event, newValue) => {
        setFilters({ ...filters, price: newValue });
    };

    const onFilterChange = (field, value) => {
        setFilters({ ...filters, [field]: value });
    };



    return (
        <Box sx={{ display: 'flex', backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
            {/* Sidebar for Filters - Moved Down to Align with Skincare */}
            <Box sx={{ width: '20%', padding: '20px', borderRight: '1px solid #EAEAEA', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h6" sx={{ marginBottom: '10px' }}>Filters</Typography>
                <Divider sx={{ my: 2 }} />

                {/* Currency Selector */}
                <Typography variant="body1">Currency</Typography>
                <Select
                    value={currency}
                    onChange={(e) => {
                        setCurrency(e.target.value);
                        convertPrices(productList, e.target.value);
                    }}
                    displayEmpty
                    fullWidth
                    sx={{ my: 2, backgroundColor: '#F8F8F8', borderRadius: '5px' }}
                >
                    <MenuItem value="SGD">SGD</MenuItem>
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="MYR">MYR</MenuItem>
                </Select>

                {/* Product Type Filter */}
                <Typography variant="body1">Product Type</Typography>
                <Select
                    value={filters.type}
                    onChange={(e) => onFilterChange('type', e.target.value)}
                    displayEmpty
                    fullWidth
                    sx={{ my: 2, backgroundColor: '#F8F8F8', borderRadius: '5px' }}
                >
                    <MenuItem value="">All Products</MenuItem>
                    <MenuItem value="Moisturizer">Moisturizer</MenuItem>
                    <MenuItem value="Toner">Toner</MenuItem>
                    <MenuItem value="Cleanser">Cleanser</MenuItem>
                </Select>

                {/* Price Range Filter */}
                <Typography variant="body1">Price Range</Typography>
                <Slider
                    value={filters.price}
                    onChange={onPriceChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={500}
                />
                <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => {
                        setFilters({ type: '', price: [0, 500] });
                        setSearch('');
                        getProducts();
                    }}
                >
                    Clear Filters
                </Button>
            </Box>

            {/* Main Content */}
            <Box sx={{ flexGrow: 1, padding: '40px' }}>
                {/* Skincare Banner - Now Level with Filters */}
                <Box sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #EAEAEA',
                    paddingBottom: '10px'
                }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
                        Skincare
                    </Typography>
                </Box>

                {/* Search Bar & Add Product */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 3 }}>
                    {/* Search Input */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#F8F8F8',
                        borderRadius: '30px',
                        padding: '5px 15px',
                        width: '40%'
                    }}>
                        <InputBase
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            fullWidth
                        />
                        <IconButton onClick={() => setSearch('')} size="small">
                            <Clear />
                        </IconButton>
                        <IconButton onClick={getProducts} size="small">
                            <Search />
                        </IconButton>
                    </Box>

                    {/* Add Product Button */}
                    {user && user.role === 'admin' &&(
                        <Link to="/addproduct">
                            <Button variant="contained" color="primary" sx={{
                                borderRadius: '20px',
                                padding: '8px 20px',
                                textTransform: 'none'
                            }}>
                                Add Product
                            </Button>
                        </Link>
                    )}
                </Box>

                {/* Product Grid */}
                <Grid container spacing={4}>
                    {productList.map((product) => (
                        <Grid item xs={12} sm={6} md={3} key={product.id}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    position: 'relative', // Needed for absolute positioning of hover effect
                                    overflow: 'hidden',
                                    borderRadius: '8px',
                                    transition: 'transform 0.3s ease-in-out',
                                    '&:hover': {
                                        transform: 'scale(1.03)',
                                        '& .hoverOverlay': { opacity: 1 }
                                    }
                                }}
                            >
                                {/* Product Image */}
                                <Box
                                    sx={{
                                        height: '220px',
                                        width: '100%',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundImage: `url(${import.meta.env.VITE_FILE_BASE_URL}${product.imageFile})`,
                                        borderRadius: '5px',
                                        marginBottom: 2,
                                        transition: 'filter 0.3s ease-in-out',
                                        '&:hover': {
                                            filter: 'brightness(60%)' // Darkens image on hover
                                        }
                                    }}
                                />



                                {/* Hover Effect (Darken + Learn More Button) */}
                                <Box
                                    className="hoverOverlay"
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        background: 'rgba(0, 0, 0, 0.4)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        opacity: 0, // Hidden by default
                                        transition: 'opacity 0.3s ease-in-out'
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        sx={{
                                            backgroundColor: '#fff',
                                            color: '#000',
                                            fontWeight: 'bold',
                                            borderRadius: '20px',
                                            padding: '8px 20px',
                                            '&:hover': { backgroundColor: '#ddd' }
                                        }}
                                        component={Link} to={`/productdetail/${product.id}`}>
                                        Learn More
                                    </Button>
                                </Box>

                                {user && user.role === 'admin' && (
                                    <Link to={`/editProduct/${product.id}`} style={{ position: 'absolute', top: 8, right: 8 }}>
                                        <Edit sx={{ color: '#A3BE8C' }} />
                                    </Link>
                                )}


                                {/* Product Details with Size Selection */}
                                <Box sx={{ padding: '15px', textAlign: 'center' }}>
                                    {/* Product Name */}
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                        {product.name}
                                    </Typography>

                                    {/* Product Description */}
                                    <Typography variant="body2" sx={{ color: '#666', fontSize: '0.9rem', marginBottom: 1 }}>
                                        {product.description}
                                    </Typography>

                                    {/* Size Selection (if multiple sizes exist) */}
                                    {product.sizes.length > 0 && (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                                            {product.sizes.map((sizeOption) => (
                                                <Button
                                                    key={sizeOption.size}
                                                    variant={selectedSizes[product.id] === sizeOption.size ? "contained" : "outlined"}
                                                    onClick={() => setSelectedSizes({ ...selectedSizes, [product.id]: sizeOption.size })}
                                                    sx={{ marginX: 1, textTransform: "none" }}
                                                >
                                                    {sizeOption.size + "ml"}
                                                </Button>
                                            ))}
                                        </Box>
                                    )}

                                    {/* Dynamic Price Based on Selected Size */}
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', mt: 1 }}>
                                        {product.sizes.length > 0
                                            ? `${product.sizes.find(size => size.size === selectedSizes[product.id])?.price || product.sizes[0].price} ${currency}`
                                            : `${product.price} SGD`}
                                    </Typography>

                                    {/* Edit Button (Only for Product Owner) */}
                                    {user && user.role === 'admin' && (
                                        <Link to={`/editProduct/${product.id}`} style={{ textDecoration: 'none', fontSize: '0.9rem', color: '#666' }}>
                                            Edit
                                        </Link>
                                    )}
                                </Box>

                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
}

export default Products;
