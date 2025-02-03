import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Grid2 as Grid } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, MenuItem } from '@mui/material';
import http from '../http';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



function EditProduct() {
    const { id } = useParams();  // Get the product ID from the URL params
    const navigate = useNavigate();
    const [product, setProduct] = useState({
        name: "",
        description: "",
        price: "",
        type: "",
    });

    const [imageFile, setImageFile] = useState(null); // Store the image file name

    const [loading, setLoading] = useState(true);  // State to track if data is loading

    // Fetch product data on component mount
    useEffect(() => {
        http.get(`/product/${id}`).then((res) => {
            setProduct(res.data);
            setImageFile(res.data.imageFile);
            setLoading(false);
        });
    }, []);
    // Formik for validation and handling form data
    const formik = useFormik({
        initialValues: product,
        enableReinitialize: true,
        validationSchema: yup.object({
            name: yup.string().trim()
                .min(3, 'Name must be at least 3 characters')
                .max(100, 'Name must be at most 100 characters')
                .required('Name is required'),
            description: yup.string().trim()
                .min(3, 'Description must be at least 3 characters')
                .max(500, 'Description must be at most 500 characters')
                .required('Description is required'),
            price: yup.number()
                .required('Price is required')
                .positive('Price must be a positive number'),
            type: yup.string()
                .required('Product type is required') // ✅ Validate Type
        }),
        onSubmit: (data) => {
            if (imageFile) {
                data.imageFile = imageFile;
            }
            data.name = data.name.trim();
            data.description = data.description.trim();
            data.price = parseFloat(data.price);
            http.put(`/product/${id}`, data)
                .then((res) => {
                    console.log(res.data);
                    navigate("/products");
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

    const deleteProduct = () => {
        http.delete(`/product/${id}`)
            .then((res) => {
                console.log(res.data);
                navigate("/products");
            });
    }

    // Handle file change (upload image)
    const onFileChange = (e) => {
        let file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limit
                toast.error('Maximum file size is 1MB');
                return;
            }

            let formData = new FormData();
            formData.append('file', file);
            http.post('/file/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then((res) => {
                    setImageFile(res.data.filename);
                })
                .catch(function (error) {
                    console.log(error.response);
                });
        }
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ my: 2 }}>
                Edit Product
            </Typography>
            {
                !loading && (
                    <Box component="form" onSubmit={formik.handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6, lg: 8 }}>
                                <TextField
                                    fullWidth margin="dense" autoComplete="off"
                                    label="Product Name"
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
                                <TextField
                                    fullWidth margin="dense" autoComplete="off"
                                    label="Price"
                                    name="price"
                                    value={formik.values.price}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.price && Boolean(formik.errors.price)}
                                    helperText={formik.touched.price && formik.errors.price}
                                />
                                <TextField
                                    select
                                    fullWidth
                                    margin="dense"
                                    label="Product Type"
                                    name="type"
                                    value={formik.values.type}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.type && Boolean(formik.errors.type)}
                                    helperText={formik.touched.type && formik.errors.type}
                                >
                                    <MenuItem value="">Select a Type</MenuItem>
                                    <MenuItem value="Moisturizer">Moisturizer</MenuItem>
                                    <MenuItem value="Toner">Toner</MenuItem>
                                    <MenuItem value="Cleanser">Cleanser</MenuItem>
                                </TextField>

                            </Grid>
                            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                <Box sx={{ textAlign: 'center', mt: 2 }} >
                                    <Button variant="contained" component="label">
                                        Upload New Image
                                        <input hidden accept="image/*" type="file" onChange={onFileChange} />
                                    </Button>
                                    {
                                        imageFile && (
                                            <Box className="aspect-ratio-container" sx={{ mt: 2 }}>
                                                <img alt="product"
                                                    src={`${import.meta.env.VITE_FILE_BASE_URL}${imageFile}`}>
                                                </img>
                                            </Box>
                                        )
                                    }
                                </Box>
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
                    Delete Product
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this Product?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="inherit"
                        onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="error"
                        onClick={deleteProduct}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>


            <ToastContainer />
        </Box>
    );
}

export default EditProduct;
