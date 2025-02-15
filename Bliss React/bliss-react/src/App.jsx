import './App.css';
import { useState, useEffect } from 'react';
import { Container, AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import MyTheme from './themes/MyTheme';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import ProductDetail from './pages/ProductDetail';
import Wishlists from './pages/Wishlist';
import EditWishlist from './pages/EditWishlist';
import Addwishlist from './pages/AddWishlist';
import WishlistDetail from './pages/WishlistDetail'; // ✅ Correct import
import MyForm from './pages/MyForm';
import Register from './pages/Register';
import Login from './pages/Login';
import UsersList from './pages/UsersList';
import UserDetails from './pages/UserDetails';
import EditUser from './pages/EditUser';
import ChangePassword from './pages/ChangePassword';
import ActivityLogs from './pages/ActivityLogs';
import Homepages from './pages/Homepages';         
import AddHomepage from './pages/AddHomepage';       
import EditHomepage from './pages/EditHomepage';
import HomepageDetail from './pages/HomepageDetail';     
import http from './http';
import UserContext from './contexts/UserContext';

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (localStorage.getItem('accessToken')) {
            http.get('/User/auth')
                .then(res => {
                    setUser(res.data.user);
                })
                .catch(() => {
                    localStorage.clear();
                    setUser(null);
                });
        }
    }, []);

    const logout = () => {
        localStorage.clear();
        setUser(null);
        window.location = '/';
    };

    return (
        <UserContext.Provider value={{ user, setUser }}>
            <Router>
                <ThemeProvider theme={MyTheme}>
                    <AppBar position="static" className="AppBar">
                        <Container>
                            <Toolbar disableGutters={true}>
                                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <Typography variant="h6" component="div">
                                        Bliss
                                    </Typography>
                                </Link>
                                <Link to="/products" style={{ textDecoration: 'none', color: 'inherit', marginLeft: '16px' }}>
                                    <Typography>Products</Typography>
                                </Link>
                                <Link to="/homepages" style={{ textDecoration: 'none', color: 'inherit', marginLeft: '16px' }}>
                                    <Typography>Homepages</Typography>
                                </Link>

                                <Link to="/wishlists" style={{ textDecoration: 'none', color: 'inherit', marginLeft: '16px' }}>
                                    <Typography>Wishlists</Typography>
                                </Link>
                                <Link to="/users" style={{ textDecoration: 'none', color: 'inherit', marginLeft: '16px' }}>
                                    <Typography>Users</Typography>
                                </Link>
                                <Box sx={{ flexGrow: 1 }}></Box>
                                {user && (
                                    <>
                                        <Button color="inherit" component={Link} to={`/users/${user.id}`}>
                                            {user.name}
                                        </Button>
                                        <Button onClick={logout} color="inherit">Logout</Button>
                                    </>
                                )}
                                {!user && (
                                    <>
                                        <Link to="/register" style={{ textDecoration: 'none', color: 'inherit', marginLeft: '16px' }}>
                                            <Typography>Register</Typography>
                                        </Link>
                                        <Link to="/login" style={{ textDecoration: 'none', color: 'inherit', marginLeft: '16px' }}>
                                            <Typography>Login</Typography>
                                        </Link>
                                    </>
                                )}
                            </Toolbar>
                        </Container>
                    </AppBar>

                    <Container>
                        <Routes>
                            <Route path="/" element={<Products />} />
                            <Route path="/products" element={<Products />} />
                            <Route path="/addproduct" element={<AddProduct />} />
                            <Route path="/editproduct/:id" element={<EditProduct />} />
                            <Route path="/productdetail/:id" element={<ProductDetail />} />
                            <Route path="/wishlists" element={<Wishlists />} />
                            <Route path="/editwishlist/:id" element={<EditWishlist />} />
                            <Route path="/addwishlist" element={<Addwishlist />} />
                            <Route path="/wishlist/:id" element={<WishlistDetail />} /> 
                            <Route path="/register" element={<Register />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/users" element={<UsersList />} />
                            <Route path="/users/:id" element={<UserDetails />} />
                            <Route path="/edituser/:id" element={<EditUser />} />
                            <Route path="/change-password" element={<ChangePassword />} />
                            <Route path="/activity-logs" element={<ActivityLogs />} />
                            <Route path="/homepages" element={<Homepages />} />
                            <Route path="/addhomepage" element={<AddHomepage />} />
                            <Route path="/edithomepage/:id" element={<EditHomepage />} />
                            <Route path="/homepagedetail/:id" element={<HomepageDetail />} />
                        </Routes>
                    </Container>
                </ThemeProvider>
            </Router>
        </UserContext.Provider>
    );
}

export default App;
