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
  
    const formik = useFormik({
      initialValues: {
        title: "",
        description: "",
        cost: 0,
        validTill: "",
        status: 0,
        quantity: 0,
        value: 0,
      },
      validationSchema: yup.object({
        title: yup.string()
          .trim()
          .min(3, 'Title must be at least 3 characters')
          .max(100, 'Title must be at most 100 characters')
          .required('Title is required'),
  
        description: yup.string()
          .trim()
          .min(3, 'Description must be at least 3 characters')
          .max(500, 'Description must be at most 500 characters')
          .required('Description is required'),
  
        cost: yup.number()
          .typeError('Cost must be a number')
          .positive('Cost must be a positive number')
          .required('Cost is required'),
  
        validTill: yup.date()
          .typeError('Please enter a valid date')
          .required('Valid Till date is required'),

        quantity: yup.number()
          .typeError('Quantity must be a number')
          .integer('Quantity must be an integer')
          .min(0, 'Quantity cannot be negative')
          .required('Quantity is required'),
  
        value: yup.number()
          .typeError('Value must be a decimal number')
          .min(0, 'Quantity cannot be negative')
          .required('Value is required'),
      }),
      onSubmit: (data) => {
        // Include the uploaded image if available
        if (imageFile) {
          data.imageFile = imageFile;
        }
  
        // Trim fields
        data.title = data.title.trim();
        data.description = data.description.trim();
  
        console.log("Sending Data to API:", data);
  
        const token = localStorage.getItem("accessToken");
  
        http.post("/voucher", data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => {
            console.log("voucher Added:", res.data);
            navigate("/vouchers");
          })
          .catch((error) => {
            console.error("Error adding voucher:", error);
            toast.error("Error adding voucher");
          });
      }
    });
  
    const onFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 1024 * 1024) { // 1MB limit
          toast.error('Maximum file size is 1MB');
          return;
        }
  
        const formData = new FormData();
        formData.append('file', file);
        http.post('/file/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
          .then((res) => {
            setImageFile(res.data.filename);
          })
          .catch((error) => {
            console.error(error.response);
            toast.error('File upload failed');
          });
      }
    };
  
    return (
      <Box sx={{ maxWidth: 600, margin: '0 auto', p: 2 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Add Voucher</Typography>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            {/* Title */}
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
  
            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                multiline
                rows={4}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>
  
            {/* Cost */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="cost"
                name="cost"
                label="Cost"
                type="number"
                value={formik.values.cost}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.cost && Boolean(formik.errors.cost)}
                helperText={formik.touched.cost && formik.errors.cost}
              />
            </Grid>
  
            {/* Value */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="value"
                name="value"
                label="Value"
                type="number"
                value={formik.values.value}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.value && Boolean(formik.errors.value)}
                helperText={formik.touched.value && formik.errors.value}
              />
            </Grid>
  
            {/* Valid Till */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="validTill"
                name="validTill"
                label="Valid Till"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formik.values.validTill}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.validTill && Boolean(formik.errors.validTill)}
                helperText={formik.touched.validTill && formik.errors.validTill}
              />
            </Grid>
  
            {/* Quantity */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="quantity"
                name="quantity"
                label="Quantity"
                type="number"
                value={formik.values.quantity}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                helperText={formik.touched.quantity && formik.errors.quantity}
              />
            </Grid>
  
            {/* File Upload */}
           <Grid item xs={12}>
                                   <Box sx={{ textAlign: 'center', mt: 2 }} >
                                       <Button variant="contained" component="label">
                                           Upload Image
                                           <input hidden accept="image/*" type="file" onChange={onFileChange} />
                                       </Button>
                                       {imageFile && (
                                           <Box sx={{ mt: 2 }}>
                                               <img alt="voucher" src={`${import.meta.env.VITE_FILE_BASE_URL}${imageFile}`} style={{ width: "100%", maxWidth: "300px" }} />
                                           </Box>
                                       )}
                                   </Box>
                               </Grid>
  
            {/* Submit Button */}
            <Grid item xs={12}>
              <Button color="primary" variant="contained" fullWidth type="submit">
                Add Voucher
              </Button>
            </Grid>
          </Grid>
        </form>
        <ToastContainer />
      </Box>
    );
  }
  
  export default AddVoucher;
