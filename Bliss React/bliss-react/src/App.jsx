import './App.css';
import { useState, useEffect } from 'react';
import { Container, AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import MyTheme from './themes/MyTheme';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import IconButton from '@mui/material/IconButton';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import ProductDetail from './pages/ProductDetail';
import Wishlists from './pages/Wishlist';
import EditWishlist from './pages/EditWishlist';
import Addwishlist from './pages/AddWishlist';
import WishlistDetail from './pages/WishlistDetail';
import Vouchers from './pages/Vouchers';
import MyVoucher from './pages/MyVoucher';
import AddVoucher from './pages/AddVoucher';
import EditVoucher from './pages/EditVoucher';
import Register from './pages/Register';
import Login from './pages/Login';
import UsersList from './pages/UsersList';
import UserDetails from './pages/UserDetails';
import EditUser from './pages/EditUser';
import ChangePassword from './pages/ChangePassword';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ActivityLogs from './pages/ActivityLogs';
import Homepages from './pages/Homepages';
import AddHomepage from './pages/AddHomepage';
import EditHomepage from './pages/EditHomepage';
import HomepageDetail from './pages/HomepageDetail';
import Cart from './pages/Cart';
import http from './http';
import UserContext from './contexts/UserContext';
import Payment from './pages/Payment';
import Shipping from './pages/Shipping';

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
                                {user && (
                                    <>
                                        {(user.role === 'staff' || user.role === 'admin') && (
                                            <Link to="/homepages" style={{ textDecoration: 'none', color: 'inherit', marginLeft: '16px' }}>
                                                <Typography>Homepages</Typography>
                                            </Link>
                                        )}
                                        {user.role === 'client' && (
                                            <Link to="/wishlists" style={{ textDecoration: 'none', color: 'inherit', marginLeft: '16px' }}>
                                                <Typography>Wishlists</Typography>
                                            </Link>
                                        )}
                                    </>
                                )}
                                <Link to="/vouchers" style={{ textDecoration: 'none', color: 'inherit', marginLeft: '16px' }}>
                                    <Typography>Vouchers</Typography>
                                </Link>
                                {user && (
                                    <>
                                        {user.role === 'client' && (
                                            <Link to="/myvoucher" style={{ textDecoration: 'none', color: 'inherit', marginLeft: '16px' }}>
                                                <Typography>My Voucher</Typography>
                                            </Link>
                                        )}
                                        {(user.role === 'staff' || user.role === 'admin') && (
                                            <Link to="/addvoucher" style={{ textDecoration: 'none', color: 'inherit', marginLeft: '16px' }}>
                                                <Typography>Add Voucher</Typography>
                                            </Link>
                                        )}
                                        {user.role === 'admin' && (
                                            <Link to="/users" style={{ textDecoration: 'none', color: 'inherit', marginLeft: '16px' }}>
                                                <Typography>Users</Typography>
                                            </Link>
                                        )}
                                        <Box sx={{ flexGrow: 1 }}></Box>

                                        <Button color="inherit" component={Link} to={`/users/${user.id}`}>
                                            {user.name}
                                        </Button>
                                        <IconButton component={Link} to="/cart" color="inherit" sx={{ ml: 1 }}>
                                            <ShoppingCartIcon />
                                        </IconButton>
                                        <Button onClick={logout} color="inherit">Logout</Button>
                                    </>
                                )}
                                {!user && (
                                    <div style={{ display: 'flex', marginLeft: 'auto' }}>
                                        <Link to="/register" style={{ textDecoration: 'none', color: 'inherit', marginLeft: '16px' }}>
                                            <Typography>Register</Typography>
                                        </Link>
                                        <Link to="/login" style={{ textDecoration: 'none', color: 'inherit', marginLeft: '16px' }}>
                                            <Typography>Login</Typography>
                                        </Link>
                                    </div>
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
                            <Route path="/vouchers" element={<Vouchers />} />
                            <Route path="/myvoucher" element={<MyVoucher />} />
                            <Route path="/addvoucher" element={<AddVoucher />} />
                            <Route path="/editvoucher/:id" element={<EditVoucher />} />
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
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/activity-logs" element={<ActivityLogs />} />
                            <Route path="/homepages" element={<Homepages />} />
                            <Route path="/addhomepage" element={<AddHomepage />} />
                            <Route path="/edithomepage/:id" element={<EditHomepage />} />
                            <Route path="/homepagedetail/:id" element={<HomepageDetail />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/payment" element={<Payment />} />
                            <Route path="/shipping" element={<Shipping />} />
                        </Routes>
                    </Container>
                </ThemeProvider>
            </Router>
        </UserContext.Provider>
    );
}

export default App;