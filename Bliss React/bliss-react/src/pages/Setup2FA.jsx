import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, TextField } from '@mui/material';
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
        const token = localStorage.getItem('accessToken');
        if (!token) {
            navigate('/login');
            return;
        }

        http.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        http.post('/user/setup-2fa')
            .then((res) => {
                setOtpauthUrl(res.data.otpauthUrl);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Setup 2FA Error:', err);
                toast.error(err.response?.data?.message || 'Failed to setup 2FA.');
                if (err.response?.status === 401) {
                    localStorage.removeItem('accessToken');
                    navigate('/login');
                }
                setLoading(false);
            });
    }, [navigate]);

    const handleVerify = () => {
        const trimmedCode = code.trim();
        if (!trimmedCode || trimmedCode.length !== 6) {
            toast.error('Please enter a valid 6-digit code');
            return;
        }

        const token = localStorage.getItem('accessToken');
        if (!token) {
            navigate('/login');
            return;
        }

        http.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Log the request for debugging
        console.log('Sending verification request with code:', trimmedCode);

        http.post('/user/verify-2fa', { code: trimmedCode })
            .then((res) => {
                toast.success(res.data.message || '2FA setup successful.');
                navigate('/');
            })
            .catch((err) => {
                console.error('Verify 2FA Error:', err);
                console.error('Response:', err.response);
                toast.error(err.response?.data?.message || 'Invalid 2FA code.');
                if (err.response?.status === 401) {
                    localStorage.removeItem('accessToken');
                    navigate('/login');
                }
            });
    };

    const handleCodeChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setCode(value);
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
                    <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
                        1. Install an authenticator app like Google Authenticator or Microsoft Authenticator
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
                        2. Scan the QR code with your authenticator app:
                    </Typography>
                    <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(otpauthUrl)}&size=200x200`}
                        alt="QR Code"
                        style={{ marginBottom: '20px' }}
                    />
                    <Typography variant="body1" sx={{ mt: 2, mb: 1, textAlign: 'center' }}>
                        3. Enter the 6-digit code from your authenticator app:
                    </Typography>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="2FA Code"
                        value={code}
                        onChange={handleCodeChange}
                        sx={{ maxWidth: '300px' }}
                        inputProps={{
                            inputMode: 'numeric',
                            pattern: '[0-9]*',
                            maxLength: 6,
                            style: { letterSpacing: '0.5em' }
                        }}
                    />
                    <Button
                        variant="contained"
                        sx={{ mt: 2 }}
                        onClick={handleVerify}
                        disabled={code.length !== 6}
                    >
                        Verify and Enable 2FA
                    </Button>
                </>
            )}
            <ToastContainer />
        </Box>
    );
}

export default Setup2FA;