import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { toast } from 'react-toastify';

// Validation schema
const validationSchema = yup.object({
    title: yup.string().required('Title is required'),
    description: yup.string().required('Description is required'),
    validDuration: yup.number().required('Valid duration is required'),
    status: yup.string().required('Status is required'),
    memberType: yup.number().required('Member type is required'),
});

function EditVoucher() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [imageFile, setImageFile] = useState('');
    const baseURL = import.meta.env.VITE_FILE_BASE_URL || 'http://localhost:5000/';

    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            validDuration: '',
            status: '',
            memberType: '',
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            if (imageFile) {
                values.imageFile = imageFile;
            }
            values.memberType = parseInt(values.memberType, 10);
            values.status = parseInt(values.status, 10);

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

    useEffect(() => {
        http.get(`/voucher/${id}`)
            .then((res) => {
                console.log('Fetched Data:', res.data);
                formik.setValues({
                    ...res.data,
                    status: parseInt(res.data.status, 10),
                    memberType: parseInt(res.data.memberType, 10),
                });
                setImageFile(res.data.imageFile);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching voucher:', err);
                setLoading(false);
            });
    }, [id]);

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
                headers: { 'Content-Type': 'multipart/form-data' },
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
        <Box sx={{ maxWidth: 600, margin: '0 auto', padding: 3 }}>
            <Typography variant="h5" sx={{ my: 2 }}>Edit Voucher</Typography>

            {!loading && (
                <Box component="form" onSubmit={formik.handleSubmit}>
                    <Box sx={{ mb: 3 }}>
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
                    </Box>

                    <Box sx={{ mb: 3 }}>
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
                    </Box>

                    <Box sx={{ mb: 3 }}>
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
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                name="status"
                                value={formik.values.status}
                                onChange={(e) => formik.setFieldValue("status", e.target.value)}
                                error={formik.touched.status && Boolean(formik.errors.status)}
                            >
                                <MenuItem value={0}>Available</MenuItem>
                                <MenuItem value={1}>Redeemed</MenuItem>
                                <MenuItem value={3}>Expired</MenuItem>
                            </Select>
                            {formik.touched.status && formik.errors.status && (
                                <FormHelperText error>{formik.errors.status}</FormHelperText>
                            )}
                        </FormControl>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel>Member Type</InputLabel>
                            <Select
                                name="memberType"
                                value={formik.values.memberType}
                                onChange={(e) => formik.setFieldValue("memberType", e.target.value)}
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
                    </Box>

                    {/* File Upload Button */}
                    <Box sx={{ mb: 3 }}>
                        <Button variant="contained" component="label">
                            Upload File
                            <input type="file" hidden onChange={handleFileChange} />
                        </Button>
                    </Box>

                    {/* Image Preview */}
                    {imageFile && (
                        <Box sx={{ mb: 3 }}>
                            <img src={`${baseURL}${imageFile}`} alt="voucher" style={{ maxWidth: '100%' }} />
                        </Box>
                    )}

                    {/* Submit Button */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Button color="primary" variant="contained" fullWidth type="submit">
                            Update Voucher
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
}

export default EditVoucher;
