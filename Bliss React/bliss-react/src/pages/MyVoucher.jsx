import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import http from "../http";
import dayjs from "dayjs";

function MyVouchers() {
    const [myVouchers, setMyVouchers] = useState([]);

    useEffect(() => {
        http.get("/uservoucher") // Fetch user's redeemed vouchers
            .then((res) => {
                setMyVouchers(res.data);
            })
            .catch((err) => {
                console.error("Error fetching vouchers:", err);
            });
    }, []);

    return (
        <Box>
            <Typography variant="h5" sx={{ my: 2 }}>
                My Redeemed Vouchers
            </Typography>

            {/* Check if no vouchers are found */}
            {myVouchers.length === 0 ? (
                <Typography variant="body1" sx={{ my: 2 }}>
                    You have no vouchers.
                </Typography>
            ) : (
                <Grid container spacing={2}>
                    {myVouchers.map((voucher) => (
                        <Grid item xs={12} md={6} lg={4} key={voucher.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">{voucher.voucher.title}</Typography>
                                    <Typography>Redeemed on: {dayjs(voucher.redeemedAt).format("YYYY-MM-DD")}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}

export default MyVouchers;
