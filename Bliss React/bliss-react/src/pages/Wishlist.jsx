import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, Input, IconButton, Button } from '@mui/material';
import { AccountCircle, AccessTime, Search, Clear, Edit, FavoriteBorder } from '@mui/icons-material';
import http from '../http';
import dayjs from 'dayjs';
import UserContext from '../contexts/UserContext';
import global from '../global';

function Wishlists() {
    const [wishlistList, setWishlistList] = useState([]);
    const [search, setSearch] = useState('');
    const { user } = useContext(UserContext);

    const getWishlist = () => {
        http.get('/wishlist').then((res) => {
            setWishlistList(res.data);
        });
    };

    useEffect(() => {
        getWishlist();
    }, []);

    return (
        <Box>
            <Typography variant="h5" sx={{ my: 2 }}>
                Wishlists
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Input 
                    value={search} 
                    placeholder="Search"
                    onChange={(e) => setSearch(e.target.value)} 
                />
                <IconButton color="primary" onClick={() => getWishlist()}>
                    <Search />
                </IconButton>
                <IconButton color="primary" onClick={() => setSearch('')}>
                    <Clear />
                </IconButton>
                <Box sx={{ flexGrow: 1 }} />
                {user && (
                    <Link to="/addwishlist">
                        <Button variant="contained">Add Wishlist</Button>
                    </Link>
                )}
            </Box>

            <Grid container spacing={2}>
                {wishlistList.map((wishlist) => (
                    <Grid item xs={12} md={6} lg={4} key={wishlist.id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="h6">{wishlist.name}</Typography>
                                    {user && user.id === wishlist.userId && (
                                        <Link to={`/editwishlist/${wishlist.id}`}>
                                            <IconButton color="primary">
                                                <Edit />
                                            </IconButton>
                                        </Link>
                                    )}
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }} color="text.secondary">
                                    <AccountCircle sx={{ mr: 1 }} />
                                    <Typography>{wishlist.user?.name}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }} color="text.secondary">
                                    <AccessTime sx={{ mr: 1 }} />
                                    <Typography>{dayjs(wishlist.createdAt).format(global.datetimeFormat)}</Typography>
                                </Box>
                                <Typography>{wishlist.description}</Typography>
                                <Link to={`/wishlist/${wishlist.id}`}>
                                    <Button variant="outlined" sx={{ mt: 2 }}>
                                        View Wishlist
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default Wishlists;
