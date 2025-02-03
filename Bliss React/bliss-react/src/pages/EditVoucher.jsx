import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { toast } from 'react-toastify';

// 🛠️ Validation schema for form fields
const validationSchema = yup.object({
    title: yup
        .string()
        .trim()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title must be at most 100 characters')
        .required('Title is required'),

    description: yup
        .string()
        .trim()
        .min(3, 'Description must be at least 3 characters')
        .max(500, 'Description must be at most 500 characters')
        .required('Description is required'),

    validDuration: yup
        .number()
        .min(1, 'Valid duration must be at least 1 day')
        .required('Valid duration is required'),

    status: yup
        .number()
        .oneOf([0, 1, 3], 'Invalid status selected')
        .required('Status is required'),

    memberType: yup
        .number()
        .oneOf([0, 1, 2], 'Invalid member type selected')
        .required('Member type is required'),
});

function EditVoucher() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [imageFile, setImageFile] = useState('');
    const baseURL = import.meta.env.VITE_FILE_BASE_URL || 'http://localhost:5000/';

    // Fetch existing voucher data
    useEffect(() => {
        http.get(`/voucher/${id}`)
            .then((res) => {
                console.log('Fetched Data:', res.data);
                const fetchedData = {
                    title: res.data.title,
                    description: res.data.description,
                    validDuration: res.data.validDuration,
                    status: parseInt(res.data.status, 10),  // Ensure integer conversion
                    memberType: parseInt(res.data.memberType, 10),  // Ensure integer conversion
                };
                formik.setValues(fetchedData);
                setImageFile(res.data.imageFile);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching voucher:', err);
                setLoading(false);
            });
    }, [id]);

    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            validDuration: 1, // Default to 1
            status: 0,
            memberType: 0,
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            if (imageFile) {
                values.imageFile = imageFile;  // ✅ Corrected reference
            }
            values.status = parseInt(values.status, 10);  // ✅ Ensure integer
            values.memberType = parseInt(values.memberType, 10);  // ✅ Ensure integer

            console.log("Submitting Data:", JSON.stringify(values, null, 2));

            http.put(`/voucher/${id}`, values)
                .then(() => {
                    toast.success('Voucher updated successfully');
                    navigate("/vouchers");
                })
                .catch((err) => {
                    toast.error('Error updating voucher');
                    console.error('Error updating voucher:', err);
                });
        },
    });

    // Handle file upload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) {
                toast.error('Maximum file size is 1MB');
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            http.post('/file/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
                .then((res) => {
                    setImageFile(res.data.filename);
                    toast.success('File uploaded successfully');
                })
                .catch((error) => {
                    toast.error('Error uploading file');
                    console.error('File upload error:', error);
                });
        }
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ my: 2 }}>
                Edit Voucher
            </Typography>

            {!loading && (
                <Box component="form" onSubmit={formik.handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="title"
                                name="title"
                                label="Title"
                                value={formik.values.title}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.title && Boolean(formik.errors.title)}
                                helperText={formik.touched.title && formik.errors.title}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="description"
                                name="description"
                                label="Description"
                                value={formik.values.description}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.description && Boolean(formik.errors.description)}
                                helperText={formik.touched.description && formik.errors.description}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="validDuration"
                                name="validDuration"
                                label="Valid Duration"
                                type="number"
                                value={formik.values.validDuration}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.validDuration && Boolean(formik.errors.validDuration)}
                                helperText={formik.touched.validDuration && formik.errors.validDuration}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Status</InputLabel>
                                <Select
                                    name="status"
                                    value={formik.values.status}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.status && Boolean(formik.errors.status)}
                                >
                                    <MenuItem value={0}>Available</MenuItem>
                                    <MenuItem value={1}>Redeemed</MenuItem>
                                    <MenuItem value={3}>Expired</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
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
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <Button variant="contained" component="label" sx={{ mt: 2 }}>
                                Upload File
                                <input type="file" hidden onChange={handleFileChange} />
                            </Button>
                        </Grid>

                        {imageFile && (
                            <Grid item xs={12}>
                                <Box mt={2}>
                                    <img
                                        src={`${baseURL}${imageFile}`}
                                        alt="voucher"
                                        style={{ maxWidth: '100%' }}
                                    />
                                </Box>
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <Button color="primary" variant="contained" fullWidth type="submit" sx={{ mt: 2 }}>
                                Update Voucher
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            )}
        </Box>
    );
}

export default EditVoucher;
