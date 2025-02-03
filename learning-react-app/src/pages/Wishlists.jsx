import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Grid2 as Grid, Card, CardContent, Input, IconButton, Button } from '@mui/material';
import { AccountCircle, AccessTime, Search, Clear, Edit } from '@mui/icons-material';
import http from '../http';
import dayjs from 'dayjs';
import UserContext from '../contexts/UserContext';
import global from '../global';

function Wishlists() {
    const [wishlistList, setWishlistList] = useState([]);  // Change this state name
    const [search, setSearch] = useState('');
    const { user } = useContext(UserContext);

    const onSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const getWishlist = () => {
        http.get('/wishlist').then((res) => {
            setWishlistList(res.data);  // Make sure you update the correct state
        });
    };

    const searchWishlists = () => {
        http.get(`/wishlist?search=${search}`).then((res) => {
            setWishlistList(res.data);  // Make sure you update the correct state
        });
    };

    useEffect(() => {
        getWishlist();
    }, []);

    const onSearchKeyDown = (e) => {
        if (e.key === "Enter") {
            searchWishlists();
        }
    };

    const onClickSearch = () => {
        searchWishlists();
    };

    const onClickClear = () => {
        setSearch('');
        getWishlist();  // Ensure this calls getWishlist() to reset the list
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ my: 2 }}>
                Wishlists
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Input value={search} placeholder="Search"
                    onChange={onSearchChange}
                    onKeyDown={onSearchKeyDown} />
                <IconButton color="primary"
                    onClick={onClickSearch}>
                    <Search />
                </IconButton>
                <IconButton color="primary"
                    onClick={onClickClear}>
                    <Clear />
                </IconButton>
                <Box sx={{ flexGrow: 1 }} />
                {
                    user && (
                        <Link to="/addwishlist">
                            <Button variant='contained'>
                                Add
                            </Button>
                        </Link>
                    )
                }
            </Box>

            <Grid container spacing={2}>
                {
                    wishlistList.map((wishlist, i) => {  // Make sure you map over wishlistList
                        return (
                            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={wishlist.id}>
                                <Card>
                                    {
                                        wishlist.imageFile && (
                                            <Box className="aspect-ratio-container">
                                                <img alt="wishlist"
                                                    src={`${import.meta.env.VITE_FILE_BASE_URL}${wishlist.imageFile}`}>  {/* Make sure you reference wishlist.imageFile */}
                                                </img>
                                            </Box>
                                        )
                                    }
                                    <CardContent>
                                        <Box sx={{ display: 'flex', mb: 1 }}>
                                            <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                                {wishlist.name}
                                            </Typography>
                                            {
                                                user && user.id === wishlist.userId && (
                                                    <Link to={`/editwishlist/${wishlist.id}`}>
                                                        <IconButton color="primary" sx={{ padding: '4px' }}>
                                                            <Edit />
                                                        </IconButton>
                                                    </Link>
                                                )
                                            }
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                                            color="text.secondary">
                                            <AccountCircle sx={{ mr: 1 }} />
                                            <Typography>
                                                {wishlist.user?.name}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                                            color="text.secondary">
                                            <AccessTime sx={{ mr: 1 }} />
                                            <Typography>
                                                {dayjs(wishlist.createdAt).format(global.datetimeFormat)}
                                            </Typography>
                                        </Box>
                                        <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                                            {wishlist.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })
                }
            </Grid>
        </Box>
    );
}

export default Wishlists;
