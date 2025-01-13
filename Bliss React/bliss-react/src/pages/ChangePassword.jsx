import { useState, useContext } from 'react';
import http from '../http';
import UserContext from '../contexts/UserContext';
import { TextField, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function ChangePassword() {
    const { user } = useContext(UserContext);
    const [formData, setFormData] = useState({
        id: user?.id,
        currentPassword: '',
        newPassword: ''
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    if (!user) {
        return <Alert severity="error">You need to be logged in to change your password.</Alert>;
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        // Input validation
        if (!formData.currentPassword || !formData.newPassword) {
            setError('Please fill in all required fields.');
            return;
        }

        http.put(`/User/${user.id}/changePassword`, formData)
            .then(() => {
                alert('Password changed successfully.');
                navigate('/');
            })
            .catch(() => {
                setError('Failed to change password. Please check your current password.');
            });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Change Password</h2>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
                label="Current Password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                required
                type="password"
                fullWidth
                margin="normal"
            />
            <TextField
                label="New Password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                required
                type="password"
                fullWidth
                margin="normal"
            />
            <Button type="submit" variant="contained" color="primary">
                Change Password
            </Button>
        </form>
    );
}

export default ChangePassword;
