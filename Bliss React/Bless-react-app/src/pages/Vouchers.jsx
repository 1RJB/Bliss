import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Input, IconButton, Button } from '@mui/material';
import { AttachMoney, CalendarToday, AccessTime, Search, Clear, Edit, Delete, HourglassEmpty, ConfirmationNumber } from '@mui/icons-material';
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

    // Function to categorize vouchers by member type
    const categorizeVouchers = (vouchers) => {
        const categories = { Basic: [], Green: [], Premium: [] };
        vouchers.forEach((voucher) => {
            if (voucher.memberType === 0) categories.Basic.push(voucher);
            if (voucher.memberType === 1) categories.Green.push(voucher);
            if (voucher.memberType === 2) categories.Premium.push(voucher);
        });
        return categories;
    };

    const categorizedVouchers = categorizeVouchers(voucherList);

    // Function to calculate remaining days
    const getRemainingDays = (createdAt, validDuration) => {
        const createdDate = dayjs(createdAt);
        const expiryDate = createdDate.add(validDuration, 'days');
        return expiryDate.diff(dayjs(), 'days');
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

            {/* Displaying categorized vouchers */}
            {Object.keys(categorizedVouchers).map((memberType) => (
                <Box key={memberType} sx={{ my: 4 }}>
                    <Typography variant="h6" sx={{ my: 2 }}>
                        {memberType} Vouchers
                    </Typography>

                    {/* Display vouchers for each member type */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {
                            categorizedVouchers[memberType].map((voucher) => {
                                let voucherColor = '#000';
                                let backgroundColor = '#fff';
                                switch (voucher.voucherType) {
                                    case 0:
                                        voucherColor = 'green';
                                        backgroundColor = 'rgba(0, 128, 0, 0.1)'; // Light green background
                                        break;
                                    case 1:
                                        voucherColor = 'blue';
                                        backgroundColor = 'rgba(0, 0, 255, 0.1)'; // Light blue background
                                        break;
                                    case 2:
                                        voucherColor = 'purple';
                                        backgroundColor = 'rgba(128, 0, 128, 0.1)'; // Light purple background
                                        break;
                                    default:
                                        voucherColor = '#000';
                                        backgroundColor = '#fff';
                                }

                                return (
                                    <Box key={voucher.id} sx={{
                                        width: { xs: '100%', md: '48%', lg: '30%' },
                                        marginBottom: '16px',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}>
                                        <Card sx={{ 
                                            height: '100%', 
                                            backgroundColor: backgroundColor,
                                            border: `2px dashed ${voucherColor}`,
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}>
                                            {
                                                voucher.imageFile && (
                                                    <Box className="aspect-ratio-container">
                                                        <img alt="voucher"
                                                            src={`${import.meta.env.VITE_FILE_BASE_URL}${voucher.imageFile}`}
                                                            style={{
                                                                width: '100%',
                                                                height: '200px',
                                                                objectFit: 'cover',
                                                            }} />
                                                    </Box>
                                                )
                                            }
                                            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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

                                                {/* Cost */}
                                                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                                    <AttachMoney sx={{ mr: 1 }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        Cost: ${voucher.cost}
                                                    </Typography>
                                                </Box>

                                                {/* Quantity with its own line and icon */}
                                                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                                    <ConfirmationNumber sx={{ mr: 1 }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        Quantity: {voucher.quantity}
                                                    </Typography>
                                                </Box>

                                                {/* Remaining Days */}
                                                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                                    <HourglassEmpty sx={{ mr: 1 }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        Remaining Days: {getRemainingDays(voucher.createdAt, voucher.validDuration)}
                                                    </Typography>
                                                </Box>

                                                {/* Voucher Type with color */}
                                                <Typography sx={{
                                                    mb: 1,
                                                    color: voucherColor,
                                                    fontWeight: 'bold',
                                                    textAlign: 'center',
                                                    backgroundColor: `${voucherColor}20`, // Background color with some opacity
                                                    padding: '2px',
                                                    borderRadius: '4px'
                                                }}>
                                                    {voucher.voucherType === 0 && 'Item Voucher'}
                                                    {voucher.voucherType === 1 && 'Discount Voucher'}
                                                    {voucher.voucherType === 2 && 'Gift Card Voucher'}
                                                </Typography>

                                                {/* Status Button */}
                                                <Button variant="outlined" sx={{
                                                    mb: 1,
                                                    backgroundColor: voucher.status === 0 ? 'green' : voucher.status === 1 ? 'grey' : 'grey',
                                                    color: 'white',
                                                    width: '100%',
                                                    borderRadius: '4px'
                                                }}>
                                                    {voucher.status === 0 && 'Available'}
                                                    {voucher.status === 1 && 'Redeemed'}
                                                    {voucher.status === 2 && 'Expired'}
                                                </Button>

                                                {/* Extra Information based on Voucher Type */}
                                                {voucher.voucherType === 0 && (
                                                    <Box sx={{ mb: 1 }}>
                                                        <Typography variant="body2">
                                                            <strong>Item Name:</strong> {voucher.itemName}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            <strong>Item Quantity:</strong> {voucher.itemQuantity}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {voucher.voucherType === 1 && (
                                                    <Box sx={{ mb: 1 }}>
                                                        <Typography variant="body2">
                                                            <strong>Discount Percentage:</strong> {voucher.discountPercentage}%
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            <strong>Max Amount:</strong> ${voucher.maxAmount}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {voucher.voucherType === 2 && (
                                                    <Box sx={{ mb: 1 }}>
                                                        <Typography variant="body2">
                                                            <strong>Voucher Value:</strong> ${voucher.value}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Box>
                                );
                            })
                        }
                    </Box>
                </Box>
            ))}
        </Box>
    );
}

export default Vouchers;