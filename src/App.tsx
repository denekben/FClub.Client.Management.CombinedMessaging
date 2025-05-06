import React from 'react';
import './App.css';
import { SignInPage } from './Pages/SignInPage/SignInPage';
import { ToastContainer } from 'react-toastify';
import { UserProvider } from './Context/AuthContext';
import { TopBar } from './Components/TopBar';
import { MainPage } from './Pages/MainPage/MainPage';
import { Outlet, RouterProvider } from 'react-router-dom';

function App() {
  return (
    <UserProvider>
      <ToastContainer/>
      <Outlet />
    </UserProvider>
  );
}

export default App;
