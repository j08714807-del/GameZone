import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey:            'AIzaSyCdGlrVlqyXyKpzet3xNLqV4mxY7wDdyEw',
  authDomain:        'game-zone-d33a7.firebaseapp.com',
  projectId:         'game-zone-d33a7',
  storageBucket:     'game-zone-d33a7.firebasestorage.app',
  messagingSenderId: '405696202283',
  appId:             '1:405696202283:web:c8cdf3bb9415d4af924c6e',
  measurementId:     'G-RHX1D9WHGE',
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
};
