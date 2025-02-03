import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Input,
    IconButton,
    Button,
    Select,
    MenuItem,
    Checkbox,
    Slider,
    List,
    ListItem,
    Divider,
} from '@mui/material';
import { Search, Clear, Edit, AddShoppingCart } from '@mui/icons-material';
import http from '../http';
import UserContext from '../contexts/UserContext';

function Products() {
    const [productList, setProductList] = useState([]);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ type: '', brand: '', price: [0, 500] });
    const { user } = useContext(UserContext);

    // Fetch products from the backend
    const getProducts = () => {
        http.get('/product')
            .then((res) => {
                setProductList(res.data);
            })
            .catch((err) => {
                console.error("Error fetching products:", err);
            });
    };

    const searchProducts = () => {
        const { type, brand, price } = filters;
        const query = `/products?search=${search}&type=${type}&brand=${brand}&priceMin=${price[0]}&priceMax=${price[1]}`;
        http.get(query).then((res) => {
            setProductList(res.data);
        });
    };

    useEffect(() => {
        getProducts();
    }, []);

    const onSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            searchProducts();
        }
    };

    const onPriceChange = (event, newValue) => {
        setFilters({ ...filters, price: newValue });
    };

    const onFilterChange = (field, value) => {
        setFilters({ ...filters, [field]: value });
    };

    return (
        <Box sx={{ display: 'flex', padding: 2 }}>
            {/* Sidebar */}
            <Box sx={{ width: '20%', paddingRight: 2, borderRight: '1px solid #e0e0e0' }}>
                <Typography variant="h6">Filters</Typography>
                <Divider sx={{ my: 2 }} />

                <Typography variant="body1">Product Type</Typography>
                <List>
                    {['Clothes', 'Accessories', 'Skincare'].map((type) => (
                        <ListItem key={type}>
                            <Checkbox
                                checked={filters.type === type}
                                onChange={() => onFilterChange('type', type)}
                            />
                            {type}
                        </ListItem>
                    ))}
                </List>

                <Typography variant="body1">Brands</Typography>
                <List>
                    {['Brand A', 'Brand B', 'Brand C'].map((brand) => (
                        <ListItem key={brand}>
                            <Checkbox
                                checked={filters.brand === brand}
                                onChange={() => onFilterChange('brand', brand)}
                            />
                            {brand}
                        </ListItem>
                    ))}
                </List>

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
                        setFilters({ type: '', brand: '', price: [0, 500] });
                        setSearch('');
                        getProducts();
                    }}
                >
                    Clear Filters
                </Button>
            </Box>

            {/* Main Content */}
            <Box sx={{ flexGrow: 1, padding: 2 }}>
                {/* Search and Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Input
                        value={search}
                        placeholder="Search"
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={onSearchKeyDown}
                        sx={{ flexGrow: 1, backgroundColor: '#f9f9f9', borderRadius: 1, padding: 1 }}
                    />
                    <IconButton color="primary" onClick={searchProducts}>
                        <Search />
                    </IconButton>
                    <IconButton color="primary" onClick={() => setSearch('')}>
                        <Clear />
                    </IconButton>
                    <Box sx={{ ml: 2 }}>
                        <Select
                            value={filters.sort}
                            onChange={(e) => onFilterChange('sort', e.target.value)}
                            displayEmpty
                            sx={{ minWidth: 150 }}
                        >
                            <MenuItem value="">Sort by</MenuItem>
                            <MenuItem value="latest">Latest</MenuItem>
                            <MenuItem value="priceLow">Price: Low to High</MenuItem>
                            <MenuItem value="priceHigh">Price: High to Low</MenuItem>
                        </Select>
                    </Box>
                    {user && (
                        <Box sx={{ ml: 2 }}>
                            <Link to="/addproduct">
                                <Button variant="contained" color="primary">
                                    Add Product
                                </Button>
                            </Link>
                        </Box>
                    )}
                </Box>

                {/* Product Grid */}
                <Grid container spacing={2}>
                    {productList.map((product) => (
                        <Grid item xs={12} sm={6} md={4} key={product.id}>
                            <Card>
                                <Box sx={{ height: 200, overflow: 'hidden' }}>
                                    <img
                                        src={`${import.meta.env.VITE_FILE_BASE_URL}${product.imageFile}`}
                                        alt={product.name}
                                        style={{ width: '100%', height: 'auto' }}
                                    />
                                </Box>
                                <CardContent>
                                    <Typography variant="h6" noWrap>
                                        {product.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" noWrap>
                                        {product.description}
                                    </Typography>
                                    <Typography variant="h6" color="primary">
                                        ${product.price}
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'space-between' }}>
                                    <Button variant="contained" color="primary" startIcon={<AddShoppingCart />}>
                                        Add to Cart
                                    </Button>
                                    {user && user.id === product.userId && (
                                        <Link to={`/editProduct/${product.id}`}>
                                            <Button variant="text" startIcon={<Edit />}>
                                                Edit
                                            </Button>
                                        </Link>
                                    )}
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
}

export default Products;
