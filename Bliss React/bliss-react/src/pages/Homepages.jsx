import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, Input, IconButton, Button } from '@mui/material';
import { AccessTime, Search, Clear, Add } from '@mui/icons-material';
import http from '../http';
import dayjs from 'dayjs';
import UserContext from '../contexts/UserContext';

function Homepages() {
    const [homepageList, setHomepageList] = useState([]);
    const [search, setSearch] = useState('');
    const { user } = useContext(UserContext);

    const onSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const getHomepages = () => {
        http.get('/homepage').then((res) => {
            setHomepageList(res.data);
        });
    };

    const searchHomepages = () => {
        http.get(`/homepage?search=${search}`).then((res) => {
            setHomepageList(res.data);
        });
    };

    useEffect(() => {
        getHomepages();
    }, []);

    const onSearchKeyDown = (e) => {
        if (e.key === "Enter") {
            searchHomepages();
        }
    };

    const onClickSearch = () => {
        searchHomepages();
    };

    const onClickClear = () => {
        setSearch('');
        getHomepages();
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ my: 2, color: 'primary.main', textAlign: 'center' }}>
                Homepages
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'center' }}>
                <Input
                    value={search}
                    placeholder="Search"
                    onChange={onSearchChange}
                    onKeyDown={onSearchKeyDown}
                    sx={{
                        borderRadius: '4px',
                        padding: '8px',
                        border: '1px solid',
                        borderColor: 'secondary.main',
                    }}
                />
                <IconButton color="primary" onClick={onClickSearch} sx={{ ml: 1 }}>
                    <Search />
                </IconButton>
                <IconButton color="primary" onClick={onClickClear} sx={{ ml: 1 }}>
                    <Clear />
                </IconButton>
                <Link to="/addhomepage" style={{ textDecoration: 'none', marginLeft: 'auto' }}>
                    <Button variant="contained" startIcon={<Add />} color="secondary">
                        Add Homepage
                    </Button>
                </Link>
            </Box>

            <Grid container spacing={3}>
                {homepageList.map((homepage, i) => (
                    <Grid item xs={12} md={6} lg={4} key={homepage.homepageId}>
                        <Link to={`/edithomepage/${homepage.homepageId}`} style={{ textDecoration: 'none' }}>
                            <Card
                                sx={{
                                    backgroundColor: 'background.paper',
                                    color: 'text.primary',
                                    borderRadius: '8px',
                                    transition: 'transform 0.3s',
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                    },
                                }}
                            >
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                        {homepage.welcomeMessage}
                                    </Typography>
                                    <Typography color="text.secondary" sx={{ mb: 1 }}>
                                        Featured Products: {homepage.featuredProducts}
                                    </Typography>
                                    <Typography color="text.secondary" sx={{ mb: 1 }}>
                                        Banner Images: {homepage.bannerImages}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }} color="text.secondary">
                                        <AccessTime sx={{ mr: 1 }} />
                                        <Typography>
                                            Created At: {dayjs(homepage.createdAt).format('YYYY-MM-DD HH:mm')}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }} color="text.secondary">
                                        <Typography>
                                            Updated At: {dayjs(homepage.updatedAt).format('YYYY-MM-DD HH:mm')}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Link>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default Homepages;
