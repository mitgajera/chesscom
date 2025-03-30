import React from 'react';
import { toast, ToastContainer, ToastOptions } from 'react-toastify';

// Custom toast sizing based on screen width
function getToastConfig(): ToastOptions {
  const isMobile = window.innerWidth < 768;
  
  if (isMobile) {
    return {
      position: "bottom-center",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      style: {
        fontSize: '12px',
        maxWidth: '90%',
        margin: '0 auto'
      }
    };
  }
  
  return {
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined
  };
}

// Custom toast functions for different types
export const responsiveToast = {
  success: (message: string) => toast.success(message, getToastConfig()),
  error: (message: string) => toast.error(message, getToastConfig()),
  info: (message: string) => toast.info(message, getToastConfig()),
  warning: (message: string) => toast.warning(message, getToastConfig())
};

// Custom toast container
export const ResponsiveToastContainer: React.FC = () => {
  const isMobile = window.innerWidth < 768;
  
  return (
    <ToastContainer
      position={isMobile ? "bottom-center" : "bottom-right"}
      autoClose={isMobile ? 3000 : 5000}
      hideProgressBar={isMobile}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      className="responsive-toast-container"
    />
  );
};