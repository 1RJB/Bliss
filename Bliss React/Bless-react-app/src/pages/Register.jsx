import React from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Register() {
    const navigate = useNavigate();

    const validationSchema = yup.object({
        name: yup.string()
            .trim()
            .min(3, 'Name must be at least 3 characters')
            .max(50, 'Name must be at most 50 characters')
            .required('Name is required')
            .matches(/^[a-zA-Z '-,.]+$/, "Name only allows letters, spaces, and characters: ' - , ."),
        email: yup.string()
            .trim()
            .email('Enter a valid email')
            .max(50, 'Email must be at most 50 characters')
            .required('Email is required'),
        password: yup.string()
            .trim()
            .min(8, 'Password must be at least 8 characters')
            .max(50, 'Password must be at most 50 characters')
            .required('Password is required')
            .matches(/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/, "Password must contain at least 1 letter and 1 number"),
        confirmPassword: yup.string()
            .trim()
            .oneOf([yup.ref('password'), null], 'Passwords must match')
            .required('Confirm Password is required')
    });

    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        },
        validationSchema,
        onSubmit: async (data) => {
            // Trim and format input values
            const formattedData = {
                ...data,
                name: data.name.trim(),
                email: data.email.trim().toLowerCase(),
                password: data.password.trim(),
            };

            try {
                // Submit the form data
                await http.post("/user/register", formattedData);
                toast.success('Registration successful');
                navigate("/login");
            } catch (err) {
                // Handle errors from the server
                const errorMessage = err.response?.data?.message || "An unexpected error occurred.";
                toast.error(errorMessage);
            }
        }
    });

    return (
        <Box>
            <Typography variant="h5" sx={{ my: 2 }}>
                Register
            </Typography>
            <Box component="form" onSubmit={formik.handleSubmit}>
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
                    name="password"
                    type="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
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
                <Box sx={{ mt: 2 }}>
                    <Button variant="contained" type="submit">
                        Register
                    </Button>
                </Box>
            </Box>

            <ToastContainer />
        </Box>
    );
}

export default Register;
