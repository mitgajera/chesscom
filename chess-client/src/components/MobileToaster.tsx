import React, { useEffect } from 'react';
import { ToastContainer, toast as reactToast } from 'react-toastify';
import { useIsMobile } from '../hooks/use-mobile';
import "react-toastify/dist/ReactToastify.css";
import "../styles/ToastFix.css";

const MobileToaster = () => {
  const isMobile = useIsMobile();
  
  return (
    <ToastContainer
      position={isMobile ? "bottom-center" : "bottom-right"}
      autoClose={isMobile ? 3000 : 5000}
      hideProgressBar={isMobile}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss={!isMobile}
      draggable={!isMobile}
      pauseOnHover={!isMobile}
      theme="light"
      style={isMobile ? {
        zIndex: 9999,
        position: 'fixed',
        width: '100%'
      } : undefined}
    />
  );
};

// Optimized toast functions that adapt to mobile
export const toast = {
  success: (message: string) => {
    const isMobile = window.innerWidth < 768;
    reactToast.success(message, {
      position: isMobile ? "bottom-center" : "bottom-right",
      autoClose: isMobile ? 3000 : 5000,
      hideProgressBar: isMobile,
      closeOnClick: true,
      pauseOnHover: !isMobile,
      draggable: !isMobile,
      style: isMobile ? { fontSize: '14px' } : undefined
    });
  },
  error: (message: string) => {
    const isMobile = window.innerWidth < 768;
    reactToast.error(message, {
      position: isMobile ? "bottom-center" : "bottom-right",
      autoClose: isMobile ? 3000 : 5000,
      hideProgressBar: isMobile,
      closeOnClick: true,
      pauseOnHover: !isMobile,
      draggable: !isMobile,
      style: isMobile ? { fontSize: '14px' } : undefined
    });
  },
  info: (message: string) => {
    const isMobile = window.innerWidth < 768;
    reactToast.info(message, {
      position: isMobile ? "bottom-center" : "bottom-right",
      autoClose: isMobile ? 3000 : 5000,
      hideProgressBar: isMobile,
      closeOnClick: true,
      pauseOnHover: !isMobile,
      draggable: !isMobile,
      style: isMobile ? { fontSize: '14px' } : undefined
    });
  },
  warning: (message: string) => {
    const isMobile = window.innerWidth < 768;
    reactToast.warning(message, {
      position: isMobile ? "bottom-center" : "bottom-right",
      autoClose: isMobile ? 3000 : 5000,
      hideProgressBar: isMobile,
      closeOnClick: true,
      pauseOnHover: !isMobile,
      draggable: !isMobile,
      style: isMobile ? { fontSize: '14px' } : undefined
    });
  }
};

export default MobileToaster;