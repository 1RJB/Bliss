import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Grid } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AddHomepage() {
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            welcomeMessage: "",
            featuredProducts: "",
            bannerImages: ""
        },
        validationSchema: yup.object({
            welcomeMessage: yup.string().trim()
                .min(3, 'Welcome Message must be at least 3 characters')
                .max(255, 'Welcome Message must be at most 255 characters')
                .required('Welcome Message is required'),
            featuredProducts: yup.string().trim()
                .min(3, 'Featured Products must be at least 3 characters')
                .max(500, 'Featured Products must be at most 500 characters')
                .required('Featured Products is required'),
            bannerImages: yup.string().trim()
                .min(3, 'Banner Images must be at least 3 characters')
                .max(500, 'Banner Images must be at most 500 characters')
                .required('Banner Images is required')
        }),
        onSubmit: (data) => {
            // Trim inputs before submitting
            data.welcomeMessage = data.welcomeMessage.trim();
            data.featuredProducts = data.featuredProducts.trim();
            data.bannerImages = data.bannerImages.trim();

            // Make API request to add homepage
            http.post("/homepage", data)
                .then((res) => {
                    toast.success("Homepage added successfully!");
                    navigate("/homepages");
                })
                .catch((error) => {
                    console.error("Error adding homepage:", error);
                    toast.error("Failed to add homepage. Please try again.");
                });
        }
    });

    return (
        <Box>
            <Typography variant="h5" sx={{ my: 2 }}>
                Add Homepage
            </Typography>
            <Box component="form" onSubmit={formik.handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            margin="dense"
                            autoComplete="off"
                            label="Welcome Message"
                            name="welcomeMessage"
                            value={formik.values.welcomeMessage}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.welcomeMessage && Boolean(formik.errors.welcomeMessage)}
                            helperText={formik.touched.welcomeMessage && formik.errors.welcomeMessage}
                        />
                        <TextField
                            fullWidth
                            margin="dense"
                            autoComplete="off"
                            multiline
                            minRows={2}
                            label="Featured Products"
                            name="featuredProducts"
                            value={formik.values.featuredProducts}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.featuredProducts && Boolean(formik.errors.featuredProducts)}
                            helperText={formik.touched.featuredProducts && formik.errors.featuredProducts}
                        />
                        <TextField
                            fullWidth
                            margin="dense"
                            autoComplete="off"
                            multiline
                            minRows={2}
                            label="Banner Images"
                            name="bannerImages"
                            value={formik.values.bannerImages}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.bannerImages && Boolean(formik.errors.bannerImages)}
                            helperText={formik.touched.bannerImages && formik.errors.bannerImages}
                        />
                    </Grid>
                </Grid>
                <Box sx={{ mt: 2 }}>
                    <Button variant="contained" type="submit">
                        Add
                    </Button>
                </Box>
            </Box>

            <ToastContainer />
        </Box>
    );
}

export default AddHomepage;
