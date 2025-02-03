import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Grid2 as Grid, Card, CardContent, Input, IconButton, Button } from '@mui/material';
import { AccountCircle, AccessTime, Search, Clear, Edit, Delete } from '@mui/icons-material';
import http from '../http';
import dayjs from 'dayjs';
import UserContext from '../contexts/UserContext';
import global from '../global';

function Vouchers() {
    const [voucherList, setVoucherList] = useState([]);
    const [search, setSearch] = useState('');
    const { user } = useContext(UserContext);

    const onSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const getVouchers = () => {
        http.get('/voucher').then((res) => {
            setVoucherList(res.data);
        });
    };

    const searchVouchers = () => {
        http.get(`/voucher?search=${search}`).then((res) => {
            setVoucherList(res.data);
        });
    };

    const deleteVoucher = (id) => {
        http.delete(`/voucher/${id}`).then(() => {
            getVouchers();
        }).catch((err) => {
            console.error('Error deleting voucher:', err);
        });
    };

    useEffect(() => {
        getVouchers();
    }, []);

    const onSearchKeyDown = (e) => {
        if (e.key === "Enter") {
            searchVouchers();
        }
    };

    const onClickSearch = () => {
        searchVouchers();
    }

    const onClickClear = () => {
        setSearch('');
        getVouchers();
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ my: 2 }}>
                Vouchers
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
                        <Link to="/addvoucher">
                            <Button variant='contained'>
                                Add
                            </Button>
                        </Link>
                    )
                }
            </Box>

            <Grid container spacing={2}>
                {
                    voucherList.map((voucher, i) => {
                        return (
                            <Grid item xs={12} md={6} lg={4} key={voucher.id}>
                                <Card>
                                    {
                                        voucher.imageFile && (
                                            <Box className="aspect-ratio-container">
                                                <img alt="voucher"
                                                    src={`${import.meta.env.VITE_FILE_BASE_URL}${voucher.imageFile}`}>
                                                </img>
                                            </Box>
                                        )
                                    }
                                    <CardContent>
                                        <Box sx={{ display: 'flex', mb: 1 }}>
                                            <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                                {voucher.title}
                                            </Typography>
                                            {
                                                user && user.id === voucher.userId && (
                                                    <>
                                                        <Link to={`/editvoucher/${voucher.id}`}>
                                                            <IconButton color="primary" sx={{ padding: '4px' }}>
                                                                <Edit />
                                                            </IconButton>
                                                        </Link>
                                                        <IconButton color="secondary" sx={{ padding: '4px' }} onClick={() => deleteVoucher(voucher.id)}>
                                                            <Delete />
                                                        </IconButton>
                                                    </>
                                                )
                                            }
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                                            color="text.secondary">
                                            <AccountCircle sx={{ mr: 1 }} />
                                            <Typography>
                                                {voucher.user?.name}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                                            color="text.secondary">
                                            <AccessTime sx={{ mr: 1 }} />
                                            <Typography>
                                                {dayjs(voucher.createdAt).format(global.datetimeFormat)}
                                            </Typography>
                                        </Box>
                                        <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                                            {voucher.description}
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

export default Vouchers;