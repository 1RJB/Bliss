import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Grid } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import http from '../http';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function EditHomepage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        http.get(`/homepage/${id}`).then((res) => {
            setHomepage(res.data);
            setLoading(false);
        }).catch((error) => {
            console.error("Error fetching homepage data:", error);
            toast.error("Failed to fetch homepage data.");
            navigate("/homepages");
        });
    }, [id]);

    const [homepage, setHomepage] = useState({
        welcomeMessage: "",
        featuredProducts: "",
        bannerImages: ""
    });

    const formik = useFormik({
        initialValues: homepage,
        enableReinitialize: true, // Reinitialize when data is fetched
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

            // Make API call to update homepage
            http.put(`/homepage/${id}`, data)
                .then((res) => {
                    toast.success("Homepage updated successfully!");
                    navigate("/homepages");
                })
                .catch((error) => {
                    console.error("Error updating homepage:", error);
                    toast.error("Failed to update homepage. Please try again.");
                });
        }
    });

    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const deleteHomepage = () => {
        http.delete(`/homepage/${id}`)
            .then(() => {
                toast.success("Homepage deleted successfully!");
                navigate("/homepages");
            })
            .catch((error) => {
                console.error("Error deleting homepage:", error);
                toast.error("Failed to delete homepage.");
            });
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ my: 2 }}>
                Edit Homepage
            </Typography>
            {
                !loading && (
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
                                Update
                            </Button>
                            <Button variant="contained" sx={{ ml: 2 }} color="error" onClick={handleOpen}>
                                Delete
                            </Button>
                        </Box>
                    </Box>
                )
            }

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                    Delete Homepage
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this homepage?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="inherit" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="error" onClick={deleteHomepage}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <ToastContainer />
        </Box>
    );
}

export default EditHomepage;
