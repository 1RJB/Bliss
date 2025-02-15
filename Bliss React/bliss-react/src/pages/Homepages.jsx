import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, Input, IconButton, Button } from '@mui/material';
import { Search, Clear, Add } from '@mui/icons-material';
import http from '../http';
import dayjs from 'dayjs';
import UserContext from '../contexts/UserContext';

function Homepages() {
  const [homepageList, setHomepageList] = useState([]);
  const [search, setSearch] = useState('');
  const { user } = useContext(UserContext);

  const onSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const getHomepages = () => {
    http.get('/homepage')
      .then((res) => setHomepageList(res.data))
      .catch(err => console.error("Error fetching homepages:", err));
  };

  const searchHomepages = () => {
    http.get(`/homepage?search=${search}`)
      .then((res) => setHomepageList(res.data))
      .catch(err => console.error("Error searching homepages:", err));
  };

  useEffect(() => {
    getHomepages();
  }, []);

  const onSearchKeyDown = (e) => {
    if (e.key === "Enter") searchHomepages();
  };

  const onClickSearch = () => searchHomepages();
  const onClickClear = () => {
    setSearch('');
    getHomepages();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, color: 'primary.main', textAlign: 'center' }}>
        Homepages
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'center' }}>
        <Input
          value={search}
          placeholder="Search Homepages"
          onChange={onSearchChange}
          onKeyDown={onSearchKeyDown}
          sx={{
            borderRadius: '4px',
            padding: '8px',
            border: '1px solid',
            borderColor: 'secondary.main',
          }}
        />
        <IconButton color="primary" onClick={onClickSearch} sx={{ ml: 1 }}>
          <Search />
        </IconButton>
        <IconButton color="primary" onClick={onClickClear} sx={{ ml: 1 }}>
          <Clear />
        </IconButton>
        <Link to="/addhomepage" style={{ textDecoration: 'none', marginLeft: 'auto' }}>
          <Button variant="contained" startIcon={<Add />} color="secondary">
            Add Homepage
          </Button>
        </Link>
      </Box>
      <Grid container spacing={3}>
        {homepageList.map((homepage) => (
          <Grid item xs={12} md={6} lg={4} key={homepage.homepageId}>
            <Card
              sx={{
                backgroundColor: 'background.paper',
                color: 'text.primary',
                borderRadius: '8px',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'scale(1.05)' },
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {homepage.Name}
                </Typography>
                {homepage.Description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {homepage.Description}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {homepage.WelcomeMessage}
                </Typography>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Link to={`/homepagedetail/${homepage.homepageId}`} style={{ textDecoration: 'none' }}>
                    <Button variant="contained" color="primary">
                      View Details
                    </Button>
                  </Link>
                </Box>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption">
                    Created: {dayjs(homepage.CreatedAt).format('YYYY-MM-DD HH:mm')}
                  </Typography>
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    Updated: {dayjs(homepage.UpdatedAt).format('YYYY-MM-DD HH:mm')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Homepages;
