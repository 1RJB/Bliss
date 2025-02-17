import { useState, useEffect } from 'react';
import http from '../http';
import { Link } from 'react-router-dom';
import { Typography, List, ListItem, ListItemText, CircularProgress, Alert, Button } from '@mui/material';

function UsersList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        http.get('/User')
            .then(res => {
                setUsers(res.data);
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to load users.');
                setLoading(false);
            });
    }, []);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Users
            </Typography>
            <List>
                {users.map(user => (
                    <ListItem key={user.id} button component={Link} to={`/users/${user.id}`}>
                        <ListItemText primary={user.name} secondary={user.email} />
                    </ListItem>
                ))}
            </List>
            <Button variant="contained" color="primary" onClick={() => navigate('/add-user')}>
                Add User
            </Button>
        </div>
    );
}

export default UsersList;
