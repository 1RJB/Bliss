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
    const [selectedVoucherType, setSelectedVoucherType] = useState(null); // Track selected voucher type

    // 🛠 Validation schema with conditional fields
    const validationSchema = yup.object({
        title: yup.string().trim().min(3).max(100).required('Title is required'),
        description: yup.string().trim().min(3).max(500).required('Description is required'),
        cost: yup.number().min(0).required('Cost is required'),
        validDuration: yup.number().min(1).required('Valid duration is required'),
        memberType: yup.string().required('Member Type is required'),
        quantity: yup.number().min(1).required('Quantity is required'),
        voucherType: yup.string().required('Voucher Type is required'),

        // Conditional validation based on voucher type
        itemName: yup.string().when("voucherType", {
            is: "0", then: (schema) => schema.required("Item Name is required"),
            otherwise: (schema) => schema.notRequired(),
        }),
        itemQuantity: yup.number().when("voucherType", {
            is: "0", then: (schema) => schema.min(1).required("Item Quantity is required"),
            otherwise: (schema) => schema.notRequired(),
        }),
        discountPercentage: yup.number().when("voucherType", {
            is: "1", then: (schema) => schema.min(1).max(100).required(),
            otherwise: (schema) => schema.notRequired(),
        }),
        maxAmount: yup.number().when("voucherType", {
            is: "1", then: (schema) => schema.min(0).required(),
            otherwise: (schema) => schema.notRequired(),
        }),
        value: yup.number().when("voucherType", {
            is: "2", then: (schema) => schema.min(1).required(),
            otherwise: (schema) => schema.notRequired(),
        }),
    });

    // 📝 Formik configuration
    const formik = useFormik({
        initialValues: {
            title: "",
            description: "",
            cost: 0,
            validDuration: 0,
            memberType: "",
            quantity: 0,
            voucherType: "",
            itemName: "",
            itemQuantity: 0,
            discountPercentage: 0,
            maxAmount: 0,
            value: 0
        },
        validationSchema: validationSchema,
        onSubmit: (data) => {
            console.log("Submitting Data:", data);

            if (imageFile) data.imageFile = imageFile;

            data.title = data.title.trim();
            data.description = data.description.trim();
            data.memberType = parseInt(data.memberType, 10);
            data.voucherType = parseInt(data.voucherType, 10);

            // ✅ Remove unnecessary fields before sending request
            if (data.voucherType === 0) {
                delete data.discountPercentage;
                delete data.maxAmount;
                delete data.value;
            } else if (data.voucherType === 1) {
                delete data.itemName;
                delete data.itemQuantity;
                delete data.value;
            } else if (data.voucherType === 2) {
                delete data.itemName;
                delete data.itemQuantity;
                delete data.discountPercentage;
                delete data.maxAmount;
            }

            http.post("/voucher", data)
                .then(() => {
                    toast.success("Voucher added successfully!");
                    navigate("/vouchers");
                })
                .catch((err) => {
                    console.error("Error submitting form:", err);
                    toast.error('An unexpected error occurred.');
                });
        }
    });

    // 🖼 Handle file upload
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
                                name="voucherType"
                                value={formik.values.voucherType}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSelectedVoucherType(value);
                                    formik.setFieldValue("voucherType", value);
                                }}
                            >
                                <MenuItem value="0">Item Voucher</MenuItem>
                                <MenuItem value="1">Discount Voucher</MenuItem>
                                <MenuItem value="2">Gift Card Voucher</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Only show fields after selecting a voucher type */}
                    {selectedVoucherType !== null && (
                        <>
                            <Grid item xs={12}>
                                <TextField fullWidth margin="dense" label="Title" name="title" {...formik.getFieldProps("title")} error={formik.touched.title && Boolean(formik.errors.title)} helperText={formik.touched.title && formik.errors.title} />
                                <TextField fullWidth margin="dense" label="Description" name="description" {...formik.getFieldProps("description")} error={formik.touched.description && Boolean(formik.errors.description)} helperText={formik.touched.description && formik.errors.description} />
                                <TextField fullWidth margin="dense" label="Cost" name="cost" type="number" {...formik.getFieldProps("cost")} error={formik.touched.cost && Boolean(formik.errors.cost)} helperText={formik.touched.cost && formik.errors.cost} />
                                <TextField fullWidth margin="dense" label="Valid Duration" name="validDuration" type="number" {...formik.getFieldProps("validDuration")} error={formik.touched.validDuration && Boolean(formik.errors.validDuration)} helperText={formik.touched.validDuration && formik.errors.validDuration} />
                                <TextField fullWidth margin="dense" label="Quantity" name="quantity" type="number" {...formik.getFieldProps("quantity")} error={formik.touched.quantity && Boolean(formik.errors.quantity)} helperText={formik.touched.quantity && formik.errors.quantity} />
                            </Grid>

                            {/* Show additional fields based on selected type */}
                            {selectedVoucherType === "0" && <><TextField fullWidth margin="dense" label="Item Name" name="itemName" {...formik.getFieldProps("itemName")} /><TextField fullWidth margin="dense" label="Item Quantity" name="itemQuantity" type="number" {...formik.getFieldProps("itemQuantity")} /></>}
                            {selectedVoucherType === "1" && <><TextField fullWidth margin="dense" label="Discount Percentage" name="discountPercentage" type="number" {...formik.getFieldProps("discountPercentage")} /><TextField fullWidth margin="dense" label="Max Amount" name="maxAmount" type="number" {...formik.getFieldProps("maxAmount")} /></>}
                            {selectedVoucherType === "2" && <TextField fullWidth margin="dense" label="Value" name="value" type="number" {...formik.getFieldProps("value")} />}
                        </>
                    )}
                </Grid>

                {selectedVoucherType !== null && <Button variant="contained" type="submit" sx={{ mt: 2 }}>Add</Button>}
            </form>

            <ToastContainer />
        </Box>
    );
}

export default AddVoucher;
