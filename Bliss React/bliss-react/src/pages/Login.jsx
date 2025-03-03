import React, { useContext, useState } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserContext from '../contexts/UserContext';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function Login() {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);
    const [captchaToken, setCaptchaToken] = useState('');

    const formik = useFormik({
        initialValues: {
            email: "",
            password: ""
        },
        validationSchema: yup.object({
            email: yup.string().trim()
                .email('Enter a valid email')
                .max(50, 'Email must be at most 50 characters')
                .required('Email is required'),
            password: yup.string().trim()
                .min(8, 'Password must be at least 8 characters')
                .max(50, 'Password must be at most 50 characters')
                .required('Password is required')
        }),
        onSubmit: (data) => {
            if (!captchaToken) {
                toast.error('Please complete CAPTCHA');
                return;
            }
            data.email = data.email.trim().toLowerCase();
            data.password = data.password.trim();
            
            http.post("/user/login", { ...data, captchaToken })
                .then((res) => {
                    localStorage.setItem("accessToken", res.data.accessToken);
                    setUser(res.data.user);
        
                    if (res.data.requires2FASetup) {
                        http.defaults.headers.common['Authorization'] = `Bearer ${res.data.accessToken}`;
                        navigate("/setup-2fa");
                    } else if (res.data.requires2FA) {
                        // Change from /verify-2fa to /verify-2fa-login
                        navigate("/verify-2fa-login", { state: { email: data.email } });
                    } else {
                        navigate("/");
                    }
                })
                .catch(function (err) {
                    toast.error(`${err.response?.data?.message}`);
                });
        }
    });

    const handleCaptchaChange = (token) => {
        setCaptchaToken(token);
    };

    const handleGoogleSuccess = (response) => {
        const idToken = response.credential;
        http.post("/user/google-signin", { idToken })
            .then((res) => {
                localStorage.setItem("accessToken", res.data.accessToken);
                setUser(res.data.user);
                navigate("/");
            })
            .catch((err) => {
                toast.error(`${err.response.data.message}`);
            });
    };

    const handleGoogleFailure = (response) => {
        toast.error('Google sign-in failed');
    };

    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <Box sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <Paper elevation={3} sx={{ padding: 4, maxWidth: 550, width: '100%' }}>
                    <Typography variant="h5" sx={{ my: 2, textAlign: 'center' }}>
                        Login
                    </Typography>
                    <Box component="form" sx={{ mt: 1 }}
                        onSubmit={formik.handleSubmit}>
                        <TextField
                            fullWidth margin="dense" autoComplete="off"
                            label="Email"
                            name="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                        />
                        <TextField
                            fullWidth margin="dense" autoComplete="off"
                            label="Password"
                            name="password" type="password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                        />
                        <Button fullWidth variant="contained" sx={{ mt: 2 }}
                            type="submit">
                            Login
                        </Button>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <HCaptcha
                                sitekey="37e48d3a-ecc6-4396-9e5e-6494d8026822"
                                onVerify={handleCaptchaChange}
                            />
                        </Box>
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                                <Typography color="primary">
                                    Forgot Password?
                                </Typography>
                            </Link>
                        </Box>
                    </Box>
                </Paper>
                <Box sx={{ mt: 6, textAlign: 'center', justifyContent: 'center', display: 'flex' }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleFailure}
                    />
                </Box>
                <ToastContainer />
            </Box>
        </GoogleOAuthProvider>
    );
}

export default Login;