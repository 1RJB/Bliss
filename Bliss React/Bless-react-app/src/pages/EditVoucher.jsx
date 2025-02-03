import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { toast } from 'react-toastify';

// Validation schema
const validationSchema = yup.object({
    title: yup.string('Enter voucher title').required('Title is required'),
    description: yup.string('Enter voucher description').required('Description is required'),
    validDuration: yup.number('Enter valid duration').required('Valid duration is required'),
    status: yup.string('Select status').required('Status is required'),
    memberType: yup.string('Select member type').required('Member type is required'),
});

// Error boundary component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <Typography variant="h6" color="error">Something went wrong.</Typography>;
        }

        return this.props.children;
    }
}

function EditVoucher() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [imageFile, setImageFile] = useState('');
    const baseURL = import.meta.env.VITE_FILE_BASE_URL || 'http://localhost:5000/';

    useEffect(() => {
        http.get(`/voucher/${id}`)
            .then((res) => {
                console.log('Fetched Data:', res.data);
                formik.setValues(res.data);
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
            validDuration: '',
            status: '',
            memberType: '',
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            http.put(`/voucher/${id}`, values)
                .then(() => {
                    toast.success('Voucher updated successfully');
                })
                .catch((err) => {
                    toast.error('Error updating voucher');
                    console.error('Error updating voucher:', err);
                });
        },
    });

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
                    <Grid container spacing={3}> {/* Adjusted spacing here */}
                        <Grid item xs={12}>
                            {/* Title Field */}
                            <TextField
                                fullWidth
                                id="title"
                                name="title"
                                label="Title"
                                value={formik.values.title}
                                onChange={formik.handleChange}
                                error={formik.touched.title && Boolean(formik.errors.title)}
                                helperText={formik.touched.title && formik.errors.title}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            {/* Description Field */}
                            <TextField
                                fullWidth
                                id="description"
                                name="description"
                                label="Description"
                                value={formik.values.description}
                                onChange={formik.handleChange}
                                error={formik.touched.description && Boolean(formik.errors.description)}
                                helperText={formik.touched.description && formik.errors.description}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            {/* Valid Duration Field */}
                            <TextField
                                fullWidth
                                id="validDuration"
                                name="validDuration"
                                label="Valid Duration"
                                value={formik.values.validDuration}
                                onChange={formik.handleChange}
                                error={formik.touched.validDuration && Boolean(formik.errors.validDuration)}
                                helperText={formik.touched.validDuration && formik.errors.validDuration}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            {/* Status Field */}
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Status</InputLabel>
                                <Select
                                    name="status"
                                    value={formik.values.status}
                                    onChange={formik.handleChange}
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
                        </Grid>

                        <Grid item xs={12}>
                            {/* Member Type Field */}
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Member Type</InputLabel>
                                <Select
                                    name="memberType"
                                    value={formik.values.memberType}
                                    onChange={formik.handleChange}
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
                        </Grid>

                        <Grid item xs={12}>
                            {/* File Upload Button */}
                            <Button
                                variant="contained"
                                component="label"
                                sx={{ mt: 2 }}
                            >
                                Upload File
                                <input type="file" hidden onChange={handleFileChange} />
                            </Button>
                        </Grid>

                        {imageFile && (
                            <Grid item xs={12}>
                                {/* Image Preview */}
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
                            {/* Submit Button */}
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

function App() {
    return (
        <ErrorBoundary>
            <EditVoucher />
        </ErrorBoundary>
    );
}

export default App;
