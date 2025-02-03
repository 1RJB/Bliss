import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#333333', // Dark gray for text and accents
            contrastText: '#FFFFFF', // White for buttons
        },
        secondary: {
            main: '#FFFFFF', // White for background highlights
        },
        background: {
            default: '#FFFFFF', // White background
            paper: '#F9F9F9', // Slightly off-white for cards and paper
        },
        text: {
            primary: '#333333', // Black text
            secondary: '#666666', // Gray for descriptions
        },
    },
    typography: {
        fontFamily: '"Helvetica Neue", Arial, sans-serif',
        h1: {
            fontWeight: 400,
            fontSize: '2.5rem',
            lineHeight: 1.5,
            letterSpacing: '0.02em',
        },
        h2: {
            fontWeight: 400,
            fontSize: '2rem',
            lineHeight: 1.5,
            letterSpacing: '0.02em',
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.8,
            letterSpacing: '0.02em',
        },
        button: {
            textTransform: 'none', // Disable all caps
            fontWeight: 400,
            letterSpacing: '0.1em',
        },
    },
    shape: {
        borderRadius: 0, // Clean and sharp corners
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 0, // No rounded corners
                    boxShadow: 'none',
                    ':hover': {
                        backgroundColor: '#f5f5f5', // Subtle hover effect
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    border: '1px solid #e0e0e0',
                    boxShadow: 'none',
                    borderRadius: 0,
                },
            },
        },
    },
});

export default theme;
