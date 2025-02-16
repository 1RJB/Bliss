import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import http from '../http';
import { Typography, Button, CircularProgress, Alert } from '@mui/material';
import { useContext } from 'react';
import UserContext from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

function UserDetails() {
    const { id } = useParams();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleDelete = () => {
        if (user?.id !== parseInt(id)) {
            setError('You are not authorized to view this user.');
            setLoading(false);
            return;
        }
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            http.delete(`/User/${id}`)
                .then(() => {
                    if (user.id === parseInt(id)) {
                        // If user is deleting their own account, log them out
                        localStorage.clear();
                        setUser(null);
                        navigate('/register');
                    } else {
                        navigate('/users');
                    }
                })
                .catch(() => {
                    alert('Failed to delete user.');
                });
        }
    };

    useEffect(() => {
        if (user?.id !== parseInt(id)) {
            setError('You are not authorized to view this user.');
            setLoading(false);
            return;
        }

        http.get(`/User/${id}`)
            .then(res => {
                setUserDetails(res.data);
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to load user details.');
                setLoading(false);
            });
    }, [id, user]);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!user) return null;

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                User Details
            </Typography>
            <Typography variant="body1">
                <strong>Name:</strong> {user.name}
            </Typography>
            <Typography variant="body1">
                <strong>Email:</strong> {user.email}
            </Typography>
            <Button variant="contained" component={Link} to={`/edituser/${user.id}`} sx={{ mt: 2 }}>
                Edit User
            </Button>
            <Button variant="outlined" component={Link} to="/change-password" sx={{ mt: 2, ml: 2 }}>
                Change Password
            </Button>
            <Button variant="outlined" component={Link} to="/activity-logs" sx={{ mt: 2, ml: 2 }}>
                Activity Logs
            </Button>
            {user?.id === user.id && (
                <Button variant="outlined" color="error" onClick={handleDelete} sx={{ mt: 2, ml: 2 }}>
                    Delete Account
                </Button>
            )}
        </div>
    );
}

export default UserDetails;
