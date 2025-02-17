import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem, CardMedia } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

// Validation schema for the form fields
const validationSchema = yup.object({
    Title: yup.string().trim().min(3, 'Title must be at least 3 characters').max(100, 'Title is too long').required('Title is required'),
    Description: yup.string().trim().min(3, 'Description must be at least 3 characters').max(500, 'Description is too long').required('Description is required'),
    Cost: yup.number().min(0, 'Cost cannot be negative').required('Cost is required'),
    ValidTill: yup.date().required('Valid Till date is required'),
    Quantity: yup.number().min(0, 'Quantity cannot be negative').required('Quantity is required'),
    Value: yup.number().min(0, 'Value cannot be negative').required('Value is required'),
    ImageFile: yup.string(), // This will store the filename
  });
  
  function EditVoucher() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [preview, setPreview] = useState(null);
  
    const formik = useFormik({
      initialValues: {
        Title: '',
        Description: '',
        Cost: 0,
        ValidTill: dayjs().format('YYYY-MM-DD'),
        Quantity: 0,
        Value: 0,
        ImageFile: '',
      },
      validationSchema,
      onSubmit: (values) => {
        console.log("Submitting Data:", values);
        // Call the PUT endpoint to update the voucher
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
  
    // Fetch the voucher data to pre-populate the form
    useEffect(() => {
      http.get(`/voucher/${id}`)
        .then((res) => {
          console.log('Fetched Data:', res.data);
          const fetchedData = {
            Title: res.data.title,
            Description: res.data.description,
            Cost: res.data.cost ?? 0,
            ValidTill: dayjs(res.data.validTill).format('YYYY-MM-DD'),
            Quantity: res.data.quantity ?? 0,
            Value: res.data.value ?? 0,
            ImageFile: res.data.imageFile || '',
          };
          formik.setValues(fetchedData);
          if (fetchedData.ImageFile) {
            setPreview(`${import.meta.env.VITE_FILE_BASE_URL}${fetchedData.ImageFile}`);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching voucher:', err);
          setLoading(false);
        });
    }, [id]);
  
    // Handle file input change and upload the file to get a new filename
    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      http.post('/file/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
        .then((res) => {
          // Assuming the response contains the filename in res.data.filename
          formik.setFieldValue('ImageFile', res.data.filename);
          setPreview(`${import.meta.env.VITE_FILE_BASE_URL}${res.data.filename}`);
          toast.success('Image uploaded successfully');
        })
        .catch((err) => {
          console.error('Error uploading image:', err);
          toast.error('File upload failed');
        });
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
                  label="Title"
                  name="Title"
                  value={formik.values.Title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.Title && Boolean(formik.errors.Title)}
                  helperText={formik.touched.Title && formik.errors.Title}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="Description"
                  value={formik.values.Description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.Description && Boolean(formik.errors.Description)}
                  helperText={formik.touched.Description && formik.errors.Description}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Cost"
                  name="Cost"
                  type="number"
                  value={formik.values.Cost}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.Cost && Boolean(formik.errors.Cost)}
                  helperText={formik.touched.Cost && formik.errors.Cost}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Valid Till"
                  name="ValidTill"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formik.values.ValidTill}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.ValidTill && Boolean(formik.errors.ValidTill)}
                  helperText={formik.touched.ValidTill && formik.errors.ValidTill}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Quantity"
                  name="Quantity"
                  type="number"
                  value={formik.values.Quantity}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.Quantity && Boolean(formik.errors.Quantity)}
                  helperText={formik.touched.Quantity && formik.errors.Quantity}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Value"
                  name="Value"
                  type="number"
                  value={formik.values.Value}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.Value && Boolean(formik.errors.Value)}
                  helperText={formik.touched.Value && formik.errors.Value}
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" component="label">
                  Upload Image
                  <input type="file" hidden onChange={handleFileChange} />
                </Button>
                {preview && (
                  <Box mt={2}>
                    <Typography variant="subtitle2">Image Preview:</Typography>
                    <CardMedia
                      component="img"
                      height="150"
                      image={preview}
                      alt="Voucher Image"
                    />
                  </Box>
                )}
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