import { useState, useEffect, useContext } from 'react';
import http from '../http';
import UserContext from '../contexts/UserContext';
import { Typography, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';

function ActivityLogs() {
    const { user } = useContext(UserContext);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            setError('You need to be logged in to view activity logs.');
            setLoading(false);
            return;
        }

        http.get(`/User/${user.id}/activityLogs`)
            .then(res => {
                setLogs(res.data);
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to load activity logs.');
                setLoading(false);
            });
    }, [user]);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Activity Logs
            </Typography>
            <List>
                {logs.map(log => (
                    <ListItem key={log.id}>
                        <ListItemText primary={log.action} secondary={new Date(log.timestamp).toLocaleString()}  />
                        <iframe
                            width="300"
                            height="200"
                            style={{border:0}}
                            src={`https://www.google.com/maps?q=${log.latitude},${log.longitude}&hl=es;z=14&output=embed`}
                            allowFullScreen>
                        </iframe>
                        <Typography variant="body2" color="textSecondary">
                            {log.location}
                        </Typography>
                    </ListItem>
                ))}
            </List>
        </div>
    );
}

export default ActivityLogs;