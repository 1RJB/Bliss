import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Card, CardContent, CardMedia } from '@mui/material';
import http from '../http';
import dayjs from 'dayjs';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

function HomepageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [homepage, setHomepage] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Fetch homepage details
    http.get(`/homepage/${id}`)
      .then((res) => setHomepage(res.data))
      .catch(err => console.error("Error fetching homepage details:", err));

    // Fetch products associated with the homepage
    http.get(`/homepage/${id}/products`)
      .then((res) => setProducts(res.data))
      .catch(err => console.error("Error fetching homepage products:", err));
  }, [id]);

  if (!homepage) {
    return <Typography>Loading homepage details...</Typography>;
  }

  // Configure carousel settings (using react-slick)
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 900, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        {homepage.Name}
      </Typography>
      {homepage.Description && (
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          {homepage.Description}
        </Typography>
      )}
      <Typography variant="body1" sx={{ mb: 2 }}>
        {homepage.WelcomeMessage}
      </Typography>
      <Typography variant="caption" display="block">
        Created: {dayjs(homepage.CreatedAt).format('YYYY-MM-DD HH:mm')}
      </Typography>
      <Typography variant="caption" display="block" sx={{ mb: 2 }}>
        Updated: {dayjs(homepage.UpdatedAt).format('YYYY-MM-DD HH:mm')}
      </Typography>

      {/* Edit Homepage Button */}
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" color="secondary" component={Link} to={`/edithomepage/${homepage.homepageId}`}>
          Edit Homepage
        </Button>
      </Box>

      {/* Product Carousel */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Products
      </Typography>
      {products.length > 0 ? (
        <Slider {...carouselSettings}>
          {products.map((product) => (
            <Box key={product.Id} sx={{ p: 1 }}>
              <Card sx={{ maxWidth: 300 }}>
                {product.ImageFile && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={product.ImageFile}
                    alt={product.name}
                  />
                )}
                <CardContent>
                  <Typography variant="h6">{product.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {product.Description}
                  </Typography>
                  <Typography variant="subtitle2">
                    Price: ${product.Price}
                  </Typography>
                  <Typography variant="caption">
                    Type: {product.Type}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Slider>
      ) : (
        <Typography>No products found for this homepage.</Typography>
      )}

      {/* Back Button */}
      <Box sx={{ mt: 4 }}>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Back to Homepages
        </Button>
      </Box>
    </Box>
  );
}

export default HomepageDetail;
