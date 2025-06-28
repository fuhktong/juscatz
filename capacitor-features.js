// Example Capacitor Native Features for JusCatz
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { PushNotifications } from '@capacitor/push-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// Camera Integration (for profile pictures, posts)
export async function takePicture() {
    try {
        const image = await Camera.getPhoto({
            quality: 90,
            allowEditing: true,
            resultType: CameraResultType.Base64,
            source: CameraSource.Camera
        });
        
        return image.base64String;
    } catch (error) {
        console.error('Camera error:', error);
        return null;
    }
}

// Push Notifications (for likes, comments, follows)
export async function initializePushNotifications() {
    try {
        // Request permission
        let permStatus = await PushNotifications.checkPermissions();
        
        if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
        }
        
        if (permStatus.receive !== 'granted') {
            throw new Error('User denied permissions!');
        }
        
        // Register for push notifications
        await PushNotifications.register();
        
        // Listen for registration token
        PushNotifications.addListener('registration', (token) => {
            console.log('Push registration success, token: ' + token.value);
            // Send token to your PHP backend
            sendTokenToServer(token.value);
        });
        
        // Listen for push notifications
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('Push received: ', notification);
            // Handle notification when app is open
        });
        
    } catch (error) {
        console.error('Push notification error:', error);
    }
}

// Haptic Feedback (for button taps, likes)
export async function hapticFeedback(style = ImpactStyle.Medium) {
    try {
        await Haptics.impact({ style });
    } catch (error) {
        console.error('Haptics error:', error);
    }
}

// Helper function to send token to your PHP backend
async function sendTokenToServer(token) {
    try {
        await fetch('/api/save-push-token.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token })
        });
    } catch (error) {
        console.error('Failed to save push token:', error);
    }
}

// Usage Examples:

// In your post creation:
// const imageBase64 = await takePicture();

// In your app initialization:
// await initializePushNotifications();

// On button clicks (like, follow, etc):
// await hapticFeedback();