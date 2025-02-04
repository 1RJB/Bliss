import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Grid2 as Grid } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import http from '../http';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Edit } from '@mui/icons-material';

function EditWishlist() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [wishlist, setWishlist] = useState({
        name: "",
        description: ""
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        http.get(`/wishlist/${id}`).then((res) => {
            setWishlist(res.data);
            setLoading(false);
        });
    }, []);

    const formik = useFormik({
        initialValues: wishlist,
        enableReinitialize: true,
        validationSchema: yup.object({
            name: yup.string().trim()
                .min(3, 'Title must be at least 3 characters')
                .max(100, 'Title must be at most 100 characters')
                .required('Title is required'),
            description: yup.string().trim()
                .min(3, 'Description must be at least 3 characters')
                .max(500, 'Description must be at most 500 characters')
                .required('Description is required')
        }),
        onSubmit: (data) => {
            data.name = data.name.trim();
            data.description = data.description.trim();
            http.put(`/wishlist/${id}`, data)
                .then((res) => {
                    console.log(res.data);
                    navigate("/wishlists");
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

    const deleteWishlist = () => {
        http.delete(`/wishlist/${id}`)
            .then((res) => {
                console.log(res.data);
                navigate("/wishlists");
            });
    }


    return (
        <Box>
            <Typography variant="h5" sx={{ my: 2 }}>
                Edit Wishlists details
            </Typography>
            {
                !loading && (
                    <Box component="form" onSubmit={formik.handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid size={{xs:12, md:6, lg:8}}>
                                <TextField
                                    fullWidth margin="dense" autoComplete="off"
                                    label="Wishlist Name"
                                    name="name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.name && Boolean(formik.errors.name)}
                                    helperText={formik.touched.name && formik.errors.name}
                                />
                                <TextField
                                    fullWidth margin="dense" autoComplete="off"
                                    multiline minRows={2}
                                    label="Description"
                                    name="description"
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.description && Boolean(formik.errors.description)}
                                    helperText={formik.touched.description && formik.errors.description}
                                />
                            </Grid>
                        </Grid>
                        <Box sx={{ mt: 2 }}>
                            <Button variant="contained" type="submit">
                                Update
                            </Button>
                            <Button variant="contained" sx={{ ml: 2 }} color="error"
                                onClick={handleOpen}>
                                Delete
                            </Button>
                        </Box>
                    </Box>
                )
            }

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                    Delete Wishlist
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this wishlist?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="inherit"
                        onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="error"
                        onClick={deleteWishlist}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <ToastContainer />
        </Box>
    );
}

export default EditWishlist;