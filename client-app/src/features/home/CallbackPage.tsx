import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../app/stores/store';

export default function CallbackPage() {
    const { userStore} = useStore();
    const navigate = useNavigate();

    useEffect(() => {
        const handleLoginCallback = async () => {
            try {
                await userStore.handleCallback();
                navigate('/'); // Redirect to the homepage after successful login
            } catch (error) {
                console.error('Error during callback handling:', error);
            }
        };

        handleLoginCallback();
    }, [history]);

    return <div>Processing login...</div>;
}