import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, Input, IconButton, Button, Chip, Divider } from '@mui/material';
import { Search, Clear, Edit, Delete, ShoppingCart, MonetizationOn, HourglassBottom } from '@mui/icons-material';
import http from '../http';
import dayjs from 'dayjs';
import UserContext from '../contexts/UserContext';

function Vouchers() {
    const [voucherList, setVoucherList] = useState([]);
    const [search, setSearch] = useState('');
    const { user } = useContext(UserContext);

    const onSearchChange = (e) => setSearch(e.target.value);

    // ✅ Use useCallback to prevent infinite re-fetching
    const getVouchers = useCallback(() => {
        http.get('/voucher')
            .then((res) => setVoucherList(res.data))
            .catch((err) => console.error("Error fetching vouchers:", err));
    }, []);

    const searchVouchers = () => {
        http.get(`/voucher?search=${search}`)
            .then((res) => setVoucherList(res.data))
            .catch((err) => console.error("Error searching vouchers:", err));
    };

    const deleteVoucher = (id) => {
        http.delete(`/voucher/${id}`)
            .then(() => getVouchers())
            .catch((err) => console.error('Error deleting voucher:', err));
    };

    useEffect(() => {
        getVouchers();
    }, [getVouchers]);

    const onSearchKeyDown = (e) => {
        if (e.key === "Enter") searchVouchers();
    };

    const onClickSearch = () => searchVouchers();

    const onClickClear = () => {
        setSearch('');
        getVouchers();
    };

    const redeemVoucher = (voucherId) => {
        http.post(`/uservoucher/redeem/${voucherId}`)
            .then(() => {
                getVouchers();
                alert('Voucher redeemed successfully!');
            })
            .catch((err) => {
                console.error('Error redeeming voucher:', err);
                alert('Failed to redeem voucher!');
            });
    };

    const getStatusText = (status) => {
        switch (status) {
            case 0: return "Available";
            case 1: return "Redeemed";
            case 2: return "Expired";
            default: return "Unknown";
        }
    };

    const getTimeRemaining = (validTill) => {
        const expiryDate = dayjs(validTill);
        const today = dayjs();
        return expiryDate.diff(today, 'day');
    };

    const categorizeVouchers = () => {
        const categorized = { 0: [], 1: [], 2: [] };
        voucherList.forEach((voucher) => {
            if (categorized.hasOwnProperty(voucher.memberType)) {
                categorized[voucher.memberType].push(voucher);
            }
        });
        return categorized;
    };

    // useEffect: Update voucher status to Expired if necessary.
    useEffect(() => {
        voucherList.forEach((voucher) => {
            const daysRemaining = getTimeRemaining(voucher.validTill);
            const isExpired = daysRemaining <= 0;
            if (isExpired && voucher.status !== 2) {
                http.patch(`/voucher/${voucher.id}`, { status: 2 })
                    .then(() => getVouchers())
                    .catch((err) => console.error("Error updating voucher to expired:", err));
            }
        });
    }, [voucherList, getVouchers]);

    const categorizedVouchers = categorizeVouchers();
    const memberTypeTitles = { 0: "Basic Members", 1: "Green Members", 2: "Premium Members" };

    return (
        <Box>
            <Typography variant="h5" sx={{ my: 2 }}>Vouchers</Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Input
                    value={search}
                    placeholder="Search"
                    onChange={onSearchChange}
                    onKeyDown={onSearchKeyDown}
                    sx={{ flexGrow: 1 }}
                />
                <IconButton color="primary" onClick={onClickSearch}><Search /></IconButton>
                <IconButton color="primary" onClick={onClickClear}><Clear /></IconButton>
            </Box>

            {Object.entries(categorizedVouchers).map(([memberType, vouchers]) => (
                vouchers.length > 0 && (
                    <Box key={memberType} sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>{memberTypeTitles[memberType]}</Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Grid container spacing={3}>
                            {vouchers.map((voucher) => {
                                const daysRemaining = getTimeRemaining(voucher.validTill);
                                const isExpired = daysRemaining <= 0;

                                return (
                                    <Grid item xs={12} md={6} lg={4} key={voucher.id}>
                                        <Card sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                                            {voucher.imageFile && (
                                                <Box className="aspect-ratio-container">
                                                    <img
                                                        alt="voucher"
                                                        src={`${import.meta.env.VITE_FILE_BASE_URL}${voucher.imageFile}`}
                                                        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                                                    />
                                                </Box>
                                            )}
                                            <CardContent>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{voucher.title}</Typography>
                                                    {(user?.role === 'admin' || user?.role === 'staff') && (
                                                        <Box>
                                                            <Link to={`/editvoucher/${voucher.id}`}>
                                                                <IconButton color="primary">
                                                                    <Edit />
                                                                </IconButton>
                                                            </Link>
                                                            <IconButton color="secondary" onClick={() => deleteVoucher(voucher.id)}>
                                                                <Delete />
                                                            </IconButton>
                                                        </Box>
                                                    )}
                                                </Box>
                                                <Chip
                                                    label={`$${voucher.value} off your next purchase`}
                                                    color="primary"
                                                    sx={{
                                                        mb: 1,
                                                        fontSize: '1.25rem',
                                                        height: '48px',
                                                        padding: '0 16px',
                                                        borderRadius: '8px'
                                                    }}
                                                />

                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }} color="text.secondary">
                                                    <MonetizationOn sx={{ mr: 1 }} />
                                                    <Typography>Cost: {voucher.cost} points</Typography>
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }} color="text.secondary">
                                                    <ShoppingCart sx={{ mr: 1 }} />
                                                    <Typography>Quantity: {voucher.quantity}</Typography>
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }} color="text.secondary">
                                                    <HourglassBottom sx={{ mr: 1 }} />
                                                    <Typography>{isExpired ? "Expired" : `${daysRemaining} days remaining`}</Typography>
                                                </Box>

                                                <Button
                                                    variant="contained"
                                                    color={voucher.status === 0 ? "success" : "default"}
                                                    disabled={voucher.status !== 0}
                                                    onClick={() => redeemVoucher(voucher.id)}
                                                >
                                                    {voucher.status !== 0 ? "Not Available" : "Redeem"}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Box>
                )
            ))}
        </Box>
    );
}

export default Vouchers;
