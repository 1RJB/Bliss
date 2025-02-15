import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Grid, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AddVoucher() {
    const navigate = useNavigate();
    const [imageFile, setImageFile] = useState(null);
    const [selectedVoucherType, setSelectedVoucherType] = useState(""); // Track selected voucher type

    const formik = useFormik({
        initialValues: {
            title: "",
            description: "",
            cost: 0,
            validDuration: 0,
            status: 0,
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
            title: yup.string().trim().min(3).max(100).required(),
            description: yup.string().trim().min(3).max(500).required(),
            cost: yup.number().min(0).required(),
            validDuration: yup.number().min(0).required(),
            memberType: yup.string().required(),
            quantity: yup.number().min(0).required(),
            voucherType: yup.string().required()
        }),
        onSubmit: (data) => {
            if (imageFile) data.imageFile = imageFile;

            data.title = data.title.trim();
            data.description = data.description.trim();
            data.memberType = parseInt(data.memberType, 10);
            data.voucherType = parseInt(data.voucherType, 10);

            // ✅ Remove unnecessary fields based on the selected voucher type
            if (data.voucherType === 0) {  // Item Voucher
                delete data.discountPercentage;
                delete data.maxAmount;
                delete data.value;
            } else if (data.voucherType === 1) {  // Discount Voucher
                delete data.itemName;
                delete data.itemQuantity;
                delete data.value;
            } else if (data.voucherType === 2) {  // Gift Card Voucher
                delete data.itemName;
                delete data.itemQuantity;
                delete data.discountPercentage;
                delete data.maxAmount;
            }

            http.post("/voucher/add", data)
                .then(() => navigate("/vouchers"))
                .catch(() => toast.error('An unexpected error occurred.'));
        }
    });

    const onFileChange = (e) => {
        let file = e.target.files[0];
        if (!file) return;

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
        .catch(() => toast.error('File upload error.'));
    };

    return (
        <Box>
            <Typography variant="h5">Add Voucher</Typography>
            <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={2}>
                    {/* Select Voucher Type */}
                    <Grid item xs={12}>
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Select Voucher Type</InputLabel>
                            <Select
                                value={selectedVoucherType}
                                onChange={(e) => {
                                    setSelectedVoucherType(e.target.value);
                                    formik.setFieldValue("voucherType", e.target.value);
                                }}
                            >
                                <MenuItem value="0">Item Voucher</MenuItem>
                                <MenuItem value="1">Discount Voucher</MenuItem>
                                <MenuItem value="2">Gift Card Voucher</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Only show fields after selecting a voucher type */}
                    {selectedVoucherType !== "" && (
                        <>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth margin="dense"
                                    label="Title" name="title"
                                    value={formik.values.title}
                                    onChange={formik.handleChange}
                                    error={formik.touched.title && Boolean(formik.errors.title)}
                                    helperText={formik.touched.title && formik.errors.title}
                                />
                                <TextField
                                    fullWidth margin="dense"
                                    multiline minRows={2}
                                    label="Description" name="description"
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    error={formik.touched.description && Boolean(formik.errors.description)}
                                    helperText={formik.touched.description && formik.errors.description}
                                />
                                <TextField
                                    fullWidth margin="dense"
                                    label="Cost" name="cost" type="number"
                                    value={formik.values.cost}
                                    onChange={formik.handleChange}
                                    error={formik.touched.cost && Boolean(formik.errors.cost)}
                                    helperText={formik.touched.cost && formik.errors.cost}
                                />
                                <TextField
                                    fullWidth margin="dense"
                                    label="Valid Duration" name="validDuration" type="number"
                                    value={formik.values.validDuration}
                                    onChange={formik.handleChange}
                                    error={formik.touched.validDuration && Boolean(formik.errors.validDuration)}
                                    helperText={formik.touched.validDuration && formik.errors.validDuration}
                                />
                                <TextField
                                    fullWidth margin="dense"
                                    label="Quantity" name="quantity" type="number"
                                    value={formik.values.quantity}
                                    onChange={formik.handleChange}
                                    error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                                    helperText={formik.touched.quantity && formik.errors.quantity}
                                />
                            </Grid>

                            {/* Show additional fields based on selected type */}
                            {selectedVoucherType === "0" && (
                                <Grid item xs={12}>
                                    <Typography variant="h6">Item Voucher Details</Typography>
                                    <TextField fullWidth margin="dense" label="Item Name" name="itemName" value={formik.values.itemName} onChange={formik.handleChange} />
                                    <TextField fullWidth margin="dense" label="Item Quantity" name="itemQuantity" type="number" value={formik.values.itemQuantity} onChange={formik.handleChange} />
                                </Grid>
                            )}
                            {selectedVoucherType === "1" && (
                                <Grid item xs={12}>
                                    <Typography variant="h6">Discount Voucher Details</Typography>
                                    <TextField fullWidth margin="dense" label="Discount Percentage" name="discountPercentage" type="number" value={formik.values.discountPercentage} onChange={formik.handleChange} />
                                    <TextField fullWidth margin="dense" label="Max Amount" name="maxAmount" type="number" value={formik.values.maxAmount} onChange={formik.handleChange} />
                                </Grid>
                            )}
                            {selectedVoucherType === "2" && (
                                <Grid item xs={12}>
                                    <Typography variant="h6">Gift Card Voucher Details</Typography>
                                    <TextField fullWidth margin="dense" label="Value" name="value" type="number" value={formik.values.value} onChange={formik.handleChange} />
                                </Grid>
                            )}

                            {/* Upload Image */}
                            <Grid item xs={12}>
                                <Button variant="contained" component="label">
                                    Upload Image
                                    <input hidden accept="image/*" multiple type="file" onChange={onFileChange} />
                                </Button>
                                {imageFile && (
                                    <Box sx={{ mt: 2 }}>
                                        <img alt="voucher" src={`${import.meta.env.VITE_FILE_BASE_URL}${imageFile}`} width="200" />
                                    </Box>
                                )}
                            </Grid>
                        </>
                    )}
                </Grid>

                {/* Submit Button */}
                {selectedVoucherType !== "" && (
                    <Box sx={{ mt: 2 }}>
                        <Button variant="contained" type="submit">Add</Button>
                    </Box>
                )}
            </form>

            <ToastContainer />
        </Box>
    );
}

export default AddVoucher;
