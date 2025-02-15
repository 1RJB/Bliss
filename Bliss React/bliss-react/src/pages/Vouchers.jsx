import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, Input, IconButton, Button, Chip, Divider } from '@mui/material';
import { AccountCircle, AccessTime, Search, Clear, Edit, Delete, ShoppingCart, MonetizationOn, HourglassBottom } from '@mui/icons-material';
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
    };

    const onClickClear = () => {
        setSearch('');
        getVouchers();
    };

    // Define redeemVoucher function
    const redeemVoucher = (voucherId) => {
        http.post(`/voucher/redeem/${voucherId}`)
            .then((res) => {
                // Refresh the vouchers after redemption
                getVouchers();
                alert('Voucher redeemed successfully!');
            })
            .catch((err) => {
                console.error('Error redeeming voucher:', err);
                alert('Failed to redeem voucher!');
            });
    };

    const getVoucherColor = (voucherType) => {
        switch (voucherType) {
            case 0: return '#e3f2fd'; // Light Blue (Item Voucher)
            case 1: return '#fce4ec'; // Light Pink (Discount Voucher)
            case 2: return '#e8f5e9'; // Light Green (Gift Card Voucher)
            default: return '#ffffff'; // Default White
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 0: return "Available";
            case 1: return "Redeemed";
            case 3: return "Expired";
            default: return "Unknown";
        }
    };

    const getTimeRemaining = (createdAt, validDuration) => {
        const expiryDate = dayjs(createdAt).add(validDuration, 'day'); // Add valid days
        const today = dayjs();
        const diff = expiryDate.diff(today, 'day'); // Days remaining
        return diff;
    };

    const categorizeVouchers = () => {
        const categorized = {
            0: [],
            1: [],
            2: []
        };

        voucherList.forEach((voucher) => {
            if (categorized.hasOwnProperty(voucher.memberType)) {
                categorized[voucher.memberType].push(voucher);
            }
        });

        return categorized;
    };

    const categorizedVouchers = categorizeVouchers();

    const memberTypeTitles = {
        0: "Basic Members",
        1: "Green Members",
        2: "Premium Members"
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ my: 2 }}>
                Vouchers
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Input
                    value={search}
                    placeholder="Search"
                    onChange={onSearchChange}
                    onKeyDown={onSearchKeyDown}
                    sx={{ flexGrow: 1 }}
                />
                <IconButton color="primary" onClick={onClickSearch}>
                    <Search />
                </IconButton>
                <IconButton color="primary" onClick={onClickClear}>
                    <Clear />
                </IconButton>
                {user && (
                    <Link to="/addvoucher">
                        <Button variant='contained' sx={{ ml: 2 }}>Add Voucher</Button>
                    </Link>
                )}
            </Box>

            {Object.entries(categorizedVouchers).map(([memberType, vouchers]) => (
                vouchers.length > 0 && (
                    <Box key={memberType} sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                            {memberTypeTitles[memberType]}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Grid container spacing={3}>
                            {vouchers.map((voucher) => {
                                const daysRemaining = getTimeRemaining(voucher.createdAt, voucher.validDuration);
                                const isExpired = daysRemaining <= 0;

                                return (
                                    <Grid item xs={12} md={6} lg={4} key={voucher.id}>
                                        <Card sx={{ backgroundColor: getVoucherColor(voucher.voucherType), borderRadius: '12px', overflow: 'hidden' }}>
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
                                                    {user && user.id === voucher.userId && (
                                                        <Box>
                                                            <Link to={`/editvoucher/${voucher.id}`}>
                                                                <IconButton color="primary" sx={{ padding: '4px' }}>
                                                                    <Edit />
                                                                </IconButton>
                                                            </Link>
                                                            <IconButton color="secondary" sx={{ padding: '4px' }} onClick={() => deleteVoucher(voucher.id)}>
                                                                <Delete />
                                                            </IconButton>
                                                        </Box>
                                                    )}
                                                </Box>

                                                <Chip
                                                    label={getStatusText(voucher.status)}
                                                    color={voucher.status === 0 ? "success" : "default"}
                                                    sx={{ mb: 1 }}
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

                                                <Typography sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>{voucher.description}</Typography>

                                                <Button
                                                    variant="contained"
                                                    color={voucher.quantity === 0 ? "error" : "primary"}
                                                    disabled={voucher.quantity === 0}
                                                    onClick={() => redeemVoucher(voucher.id)}
                                                >
                                                    {voucher.quantity === 0 ? "Expired" : "Redeem"}
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
