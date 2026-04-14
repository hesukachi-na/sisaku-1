import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCxZwd99EC4rPosjHqG6BXUeJeE39E2dJk",
  authDomain: "sousakukatu-55cbd.firebaseapp.com",
  projectId: "sousakukatu-55cbd",
  storageBucket: "sousakukatu-55cbd.firebasestorage.app",
  messagingSenderId: "154311925589",
  appId: "1:154311925589:web:6563e6a8fa069b3e3a19dc"
};

export const db = getDatabase(initializeApp(firebaseConfig));
