import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import http from '../http';
import { TextField, Button, Alert, CircularProgress } from '@mui/material';
import UserContext from '../contexts/UserContext';

function EditUser() {
    const { id } = useParams();
    const { user: currentUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ id: id, name: '', email: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (currentUser?.id !== parseInt(id)) {
            setError('You are not authorized to edit this user.');
            setLoading(false);
            return;
        }
        http.get(`/User/${id}`)
            .then(res => {
                setFormData(res.data);
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to load user data.');
                setLoading(false);
            });
    }, [id, currentUser]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Input validation
        if (!formData.name || !formData.email) {
            setError('Please fill in all required fields.');
            return;
        }

        http.put(`/User/${id}`, formData)
            .then(() => {
                navigate(`/users/${id}`);
            })
            .catch(() => {
                setError('Failed to update user.');
            });
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <form onSubmit={handleSubmit}>
            <h2>Edit User</h2>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
                margin="normal"
            />
            <TextField
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                type="email"
                fullWidth
                margin="normal"
            />
            <Button type="submit" variant="contained" color="primary">
                Update
            </Button>
        </form>
    );
}

export default EditUser;
