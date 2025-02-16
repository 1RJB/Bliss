import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HCaptcha from '@hcaptcha/react-hcaptcha';

function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [captchaToken, setCaptchaToken] = useState('');
    const token = searchParams.get('token');

    const formik = useFormik({
        initialValues: {
            newPassword: "",
            confirmPassword: ""
        },
        validationSchema: yup.object({
            newPassword: yup.string().trim()
                .min(8, 'Password must be at least 8 characters')
                .max(50, 'Password must be at most 50 characters')
                .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
                .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
                .matches(/[0-9]/, 'Password must contain at least one number')
                .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
                .required('Password is required'),
            confirmPassword: yup.string()
                .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
                .required('Confirm password is required')
        }),
        onSubmit: (data) => {
            if (!captchaToken) {
                toast.error('Please complete CAPTCHA');
                return;
            }
            if (!token) {
                toast.error('Reset token is missing');
                return;
            }
            http.post("/user/reset-password", {
                resetToken: token,
                newPassword: data.newPassword.trim(),
                captchaToken
            })
                .then((res) => {
                    toast.success(res.data.message);
                    setTimeout(() => {
                        navigate("/login");
                    }, 2000);
                })
                .catch(function (err) {
                    toast.error(err.response?.data?.message || 'An error occurred');
                });
        }
    });

    const handleCaptchaChange = (token) => {
        setCaptchaToken(token);
    };

    if (!token) {
        return (
            <Box sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <Typography variant="h5" color="error">
                    Invalid reset link
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <Typography variant="h5" sx={{ my: 2 }}>
                Reset Password
            </Typography>
            <Box component="form" sx={{ maxWidth: '500px' }}
                onSubmit={formik.handleSubmit}>
                <TextField
                    fullWidth margin="dense" autoComplete="off"
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={formik.values.newPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                    helperText={formik.touched.newPassword && formik.errors.newPassword}
                />
                <TextField
                    fullWidth margin="dense" autoComplete="off"
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                    helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                />
                <Button fullWidth variant="contained" sx={{ mt: 2 }}
                    type="submit">
                    Reset Password
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

export default ResetPassword;