import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import http from '../http';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import dayjs from 'dayjs';

function EditHomepage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State for homepage details and associated products
  const [loading, setLoading] = useState(true);
  const [homepage, setHomepage] = useState({
    Name: "",
    Description: "",
    WelcomeMessage: "",
    FeaturedProducts: "",
    BannerImages: ""
  });
  // Currently associated products (from homepage) 
  const [associatedProducts, setAssociatedProducts] = useState([]);
  // All available products from the product API
  const [allProducts, setAllProducts] = useState([]);
  // For product selection via checkboxes – store selected product IDs
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  // For delete confirmation
  const [openDelete, setOpenDelete] = useState(false);

  // Fetch homepage details, its associated products, and all available products
  useEffect(() => {
    // Fetch homepage details
    http.get(`/homepage/${id}`)
      .then((res) => {
        setHomepage(res.data);
        // Pre-select associated product IDs if any
        if (res.data.Products && res.data.Products.length > 0) {
          const ids = res.data.Products.map(prod => prod.Id);
          setAssociatedProducts(res.data.Products);
          setSelectedProductIds(ids);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching homepage data:", error);
        toast.error("Failed to fetch homepage data.");
        navigate("/homepages");
      });

    // Fetch all products (for selection)
    http.get(`/product`)
      .then((res) => {
        setAllProducts(res.data);
      })
      .catch((error) => {
        console.error("Error fetching all products:", error);
      });
  }, [id, navigate]);

  // Formik for editing homepage details
  const formik = useFormik({
    initialValues: homepage,
    enableReinitialize: true,
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
      // Trim inputs before submitting
      data.Name = data.Name.trim();
      data.Description = data.Description ? data.Description.trim() : "";
      data.WelcomeMessage = data.WelcomeMessage.trim();
      data.FeaturedProducts = data.FeaturedProducts.trim();
      data.BannerImages = data.BannerImages.trim();

      // Add the selected products to the payload
      data.Products = selectedProductIds.map(prodId => ({ Id: prodId }));

      http.put(`/homepage/${id}`, data)
        .then((res) => {
          toast.success("Homepage updated successfully!");
          navigate("/homepages");
        })
        .catch((error) => {
          console.error("Error updating homepage:", error);
          toast.error("Failed to update homepage. Please try again.");
        });
    }
  });

  // Handler for delete confirmation
  const handleDeleteOpen = () => setOpenDelete(true);
  const handleDeleteClose = () => setOpenDelete(false);
  const deleteHomepage = () => {
    http.delete(`/homepage/${id}`)
      .then(() => {
        toast.success("Homepage deleted successfully!");
        navigate("/homepages");
      })
      .catch((error) => {
        console.error("Error deleting homepage:", error);
        toast.error("Failed to delete homepage.");
      });
  };

  // Handler for checkbox selection for products
  const handleProductCheck = (e, productId) => {
    if (e.target.checked) {
      setSelectedProductIds(prev => [...prev, productId]);
    } else {
      setSelectedProductIds(prev => prev.filter(id => id !== productId));
    }
  };

  if (loading) {
    return <Typography>Loading homepage data...</Typography>;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ my: 2 }}>
        Edit Homepage
      </Typography>
      <Box component="form" onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              margin="dense"
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
              label="Description"
              name="Description"
              multiline
              minRows={2}
              value={formik.values.Description || ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.Description && Boolean(formik.errors.Description)}
              helperText={formik.touched.Description && formik.errors.Description}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Welcome Message"
              name="WelcomeMessage"
              multiline
              minRows={2}
              value={formik.values.WelcomeMessage}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.WelcomeMessage && Boolean(formik.errors.WelcomeMessage)}
              helperText={formik.touched.WelcomeMessage && formik.errors.WelcomeMessage}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Featured Products"
              name="FeaturedProducts"
              multiline
              minRows={2}
              value={formik.values.FeaturedProducts}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.FeaturedProducts && Boolean(formik.errors.FeaturedProducts)}
              helperText={formik.touched.FeaturedProducts && formik.errors.FeaturedProducts}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Banner Images"
              name="BannerImages"
              multiline
              minRows={2}
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
            {allProducts.length > 0 ? (
              <Box sx={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #ccc', p: 1 }}>
                {allProducts.map((product) => (
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
            Update Homepage
          </Button>
          <Button variant="contained" sx={{ ml: 2 }} color="error" onClick={handleDeleteOpen}>
            Delete Homepage
          </Button>
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={handleDeleteClose}>
        <DialogTitle>Delete Homepage</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this homepage?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="inherit" onClick={handleDeleteClose}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={deleteHomepage}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </Box>
  );
}

export default EditHomepage;
