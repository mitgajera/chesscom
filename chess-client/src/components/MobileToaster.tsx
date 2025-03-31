import React from 'react';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import "../styles/ToastFix.css";

const MobileAwareToaster = ({ isMobile }) => {
  return (
    <ToastContainer
      position={isMobile ? "bottom-center" : "bottom-right"}
      autoClose={isMobile ? 2000 : 3000}
      hideProgressBar={isMobile}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss={!isMobile}
      draggable={!isMobile}
      pauseOnHover={!isMobile}
      theme="light"
      style={isMobile ? {
        width: '100%',
        maxWidth: '100%',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 0,
        margin: 0
      } : undefined}
      toastClassName={isMobile ? "mobile-toast" : ""}
    />
  );
};

// Helper function for showing mobile-aware toasts
export const showMobileAwareToast = (type, message, options = {}) => {
  const isMobile = window.innerWidth < 768;
  
  const defaultOptions = {
    position: isMobile ? "bottom-center" : "bottom-right",
    autoClose: isMobile ? 2000 : 3000,
    hideProgressBar: isMobile,
    closeOnClick: true,
    pauseOnHover: !isMobile,
    draggable: !isMobile,
    style: isMobile ? { 
      fontSize: '14px',
      padding: '8px 12px'
    } : undefined
  };
  
  toast[type](message, { ...defaultOptions, ...options });
};

export default MobileAwareToaster;