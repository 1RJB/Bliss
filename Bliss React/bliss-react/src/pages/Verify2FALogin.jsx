import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import http from '../http';

function Verify2FALogin() {
    const [code, setCode] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    // Redirect to login if no email is provided
    React.useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    const handleCodeChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setCode(value);
    };

    const handleVerify = () => {
        if (!code.trim() || code.length !== 6) {
            toast.error('Please enter a valid 6-digit code');
            return;
        }

        http.post('/user/verify-2fa-login', { 
            email: email,
            code: code.trim() 
        })
            .then((res) => {
                localStorage.setItem('accessToken', res.data.accessToken);
                if (res.data.user) {
                    localStorage.setItem('user', JSON.stringify(res.data.user));
                }
                toast.success('Login successful');
                navigate('/');
            })
            .catch((err) => {
                console.error('2FA Login Verification Error:', err);
                toast.error(err.response?.data?.message || 'Invalid 2FA code');
            });
    };

    return (
        <Box sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <Paper elevation={3} sx={{ padding: 4, maxWidth: 400, width: '100%' }}>
                <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
                    Two-Factor Authentication
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
                    Enter the 6-digit code from your authenticator app
                </Typography>
                <TextField
                    fullWidth
                    margin="normal"
                    label="Authentication Code"
                    value={code}
                    onChange={handleCodeChange}
                    inputProps={{
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                        maxLength: 6,
                        style: { letterSpacing: '0.5em' }
                    }}
                    autoFocus
                />
                <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3 }}
                    onClick={handleVerify}
                    disabled={code.length !== 6}
                >
                    Verify and Login
                </Button>
            </Paper>
            <ToastContainer />
        </Box>
    );
}

export default Verify2FALogin;