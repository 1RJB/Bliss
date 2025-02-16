import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import http from '../http';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Setup2FA() {
    const [otpauthUrl, setOtpauthUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        http.post('/user/setup-2fa')
            .then((res) => {
                setOtpauthUrl(res.data.otpauthUrl);
                setLoading(false);
            })
            .catch(() => {
                toast.error('Failed to setup 2FA.');
                setLoading(false);
            });
    }, []);

    const handleVerify = () => {
        http.post('/user/verify-2fa', { code })
            .then(() => {
                toast.success('2FA setup successful.');
                navigate('/');
            })
            .catch(() => {
                toast.error('Invalid 2FA code.');
            });
    };

    return (
        <Box sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            {loading ? (
                <CircularProgress />
            ) : (
                <>
                    <Typography variant="h5" sx={{ my: 2 }}>
                        Setup Two-Factor Authentication
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Scan the QR code with your authenticator app:
                    </Typography>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(otpauthUrl)}&size=200x200`} alt="QR Code" />
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        Enter the code from your authenticator app:
                    </Typography>
                    <TextField
                        fullWidth
                        margin="dense"
                        label="2FA Code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 2 }}
                        onClick={handleVerify}
                    >
                        Verify
                    </Button>
                </>
            )}
            <ToastContainer />
        </Box>
    );
}

export default Setup2FA;