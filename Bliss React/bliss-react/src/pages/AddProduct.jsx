import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Grid, Select, MenuItem } from '@mui/material'; // ✅ Added Select & MenuItem
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function AddProduct() {
    const navigate = useNavigate();
    const [imageFile, setImageFile] = useState(null);

    const formik = useFormik({
        initialValues: {
            name: "",
            description: "",
            price: "",
            type: "", // ✅ Add Type Field
        },
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
                .required('Product type is required') // ✅ Make Type Required
        }),
        onSubmit: (data) => {
            if (imageFile) {
                data.imageFile = imageFile;
            }
            data.name = data.name.trim();
            data.description = data.description.trim();
            data.price = parseFloat(data.price); // Ensure price is a number
        
            console.log("Sending Data to API:", data); // ✅ Debugging step
        
            const token = localStorage.getItem("accessToken"); // Get the token from localStorage
        
            http.post("/product", data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => {
                    console.log("Product Added:", res.data);
                    navigate("/products");
                })
                .catch((error) => {
                    console.error("Error adding product:", error);
                    toast.error("Error adding product");
                });
        }
    });

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
                    setImageFile(res.data.filename); // Save the file name for later use
                })
                .catch(function (error) {
                    console.log(error.response);
                    toast.error('File upload failed');
                });
        }
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ my: 2 }}>
                Add Product
            </Typography>
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
                        {/* ✅ Add Product Type Dropdown */}
                        <Typography variant="body1" sx={{ mt: 2 }}>Product Type</Typography>
                        <TextField
                            select
                            fullWidth
                            margin="dense"
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
                                Upload Image
                                <input hidden accept="image/*" multiple type="file"
                                    onChange={onFileChange} />
                            </Button>
                            {
                                imageFile && (
                                    <Box className="aspect-ratio-container" sx={{ mt: 2 }}>
                                        <img alt="product"
                                            src={`${import.meta.env.VITE_FILE_BASE_URL}${imageFile}`} />
                                    </Box>
                                )
                            }
                        </Box>
                    </Grid>
                </Grid>
                <Box sx={{ mt: 2 }}>
                    <Button variant="contained" type="submit">
                        Add Product
                    </Button>
                </Box>
            </Box>

            <ToastContainer />
        </Box>
    );
}

export default AddProduct;
