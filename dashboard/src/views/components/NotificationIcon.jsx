import React, { useEffect, useState, useRef } from 'react';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';
import { getNotificationsAsync } from '../../store/Reducers/notificationReducer';
import moment from 'moment';
import Avatar from 'react-avatar';
import { toast } from 'react-hot-toast';
import getSocketService from '../../utils/socketService';

// Modal component for notification details
const NotificationDetailModal = ({ notification, onClose, userInfo }) => {
  if (!notification) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Notification Details</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
              {notification.viewers && notification.viewers.some(viewer => viewer._id === userInfo.id) ? 'Viewed' : 'New'}
            </span>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Content</h4>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <p className="text-gray-900 whitespace-pre-line">{notification.message}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Information</h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-xs text-gray-500">Sender</p>
                {notification.sender && (
                  <div className="flex items-center mt-1">
                    <div className="flex-shrink-0 h-8 w-8">
                      {notification.sender.image ? (
                        <img 
                          className="h-8 w-8 rounded-full" 
                          src={notification.sender.image} 
                          alt={notification.sender.name} 
                        />
                      ) : (
                        <Avatar 
                          name={notification.sender.name || 'Admin'} 
                          size="32" 
                          round={true} 
                        />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{notification.sender.name || 'Admin'}</p>
                      <p className="text-xs text-gray-500">{notification.sender.email}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-xs text-gray-500">Created On</p>
                <p className="text-sm font-medium">{moment(notification.createdAt).format('DD/MM/YYYY HH:mm:ss')}</p>
                <p className="text-xs text-gray-500 mt-1">
                  ({moment(notification.createdAt).fromNow()})
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-100 px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const NotificationIcon = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const { notifications } = useSelector(state => state.notification);
  const { userInfo } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const notificationRef = useRef();
  const socketService = getSocketService();

  // Khởi tạo socket một lần và đăng ký listener
  useEffect(() => {
    if (userInfo?.id) {
      socketService.init('seller-dashboard', userInfo);
      
      // Lắng nghe các sự kiện
      socketService.on('newNotification', (data) => {
        console.log('New notification received:', data);
        setHasNewNotification(true);
        dispatch(getNotificationsAsync());
      });
      
      socketService.on('notificationDeleted', (data) => {
        if (data && data.notificationId) {
          dispatch(getNotificationsAsync());
          
          if (selectedNotification && selectedNotification._id === data.notificationId) {
            setSelectedNotification(null);
            toast('Thông báo này đã bị xóa bởi Admin', {
              icon: '🗑️',
              duration: 3000,
            });
          }
        }
      });
      
      socketService.on('notificationUpdated', (data) => {
        if (data && data.notificationId) {
          dispatch(getNotificationsAsync());
          
          if (selectedNotification && selectedNotification._id === data.notificationId) {
            if (data.message) {
              setSelectedNotification({
                ...selectedNotification,
                message: data.message
              });
              
              toast('Thông báo này đã được cập nhật', {
                icon: '📝',
                duration: 3000,
              });
            }
          }
        }
      });
    }

    return () => {
      // Hủy đăng ký các event khi component unmount
      socketService.off('newNotification');
      socketService.off('notificationDeleted');
      socketService.off('notificationUpdated');
    };
  }, [userInfo, dispatch, selectedNotification]);

  // Lấy thông báo khi component mount
  useEffect(() => {
    dispatch(getNotificationsAsync());
  }, [dispatch]);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle notification click and open detail modal
  const handleNotificationClick = (notification) => {
    // Check if user has already viewed this notification
    const alreadyViewed = notification.viewers && notification.viewers.some(viewer => 
      socketService.compareIds(viewer.id || viewer._id, userInfo.id)
    );
    
    // If not yet viewed and socket is connected, send event to mark as viewed
    if (!alreadyViewed && socketService.isConnected() && userInfo?.id) {
      console.log('Marking notification as read:', notification._id);
      
      // Create a copy with updated viewers for immediate UI update
      const updatedNotification = {
        ...notification,
        viewers: [
          ...(notification.viewers || []),
          {
            id: userInfo.id,
            name: userInfo.name,
            email: userInfo.email,
            image: userInfo.image
          }
        ]
      };
      
      // Set the notification with locally updated viewers for immediate UI feedback
      setSelectedNotification(updatedNotification);
      
      // Emit the markNotificationAsRead event to update server and notify admin
      socketService.emit('markNotificationAsRead', {
        notificationId: notification._id,
        userId: userInfo.id,
        userInfo: {
          id: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          image: userInfo.image,
          role: userInfo.role
        }
      }, (response) => {
        if (response && response.success) {
          console.log('Server confirmed notification was marked as read');
          // Update notifications list to reflect the change
          dispatch(getNotificationsAsync());
        } else {
          console.error('Error marking notification as read:', response?.error);
        }
      });
    } else {
      setSelectedNotification(notification);
    }
    
    setShowNotifications(false);
  };

  // Đóng modal chi tiết thông báo
  const closeNotificationDetail = () => {
    setSelectedNotification(null);
  };

  // Bật/tắt dropdown thông báo
  const handleNotificationIconClick = () => {
    setShowNotifications(!showNotifications);
    setHasNewNotification(false);
  };

  // Đếm số thông báo chưa đọc
  const newNotificationCount = notifications.filter(
    notification => !(notification.viewers && notification.viewers.some(viewer => viewer.id === userInfo.id))
  ).length;

  return (
    <>
      {selectedNotification && (
        <NotificationDetailModal 
          notification={selectedNotification} 
          onClose={closeNotificationDetail} 
          userInfo={userInfo}
        />
      )}
      
      <div className="relative" ref={notificationRef}>
        <div 
          className="cursor-pointer flex items-center" 
          onClick={handleNotificationIconClick}
        >
          <div className="relative">
            <IoMdNotificationsOutline className="text-xl" />
            {newNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {newNotificationCount}
              </span>
            )}
          </div>
        </div>

        {showNotifications && (
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
            <div className="py-2 px-4 border-b border-gray-200 font-bold text-gray-700">
              Notifications
            </div>
            <div>
              {notifications.length > 0 ? (
                notifications.map((notification) => {
                  // Kiểm tra nếu người dùng đã xem thông báo này
                  const isViewed = notification.viewers && notification.viewers.some(viewer => viewer.id === userInfo.id);
                  
                  return (
                    <div 
                      key={notification._id} 
                      className={`py-2 px-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!isViewed ? 'bg-blue-50' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <p className="text-sm text-gray-800">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {moment(notification.createdAt).fromNow()}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="py-4 px-4 text-center text-gray-500">
                  No notifications
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationIcon; 