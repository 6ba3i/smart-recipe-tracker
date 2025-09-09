import React, { useState, useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

const ToastNotification = ({ 
  show, 
  onClose, 
  message, 
  type = 'info', 
  duration = 5000,
  position = 'top-end' 
}) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-success me-2" />;
      case 'error':
        return <XCircle size={20} className="text-danger me-2" />;
      case 'warning':
        return <AlertCircle size={20} className="text-warning me-2" />;
      default:
        return <Info size={20} className="text-info me-2" />;
    }
  };

  const getBgClass = () => {
    switch (type) {
      case 'success':
        return 'bg-success text-white';
      case 'error':
        return 'bg-danger text-white';
      case 'warning':
        return 'bg-warning text-dark';
      default:
        return 'bg-info text-white';
    }
  };

  return (
    <ToastContainer position={position} className="p-3" style={{ zIndex: 9999 }}>
      <Toast show={show} onClose={onClose} className={getBgClass()}>
        <Toast.Body className="d-flex align-items-center">
          {getIcon()}
          <span className="flex-grow-1">{message}</span>
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default ToastNotification;