import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Grid, MenuItem, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { AddCircle, RemoveCircle } from '@mui/icons-material';
import http from '../http';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sizes, setSizes] = useState([{ size: "", price: "" }]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        http.get(`/product/${id}`).then((res) => {
            setImageFile(res.data.imageFile);
            setSizes(res.data.sizes || [{ size: "", price: "" }]);
            formik.setValues(res.data);
            setLoading(false);
        });
    }, []);

    const formik = useFormik({
        initialValues: {
            name: "",
            description: "",
            type: "",
        },
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
            type: yup.string()
                .required('Product type is required'),
        }),
        onSubmit: (data) => {
            if (imageFile) {
                data.imageFile = imageFile;
            }
            data.name = data.name.trim();
            data.description = data.description.trim();
            data.sizes = sizes.filter(s => s.size.trim() !== "" && s.price !== "");
        
            const token = localStorage.getItem("accessToken"); // Get token from local storage
        
            http.put(`/product/${id}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then(() => navigate("/products"))
            .catch((error) => {
                console.error("Error updating product:", error);
                toast.error("Error updating product");
                if (error.response && error.response.status === 401) {
                    navigate("/login"); // Redirect to login if unauthorized
                }
            });
        }

    const onFileChange = (e) => {
        let file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) {
                toast.error('Maximum file size is 1MB');
                return;
            }
            let formData = new FormData();
            formData.append('file', file);
            http.post('/file/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
                .then((res) => setImageFile(res.data.filename))
                .catch(() => toast.error('File upload failed'));
        }
    };

    const addSizeField = () => setSizes([...sizes, { size: "", price: "" }]);
    const removeSizeField = (index) => setSizes(sizes.filter((_, i) => i !== index));
    const deleteProduct = () => http.delete(`/product/${id}`).then(() => navigate("/products"));

    return (
        <Box>
            <Typography variant="h5" sx={{ my: 2 }}>Edit Product</Typography>
            {!loading && (
                <Box component="form" onSubmit={formik.handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth margin="dense" label="Product Name" name="name"
                                value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur}
                                error={formik.touched.name && Boolean(formik.errors.name)}
                                helperText={formik.touched.name && formik.errors.name} />
                            <TextField fullWidth margin="dense" multiline minRows={2} label="Description" name="description"
                                value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur}
                                error={formik.touched.description && Boolean(formik.errors.description)}
                                helperText={formik.touched.description && formik.errors.description} />
                            <TextField select fullWidth margin="dense" label="Product Type" name="type"
                                value={formik.values.type} onChange={formik.handleChange} onBlur={formik.handleBlur}
                                error={formik.touched.type && Boolean(formik.errors.type)}
                                helperText={formik.touched.type && formik.errors.type}>
                                <MenuItem value="">Select a Type</MenuItem>
                                <MenuItem value="Moisturizer">Moisturizer</MenuItem>
                                <MenuItem value="Toner">Toner</MenuItem>
                                <MenuItem value="Cleanser">Cleanser</MenuItem>
                            </TextField>
                            <Typography variant="body1" sx={{ mt: 2 }}>Product Sizes</Typography>
                            {sizes.map((sizeOption, index) => (
                                <Grid container spacing={1} alignItems="center" key={index}>
                                    <Grid item xs={5}>
                                        <TextField fullWidth margin="dense" label="Size (e.g., 100ML)" value={sizeOption.size}
                                            onChange={(e) => {
                                                const updatedSizes = [...sizes];
                                                updatedSizes[index].size = e.target.value;
                                                setSizes(updatedSizes);
                                            }} />
                                    </Grid>
                                    <Grid item xs={5}>
                                        <TextField fullWidth margin="dense" type="number" label="Price" value={sizeOption.price}
                                            onChange={(e) => {
                                                const updatedSizes = [...sizes];
                                                updatedSizes[index].price = e.target.value;
                                                setSizes(updatedSizes);
                                            }} />
                                    </Grid>
                                    <Grid item xs={2}>
                                        {sizes.length > 1 && (
                                            <IconButton onClick={() => removeSizeField(index)} color="error">
                                                <RemoveCircle />
                                            </IconButton>
                                        )}
                                    </Grid>
                                </Grid>
                            ))}
                            <Button startIcon={<AddCircle />} onClick={addSizeField} sx={{ mt: 1 }}>Add Size</Button>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                <Button variant="contained" component="label">Upload Image
                                    <input hidden accept="image/*" type="file" onChange={onFileChange} />
                                </Button>
                                {imageFile && (<img alt="product" src={`${import.meta.env.VITE_FILE_BASE_URL}${imageFile}`} style={{ width: "100%", maxWidth: "300px" }} />)}
                            </Box>
                        </Grid>
                    </Grid>
                    <Box sx={{ mt: 2 }}>
                        <Button variant="contained" type="submit">Update Product</Button>
                        <Button variant="contained" sx={{ ml: 2 }} color="error" onClick={() => setOpen(true)}>Delete</Button>
                    </Box>
                </Box>
            )}
            <ToastContainer />
        </Box>
    );
}

export default EditProduct;
