import firebase from 'firebase/compat/app';

export const formatDate = (timestamp: firebase.firestore.Timestamp | null): string => {
    if (!timestamp) return '';
    return new Date(timestamp.seconds * 1000).toISOString().split('T')[0];
};
