import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function Register() {
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpDisabled, setOtpDisabled] = useState(false);

    const sendOtp = async (email) => {
        try {
            const response = await http.post(`/user/send-otp?email=${email}`);
            setOtpSent(true); // Set otpSent to true after successfully sending OTP
            toast.success('OTP sent successfully.');
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    const verifyOtp = async (email, otp) => {
        try {
            const response = await http.post(`/user/verify-otp?email=${email}&otp=${otp}`);
            toast.success('OTP verified successfully.');
            setOtpVerified(true);
            setOtpDisabled(false); // Set otpDisabled to false after successfully verifying OTP
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            otp: ""
        },
        validationSchema: yup.object({
            name: yup.string().trim()
                .min(3, 'Name must be at least 3 characters')
                .max(50, 'Name must be at most 50 characters')
                .required('Name is required')
                .matches(/^[a-zA-Z '-,.]+$/,
                    "Name only allow letters, spaces and characters: ' - , ."),
            email: yup.string().trim()
                .email('Enter a valid email')
                .max(50, 'Email must be at most 50 characters')
                .required('Email is required'),
            password: yup.string().trim()
                .min(8, 'Password must be at least 8 characters')
                .max(50, 'Password must be at most 50 characters')
                .required('Password is required')
                .matches(/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/,
                    "Password at least 1 letter and 1 number"),
            confirmPassword: yup.string().trim()
                .required('Confirm password is required')
                .oneOf([yup.ref('password')], 'Passwords must match'),
            otp: yup.string()
                .required('OTP is required')
                .length(6, 'OTP must be 6 digits')
        }),
        onSubmit: (data) => {
            if (!otpVerified) {
                toast.error('Please verify your OTP first.');
                return;
            }
            data.name = data.name.trim();
            data.email = data.email.trim().toLowerCase();
            data.password = data.password.trim();
            http.post("/user/register", data)
                .then((res) => {
                    toast.success('Registration successful!');
                    navigate("/login");
                })
                .catch(function (err) {
                    toast.error(`${err.response.data.message}`);
                });
        }
    });

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
                <Typography variant="h5" sx={{ my: 2 }}>
                    Register
                </Typography>
                <Box component="form" sx={{ maxWidth: '500px' }}
                    onSubmit={formik.handleSubmit}>
                    <TextField
                        fullWidth margin="dense" autoComplete="off"
                        label="Name"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        helperText={formik.touched.name && formik.errors.name}
                    />
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
                    <TextField
                        fullWidth margin="dense" autoComplete="off"
                        label="Confirm Password"
                        name="confirmPassword" type="password"
                        value={formik.values.confirmPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                        helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                    />
                    <TextField
                        fullWidth
                        margin="dense"
                        label="OTP"
                        name="otp"
                        value={formik.values.otp}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.otp && Boolean(formik.errors.otp)}
                        helperText={formik.touched.otp && formik.errors.otp}
                        disabled={otpDisabled}
                    />
                    {!otpSent && (
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => sendOtp(formik.values.email)}
                        >
                            Send OTP
                        </Button>
                    )}
                    {otpSent && !otpVerified && (
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => verifyOtp(formik.values.email, formik.values.otp)}
                        >
                            Verify OTP
                        </Button>
                    )}
                    <Button
                        fullWidth
                        variant="contained"
                        type="submit"
                        disabled={!otpVerified}
                        sx={{ mt: 2 }}
                    >
                        Register
                    </Button>
                </Box>
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleFailure}
                />
                <ToastContainer />
            </Box>
        </GoogleOAuthProvider>
    );
}

export default Register;