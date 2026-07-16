import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBz-uNAzri0ekv_C7Tb_g2BxygWi9GcSBU',
  authDomain: 'smart-travel-rd-7e5ac.firebaseapp.com',
  projectId: 'smart-travel-rd-7e5ac',
  storageBucket:
    'smart-travel-rd-7e5ac.firebasestorage.app',
  messagingSenderId: '105363717459',
  appId:
    '1:105363717459:web:3e0cf3aaa868d5a27a75a6',
  measurementId: 'G-5DWV7HKV8X',
};

export const firebaseApp =
  initializeApp(firebaseConfig);

export const firebaseAuth =
  getAuth(firebaseApp);