import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Grid, Select, MenuItem, IconButton } from '@mui/material';
import { AddCircle, RemoveCircle } from '@mui/icons-material'; // ✅ Icons for add/remove size
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AddProduct() {
    const navigate = useNavigate();
    const [imageFile, setImageFile] = useState(null);

    // ✅ State to store multiple sizes
    const [sizes, setSizes] = useState([{ size: "", price: "" }]);

    const formik = useFormik({
        initialValues: {
            name: "",
            description: "",
            type: "",
            suitedFor: "",
            skinFeel: "",
            keyIngredients: "",
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
            type: yup.string()
                .required('Product type is required'),
        }),
        onSubmit: (data) => {
            if (imageFile) {
                data.imageFile = imageFile;
            }
            data.name = data.name.trim();
            data.description = data.description.trim();
            data.sizes = sizes.filter(s => s.size.trim() !== "" && s.price !== ""); // ✅ Include sizes

            console.log("Sending Data to API:", data);

            const token = localStorage.getItem("accessToken");

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
                headers: { 'Content-Type': 'multipart/form-data' }
            })
                .then((res) => {
                    setImageFile(res.data.filename);
                })
                .catch((error) => {
                    console.log(error.response);
                    toast.error('File upload failed');
                });
        }
    };

    // ✅ Function to add a new size field
    const addSizeField = () => {
        setSizes([...sizes, { size: "", price: "" }]);
    };

    // ✅ Function to remove a size field
    const removeSizeField = (index) => {
        setSizes(sizes.filter((_, i) => i !== index));
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ my: 2 }}>
                Add Product
            </Typography>
            <Box component="form" onSubmit={formik.handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
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

                        {/* ✅ Product Type Dropdown */}
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

                        <TextField
                            fullWidth margin="dense"
                            label="Suited For"
                            name="suitedFor"
                            value={formik.values.suitedFor}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.suitedFor && Boolean(formik.errors.suitedFor)}
                            helperText={formik.touched.suitedFor && formik.errors.suitedFor}
                        />

                        <TextField
                            fullWidth margin="dense"
                            label="Skin Feel"
                            name="skinFeel"
                            value={formik.values.skinFeel}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.skinFeel && Boolean(formik.errors.skinFeel)}
                            helperText={formik.touched.skinFeel && formik.errors.skinFeel}
                        />

                        <TextField
                            fullWidth margin="dense"
                            label="Key Ingredients"
                            name="keyIngredients"
                            multiline
                            minRows={2}
                            value={formik.values.keyIngredients}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.keyIngredients && Boolean(formik.errors.keyIngredients)}
                            helperText={formik.touched.keyIngredients && formik.errors.keyIngredients}
                        />



                        {/* ✅ Dynamic Size Fields */}
                        <Typography variant="body1" sx={{ mt: 2 }}>Product Sizes</Typography>
                        {sizes.map((sizeOption, index) => (
                            <Grid container spacing={1} alignItems="center" key={index}>
                                <Grid item xs={5}>
                                    <TextField
                                        fullWidth margin="dense"
                                        label="Size (e.g., 100ML)"
                                        value={sizeOption.size}
                                        onChange={(e) => {
                                            const updatedSizes = [...sizes];
                                            updatedSizes[index].size = e.target.value;
                                            setSizes(updatedSizes);
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={5}>
                                    <TextField
                                        fullWidth margin="dense" type="number"
                                        label="Price"
                                        value={sizeOption.price}
                                        onChange={(e) => {
                                            const updatedSizes = [...sizes];
                                            updatedSizes[index].price = e.target.value;
                                            setSizes(updatedSizes);
                                        }}
                                    />
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
                        <Button startIcon={<AddCircle />} onClick={addSizeField} sx={{ mt: 1 }}>
                            Add Size
                        </Button>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box sx={{ textAlign: 'center', mt: 2 }} >
                            <Button variant="contained" component="label">
                                Upload Image
                                <input hidden accept="image/*" type="file" onChange={onFileChange} />
                            </Button>
                            {imageFile && (
                                <Box sx={{ mt: 2 }}>
                                    <img alt="product" src={`${import.meta.env.VITE_FILE_BASE_URL}${imageFile}`} style={{ width: "100%", maxWidth: "300px" }} />
                                </Box>
                            )}
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
