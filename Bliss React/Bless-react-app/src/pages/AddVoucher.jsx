import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Grid2 as Grid, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AddVoucher() {
    const navigate = useNavigate();
    const [imageFile, setImageFile] = useState(null);

    const formik = useFormik({
        initialValues: {
            title: "",
            description: "",
            cost: 0,
            validDuration: 0,
            status: "",
            memberType: "",
            quantity: 0,
            voucherType: "",
            itemName: "",
            itemQuantity: 0,
            discountPercentage: 0,
            maxAmount: 0,
            value: 0
        },
        validationSchema: yup.object({
            title: yup.string().trim()
                .min(3, 'Title must be at least 3 characters')
                .max(100, 'Title must be at most 100 characters')
                .required('Title is required'),
            description: yup.string().trim()
                .min(3, 'Description must be at least 3 characters')
                .max(500, 'Description must be at most 500 characters')
                .required('Description is required'),
            cost: yup.number().min(0).required('Cost is required'),
            validDuration: yup.number().min(0).required('Valid Duration is required'),
            status: yup.string().required('Status is required'),
            memberType: yup.string().required('Member Type is required'),
            quantity: yup.number().min(0).required('Quantity is required'),
            voucherType: yup.string().required('Voucher Type is required')
        }),
        onSubmit: (data) => {
            if (imageFile) {
                data.imageFile = imageFile;
            }
            data.title = data.title.trim();
            data.description = data.description.trim();
            http.post("/voucher", data)
                .then((res) => {
                    console.log(res.data);
                    navigate("/vouchers");
                })
                .catch(function (err) {
                    if (err.response && err.response.data && err.response.data.message) {
                        toast.error(`Error: ${err.response.data.message}`);
                    } else {
                        toast.error('An unexpected error occurred.');
                    }
                });
        }
    });

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
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then((res) => {
                    setImageFile(res.data.filename);
                })
                .catch(function (error) {
                    if (error.response && error.response.data && error.response.data.message) {
                        toast.error(`File upload error: ${error.response.data.message}`);
                    } else {
                        toast.error('An unexpected error occurred during file upload.');
                    }
                });
        }
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ my: 2 }}>
                Add Voucher
            </Typography>
            <Box component="form" onSubmit={formik.handleSubmit}>
                <Grid container spacing={2}>
                    <Grid size={{xs:12, md:6, lg:8}}>
                        <TextField
                            fullWidth margin="dense" autoComplete="off"
                            label="Title"
                            name="title"
                            value={formik.values.title}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.title && Boolean(formik.errors.title)}
                            helperText={formik.touched.title && formik.errors.title}
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
                            label="Cost"
                            name="cost"
                            type="number"
                            value={formik.values.cost}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.cost && Boolean(formik.errors.cost)}
                            helperText={formik.touched.cost && formik.errors.cost}
                        />
                        <TextField
                            fullWidth margin="dense" autoComplete="off"
                            label="Valid Duration"
                            name="validDuration"
                            type="number"
                            value={formik.values.validDuration}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.validDuration && Boolean(formik.errors.validDuration)}
                            helperText={formik.touched.validDuration && formik.errors.validDuration}
                        />
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Status</InputLabel>
                            <Select
                                name="status"
                                value={formik.values.status}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.status && Boolean(formik.errors.status)}
                            >
                                <MenuItem value="0">Available</MenuItem>
                                <MenuItem value="1">Redeemed</MenuItem>
                                <MenuItem value="3">Expired</MenuItem>
                            </Select>
                            {formik.touched.status && formik.errors.status && (
                                <Typography color="error" variant="caption">
                                    {formik.errors.status}
                                </Typography>
                            )}
                        </FormControl>
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Member Type</InputLabel>
                            <Select
                                name="memberType"
                                value={formik.values.memberType}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.memberType && Boolean(formik.errors.memberType)}
                            >
                                <MenuItem value="0">Basic</MenuItem>
                                <MenuItem value="1">Green</MenuItem>
                                <MenuItem value="2">Premium</MenuItem>
                            </Select>
                            {formik.touched.memberType && formik.errors.memberType && (
                                <Typography color="error" variant="caption">
                                    {formik.errors.memberType}
                                </Typography>
                            )}
                        </FormControl>
                        <TextField
                            fullWidth margin="dense" autoComplete="off"
                            label="Quantity"
                            name="quantity"
                            type="number"
                            value={formik.values.quantity}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                            helperText={formik.touched.quantity && formik.errors.quantity}
                        />
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Voucher Type</InputLabel>
                            <Select
                                name="voucherType"
                                value={formik.values.voucherType}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.voucherType && Boolean(formik.errors.voucherType)}
                            >
                                <MenuItem value="0">Item Voucher</MenuItem>
                                <MenuItem value="1">Discount Voucher</MenuItem>
                                <MenuItem value="2">Gift Card Voucher</MenuItem>
                            </Select>
                            {formik.touched.voucherType && formik.errors.voucherType && (
                                <Typography color="error" variant="caption">
                                    {formik.errors.voucherType}
                                </Typography>
                            )}
                        </FormControl>
                        {formik.values.voucherType === '0' && (
                            <>
                                <TextField
                                    fullWidth margin="dense" autoComplete="off"
                                    label="Item Name"
                                    name="itemName"
                                    value={formik.values.itemName}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.itemName && Boolean(formik.errors.itemName)}
                                    helperText={formik.touched.itemName && formik.errors.itemName}
                                />
                                <TextField
                                    fullWidth margin="dense" autoComplete="off"
                                    label="Item Quantity"
                                    name="itemQuantity"
                                    type="number"
                                    value={formik.values.itemQuantity}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.itemQuantity && Boolean(formik.errors.itemQuantity)}
                                    helperText={formik.touched.itemQuantity && formik.errors.itemQuantity}
                                />
                            </>
                        )}
                        {formik.values.voucherType === '1' && (
                            <>
                                <TextField
                                    fullWidth margin="dense" autoComplete="off"
                                    label="Discount Percentage"
                                    name="discountPercentage"
                                    type="number"
                                    value={formik.values.discountPercentage}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.discountPercentage && Boolean(formik.errors.discountPercentage)}
                                    helperText={formik.touched.discountPercentage && formik.errors.discountPercentage}
                                />
                                <TextField
                                    fullWidth margin="dense" autoComplete="off"
                                    label="Max Amount"
                                    name="maxAmount"
                                    type="number"
                                    value={formik.values.maxAmount}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.maxAmount && Boolean(formik.errors.maxAmount)}
                                    helperText={formik.touched.maxAmount && formik.errors.maxAmount}
                                />
                            </>
                        )}
                        {formik.values.voucherType === '2' && (
                            <TextField
                                fullWidth margin="dense" autoComplete="off"
                                label="Value"
                                name="value"
                                type="number"
                                value={formik.values.value}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.value && Boolean(formik.errors.value)}
                                helperText={formik.touched.value && formik.errors.value}
                            />
                        )}
                    </Grid>
                    <Grid size={{xs:12, md:6, lg:4}}>
                        <Box sx={{ textAlign: 'center', mt: 2 }} >
                            <Button variant="contained" component="label">
                                Upload Image
                                <input hidden accept="image/*" multiple type="file"
                                    onChange={onFileChange} />
                            </Button>
                            {
                                imageFile && (
                                    <Box className="aspect-ratio-container" sx={{ mt: 2 }}>
                                        <img alt="voucher"
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
                        Add
                    </Button>
                </Box>
            </Box>

            <ToastContainer />
        </Box>
    );
}

export default AddVoucher;