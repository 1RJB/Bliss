import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, MenuItem, Select, FormControl, InputLabel, FormHelperText } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AddVoucher() {
    const navigate = useNavigate();
    const [imageFile, setImageFile] = useState(null);

    // Form Validation Schema with image upload as required
    const validationSchema = yup.object({
        title: yup.string().trim()
            .min(3, 'Title must be at least 3 characters')
            .max(100, 'Title must be at most 100 characters')
            .required('Title is required'),
        description: yup.string().trim()
            .min(3, 'Description must be at least 3 characters')
            .max(500, 'Description must be at most 500 characters')
            .required('Description is required'),
        cost: yup.number().min(0, 'Cost cannot be negative').required('Cost is required'),
        validDuration: yup.number().min(0, 'Valid Duration cannot be negative').required('Valid Duration is required'),
        status: yup.string().required('Status is required'),
        memberType: yup.string().required('Member Type is required'),
        quantity: yup.number().min(0, 'Quantity cannot be negative').required('Quantity is required'),
        voucherType: yup.string().required('Voucher Type is required'),
        imageFile: yup.mixed().required('Image is required'),  // Add image validation here
    });

    // Formik for form handling
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
            value: 0,
            imageFile: null, // Adding imageFile field to the formik state
        },
        validationSchema: validationSchema,
        onSubmit: (data) => {
            console.log("Form Data Submitted: ", data); // Debugging line to check form submission
            if (imageFile) {
                data.imageFile = imageFile;
            }
            data.voucherType = parseInt(data.voucherType, 10);
            data.memberType = parseInt(data.memberType, 10);
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

    // Image File Handling
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
                    formik.setFieldValue("imageFile", res.data.filename); // Update formik state with the image file
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
        <Box sx={{ maxWidth: 600, margin: '0 auto', padding: 3 }}>
            <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
                Add Voucher
            </Typography>

            {/* Form */}
            <Box component="form" onSubmit={formik.handleSubmit}>
                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        label="Title"
                        name="title"
                        value={formik.values.title}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.title && Boolean(formik.errors.title)}
                        helperText={formik.touched.title && formik.errors.title}
                        margin="dense"
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        multiline
                        rows={4}
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.description && Boolean(formik.errors.description)}
                        helperText={formik.touched.description && formik.errors.description}
                        margin="dense"
                    />
                </Box>

                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <TextField
                        fullWidth
                        label="Cost"
                        name="cost"
                        type="number"
                        value={formik.values.cost}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.cost && Boolean(formik.errors.cost)}
                        helperText={formik.touched.cost && formik.errors.cost}
                        margin="dense"
                    />
                    <TextField
                        fullWidth
                        label="Valid Duration"
                        name="validDuration"
                        type="number"
                        value={formik.values.validDuration}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.validDuration && Boolean(formik.errors.validDuration)}
                        helperText={formik.touched.validDuration && formik.errors.validDuration}
                        margin="dense"
                    />
                </Box>

                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Member Type</InputLabel>
                        <Select
                            name="memberType"
                            value={formik.values.memberType}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.memberType && Boolean(formik.errors.memberType)}
                        >
                            <MenuItem value={0}>Basic</MenuItem>
                            <MenuItem value={1}>Green</MenuItem>
                            <MenuItem value={2}>Premium</MenuItem>
                        </Select>
                        {formik.touched.memberType && formik.errors.memberType && (
                            <FormHelperText error>{formik.errors.memberType}</FormHelperText>
                        )}
                    </FormControl>

                    <TextField
                        fullWidth
                        label="Quantity"
                        name="quantity"
                        type="number"
                        value={formik.values.quantity}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                        helperText={formik.touched.quantity && formik.errors.quantity}
                        margin="dense"
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Voucher Type</InputLabel>
                        <Select
                            name="voucherType"
                            value={formik.values.voucherType}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.voucherType && Boolean(formik.errors.voucherType)}
                        >
                            <MenuItem value={0}>Item Voucher</MenuItem>
                            <MenuItem value={1}>Discount Voucher</MenuItem>
                            <MenuItem value={2}>Gift Card Voucher</MenuItem>
                        </Select>
                        {formik.touched.voucherType && formik.errors.voucherType && (
                            <FormHelperText error>{formik.errors.voucherType}</FormHelperText>
                        )}
                    </FormControl>
                </Box>

                {/* Conditional Fields Based on Voucher Type */}
                {formik.values.voucherType === 0 && (
                    <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Item Name"
                            name="itemName"
                            value={formik.values.itemName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.itemName && Boolean(formik.errors.itemName)}
                            helperText={formik.touched.itemName && formik.errors.itemName}
                            margin="dense"
                        />
                        <TextField
                            fullWidth
                            label="Item Quantity"
                            name="itemQuantity"
                            type="number"
                            value={formik.values.itemQuantity}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.itemQuantity && Boolean(formik.errors.itemQuantity)}
                            helperText={formik.touched.itemQuantity && formik.errors.itemQuantity}
                            margin="dense"
                        />
                    </Box>
                )}

                {formik.values.voucherType === 1 && (
                    <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Discount Percentage"
                            name="discountPercentage"
                            type="number"
                            value={formik.values.discountPercentage}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.discountPercentage && Boolean(formik.errors.discountPercentage)}
                            helperText={formik.touched.discountPercentage && formik.errors.discountPercentage}
                            margin="dense"
                        />
                        <TextField
                            fullWidth
                            label="Max Amount"
                            name="maxAmount"
                            type="number"
                            value={formik.values.maxAmount}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.maxAmount && Boolean(formik.errors.maxAmount)}
                            helperText={formik.touched.maxAmount && formik.errors.maxAmount}
                            margin="dense"
                        />
                    </Box>
                )}

                {formik.values.voucherType === 2 && (
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            fullWidth
                            label="Value"
                            name="value"
                            type="number"
                            inputProps={{ min: 0 }}
                            value={formik.values.value}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.value && Boolean(formik.errors.value)}
                            helperText={formik.touched.value && formik.errors.value}
                            margin="dense"
                        />
                    </Box>
                )}

                {/* Image Upload Section moved to bottom */}
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <Button variant="contained" component="label">
                        Upload Image
                        <input hidden accept="image/*" multiple type="file" onChange={onFileChange} />
                    </Button>
                    {formik.touched.imageFile && formik.errors.imageFile && (
                        <FormHelperText error>{formik.errors.imageFile}</FormHelperText> // Show error if image is not uploaded
                    )}
                    {imageFile && (
                        <Box sx={{ mt: 2 }}>
                            <img alt="voucher" src={`${import.meta.env.VITE_FILE_BASE_URL}${imageFile}`} style={{ maxWidth: '100%' }} />
                        </Box>
                    )}
                </Box>

                {/* Submit Button */}
                <Box sx={{ textAlign: 'center' }}>
                    <Button variant="contained" type="submit">
                        Add Voucher
                    </Button>
                </Box>
            </Box>

            <ToastContainer />
        </Box>
    );
}

export default AddVoucher;
