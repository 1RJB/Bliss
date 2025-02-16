import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent, CardMedia } from "@mui/material";
import http from "../http";
import dayjs from "dayjs";

function MyVouchers() {
  const [myVouchers, setMyVouchers] = useState([]);

  useEffect(() => {
    http.get("/uservoucher/seemyvouchers") // Fetch current user's vouchers
      .then((res) => setMyVouchers(res.data))
      .catch((err) => console.error("Error fetching vouchers:", err));
  }, []);

  // Calculate days remaining using the validTill field
  const getTimeRemaining = (validTill) => {
    const expiryDate = dayjs(validTill);
    const today = dayjs();
    return expiryDate.diff(today, "day");
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ my: 2 }}>
        My Redeemed Vouchers
      </Typography>

      {myVouchers.length === 0 ? (
        <Typography variant="body1" sx={{ my: 2 }}>
          You have no vouchers.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {myVouchers.map((voucher) => {
            const daysRemaining = getTimeRemaining(voucher.validTill);
            const isExpired = daysRemaining <= 0;
            return (
              <Grid item xs={12} md={6} lg={4} key={voucher.id}>
                <Card sx={{ borderRadius: "12px", overflow: "hidden" }}>
                  {voucher.imageFile && (
                    <CardMedia
                      component="img"
                      height="150"
                      image={`${import.meta.env.VITE_FILE_BASE_URL}${voucher.imageFile}`}
                      alt={voucher.title}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                      {voucher.title || "Unknown Voucher"}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Redeemed on: {dayjs(voucher.claimedAt).format("YYYY-MM-DD")}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Code: {voucher.code}
                    </Typography>
                    <Typography variant="body2">
                      {isExpired
                        ? "Expired"
                        : `Expires in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}

export default MyVouchers;
