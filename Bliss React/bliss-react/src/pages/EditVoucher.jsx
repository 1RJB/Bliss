import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { toast } from 'react-toastify';

// 🛠️ Validation schema for form fields
const validationSchema = yup.object({
    title: yup.string().trim().min(3).max(100).required(),
    description: yup.string().trim().min(3).max(500).required(),
    cost: yup.number().min(0).required(),
    validDuration: yup.number().min(1).required(),
    memberType: yup.number().oneOf([0, 1, 2]).required(),
    quantity: yup.number().min(0).required(),
});

function EditVoucher() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    // Fetch existing voucher data
    useEffect(() => {
        http.get(`/voucher/${id}`)
            .then((res) => {
                console.log('Fetched Data:', res.data);
                const fetchedData = {
                    title: res.data.title,
                    description: res.data.description,
                    cost: res.data.cost ?? 0,
                    validDuration: res.data.validDuration ?? 0,
                    memberType: parseInt(res.data.memberType, 10),
                    quantity: res.data.quantity ?? 0,
                };
                formik.setValues(fetchedData);
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
            cost: 0,
            validDuration: 1,
            memberType: 0,
            quantity: 0,
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            values.memberType = parseInt(values.memberType, 10);
            values.cost = values.cost ?? 0;
            values.validDuration = values.validDuration ?? 0;
            values.quantity = values.quantity ?? 0;

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
                                fullWidth label="Title"
                                name="title"
                                value={formik.values.title}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.title && Boolean(formik.errors.title)}
                                helperText={formik.touched.title && formik.errors.title}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth label="Description"
                                name="description"
                                value={formik.values.description}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.description && Boolean(formik.errors.description)}
                                helperText={formik.touched.description && formik.errors.description}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth label="Cost"
                                name="cost"
                                type="number"
                                value={formik.values.cost}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.cost && Boolean(formik.errors.cost)}
                                helperText={formik.touched.cost && formik.errors.cost}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth label="Valid Duration"
                                name="validDuration"
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
                            <TextField
                                fullWidth label="Quantity"
                                name="quantity"
                                type="number"
                                value={formik.values.quantity}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                                helperText={formik.touched.quantity && formik.errors.quantity}
                            />
                        </Grid>

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
