import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  const getStyles = (type) => {
    const styles = {
      success: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        icon: 'text-green-600'
      },
      error: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: 'text-red-600'
      },
      info: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        icon: 'text-blue-600'
      },
      warning: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        icon: 'text-yellow-600'
      }
    };
    return styles[type] || styles.info;
  };

  const getIcon = (type) => {
    const iconProps = { size: 18 };
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} />;
      case 'error':
        return <AlertCircle {...iconProps} />;
      case 'warning':
        return <AlertTriangle {...iconProps} />;
      default:
        return <Info {...iconProps} />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md space-y-2">
      {notifications.map((notification) => {
        const styles = getStyles(notification.type);
        return (
          <div
            key={notification.id}
            className={`${styles.bg} border ${styles.border} ${styles.text} px-4 py-3 rounded-lg shadow-md flex items-center gap-3 animate-slideIn`}
          >
            <div className={styles.icon}>
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 text-sm">
              {notification.message}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 hover:opacity-70 transition"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationContainer;
