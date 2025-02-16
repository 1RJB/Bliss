import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HCaptcha from '@hcaptcha/react-hcaptcha';

function ForgotPassword() {
    const [captchaToken, setCaptchaToken] = useState('');

    const formik = useFormik({
        initialValues: {
            email: ""
        },
        validationSchema: yup.object({
            email: yup.string().trim()
                .email('Enter a valid email')
                .max(50, 'Email must be at most 50 characters')
                .required('Email is required')
        }),
        onSubmit: (data) => {
            if (!captchaToken) {
                toast.error('Please complete CAPTCHA');
                return;
            }
            data.email = data.email.trim().toLowerCase();
            http.post("/user/forgot-password", { ...data, captchaToken })
                .then((res) => {
                    toast.success(res.data.message);
                    formik.resetForm();
                })
                .catch(function (err) {
                    toast.error(err.response?.data?.message || 'An error occurred');
                });
        }
    });

    const handleCaptchaChange = (token) => {
        setCaptchaToken(token);
    };

    return (
        <Box sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <Typography variant="h5" sx={{ my: 2 }}>
                Forgot Password
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
                Enter your email address and we'll send you a link to reset your password.
            </Typography>
            <Box component="form" sx={{ maxWidth: '500px' }}
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
                <Button fullWidth variant="contained" sx={{ mt: 2 }}
                    type="submit">
                    Send Reset Link
                </Button>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <HCaptcha
                        sitekey="37e48d3a-ecc6-4396-9e5e-6494d8026822"
                        onVerify={handleCaptchaChange}
                    />
                </Box>
            </Box>
            <ToastContainer />
        </Box>
    );
}

export default ForgotPassword;