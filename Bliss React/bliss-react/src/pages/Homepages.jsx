import React from 'react';
import { Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      {/* Large brand image */}
      <img
        src="/peace-hope-pigeon-svgrepo-com.svg"
        alt="Bliss Brand"
        style={{ width: '350px', maxWidth: '100%', marginBottom: '1rem' }}
      />
      <Typography variant="h2" gutterBottom>
        Bliss
      </Typography>
      <Typography variant="h5" gutterBottom>
        Welcome to Bliss – Your one-stop shop for skincare products!
      </Typography>
      <div
        style={{
          marginTop: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          maxWidth: '300px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      >
        <Button variant="contained" onClick={() => navigate('/products')}>
          View Products
        </Button>
        <Button variant="contained" onClick={() => navigate('/wishlists')}>
          Wishlists
        </Button>
        <Button variant="contained" onClick={() => navigate('/vouchers')}>
          Vouchers
        </Button>
      </div>
    </div>
  );
}

export default HomePage;
