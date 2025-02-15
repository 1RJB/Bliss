import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Grid, FormControlLabel, Checkbox } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AddHomepage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  // Fetch products from the product API
  useEffect(() => {
    http.get('/product')
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // Formik for homepage fields
  const formik = useFormik({
    initialValues: {
      Name: "",
      Description: "",
      WelcomeMessage: "",
      FeaturedProducts: "",
      BannerImages: ""
    },
    validationSchema: yup.object({
      Name: yup.string().trim()
        .min(3, 'Name must be at least 3 characters')
        .max(100, 'Name must be at most 100 characters')
        .required('Name is required'),
      Description: yup.string().trim()
        .max(500, 'Description must be at most 500 characters'),
      WelcomeMessage: yup.string().trim()
        .min(3, 'Welcome Message must be at least 3 characters')
        .max(255, 'Welcome Message must be at most 255 characters')
        .required('Welcome Message is required'),
      FeaturedProducts: yup.string().trim()
        .min(3, 'Featured Products must be at least 3 characters')
        .max(1000, 'Featured Products cannot exceed 1000 characters')
        .required('Featured Products is required'),
      BannerImages: yup.string().trim()
        .min(3, 'Banner Images must be at least 3 characters')
        .max(1000, 'Banner Images cannot exceed 1000 characters')
        .required('Banner Images is required')
    }),
    onSubmit: (data) => {
      // Trim inputs
      data.Name = data.Name.trim();
      data.Description = data.Description.trim();
      data.WelcomeMessage = data.WelcomeMessage.trim();
      data.FeaturedProducts = data.FeaturedProducts.trim();
      data.BannerImages = data.BannerImages.trim();

      // Construct payload: include the selected products (just using their IDs)
      const homepagePayload = {
        ...data,
        Products: selectedProductIds.map(id => ({ Id: id }))
      };

      http.post("/homepage", homepagePayload)
        .then((res) => {
          toast.success("Homepage added successfully!");
          navigate("/homepages");
        })
        .catch((error) => {
          console.error("Error adding homepage:", error);
          toast.error("Failed to add homepage. Please try again.");
        });
    }
  });

  // Handle checkbox selection for products
  const handleProductCheck = (e, productId) => {
    if (e.target.checked) {
      setSelectedProductIds(prev => [...prev, productId]);
    } else {
      setSelectedProductIds(prev => prev.filter(id => id !== productId));
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ my: 2 }}>
        Add Homepage
      </Typography>
      <Box component="form" onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              margin="dense"
              autoComplete="off"
              label="Name"
              name="Name"
              value={formik.values.Name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.Name && Boolean(formik.errors.Name)}
              helperText={formik.touched.Name && formik.errors.Name}
            />
            <TextField
              fullWidth
              margin="dense"
              autoComplete="off"
              multiline
              minRows={2}
              label="Description"
              name="Description"
              value={formik.values.Description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.Description && Boolean(formik.errors.Description)}
              helperText={formik.touched.Description && formik.errors.Description}
            />
            <TextField
              fullWidth
              margin="dense"
              autoComplete="off"
              multiline
              minRows={2}
              label="Welcome Message"
              name="WelcomeMessage"
              value={formik.values.WelcomeMessage}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.WelcomeMessage && Boolean(formik.errors.WelcomeMessage)}
              helperText={formik.touched.WelcomeMessage && formik.errors.WelcomeMessage}
            />
            <TextField
              fullWidth
              margin="dense"
              autoComplete="off"
              multiline
              minRows={2}
              label="Featured Products"
              name="FeaturedProducts"
              value={formik.values.FeaturedProducts}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.FeaturedProducts && Boolean(formik.errors.FeaturedProducts)}
              helperText={formik.touched.FeaturedProducts && formik.errors.FeaturedProducts}
            />
            <TextField
              fullWidth
              margin="dense"
              autoComplete="off"
              multiline
              minRows={2}
              label="Banner Images"
              name="BannerImages"
              value={formik.values.BannerImages}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.BannerImages && Boolean(formik.errors.BannerImages)}
              helperText={formik.touched.BannerImages && formik.errors.BannerImages}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Select Products to include:
            </Typography>
            {products.length > 0 ? (
              <Box sx={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #ccc', p: 1 }}>
                {products.map((product) => (
                  <FormControlLabel
                    key={product.id}
                    control={
                      <Checkbox
                        onChange={(e) => handleProductCheck(e, product.id)}
                        checked={selectedProductIds.includes(product.id)}
                      />
                    }
                    label={product.name}
                  />
                ))}
              </Box>
            ) : (
              <Typography>No products available.</Typography>
            )}
          </Grid>
        </Grid>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" type="submit">
            Add Homepage
          </Button>
        </Box>
      </Box>
      <ToastContainer />
    </Box>
  );
}

export default AddHomepage;
