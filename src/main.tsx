import 'leaflet/dist/leaflet.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import './index.css';
import Acara from './routes/acara.tsx';
import AdminDashboard from './routes/admin/dashboard.tsx';
import LoginPage from './routes/admin/login.tsx';
import DetailAcara from './routes/detail-acara.tsx';
import DetailKuliner from './routes/detail-kuliner.tsx';
import DetailWisata from './routes/detail-wisata.tsx';
import Kuliner from './routes/kuliner.tsx';
import Peta from './routes/peta.tsx';
import Profil from './routes/profil.tsx';
import Root from './routes/root.tsx';
import TempatWisata from './routes/tempat-wisata.tsx';
// Fungsi untuk mengecek apakah pengguna sudah login
const isAuthenticated = () => {
  const token = localStorage.getItem('authToken'); // Ganti sesuai kebutuhan
  return !!token; // Mengembalikan true jika token ada
};

// Definisi router utama
const router = createBrowserRouter([
  // PUBLIC ROUTES
  {
    path: '/',
    element: <Root />,
    children: [
      { path: 'peta', element: <Peta /> },
      { path: 'tempat-wisata', element: <TempatWisata /> },
      { path: 'tempat-wisata/:id', element: <DetailWisata /> },
      { path: 'kuliner', element: <Kuliner /> },
      { path: 'kuliner/:id', element: <DetailKuliner /> },
      { path: 'acara', element: <Acara /> },
      { path: 'acara/:id', element: <DetailAcara /> },
      { path: 'profil', element: <Profil /> },
    ],
  },

  // ADMIN ROUTES
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/adminDashboard',
    element: isAuthenticated() ? <AdminDashboard /> : <Navigate to="/login" replace />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
