import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getNotificationsAsync } from '../../store/Reducers/notificationReducer';
import { HashLoader } from 'react-spinners';
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
              {notification.viewers && notification.viewers.some(viewer => 
                getSocketService().compareIds(viewer.id || viewer._id, userInfo.id)
              ) ? 'Viewed' : 'New'}
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

const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications, loading } = useSelector(state => state.notification);
  const { userInfo } = useSelector(state => state.auth);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const socketService = getSocketService();

  // Initialize socket and register events
  useEffect(() => {
    if (userInfo?.id) {
      socketService.init('seller-notifications', userInfo);
      
      // Listen for new notifications
      socketService.on('newNotification', (data) => {
        console.log('New notification received:', data);
        dispatch(getNotificationsAsync());
        toast.success('You have a new notification!');
      });
      
      // Listen for notification deletion
      socketService.on('notificationDeleted', (data) => {
        if (data && data.notificationId) {
          // Update notification list
          dispatch(getNotificationsAsync());
          
          // If viewing the deleted notification, close the modal
          if (selectedNotification && selectedNotification._id === data.notificationId) {
            setSelectedNotification(null);
            toast('This notification has been deleted by Admin', {
              icon: '🗑️',
              duration: 3000,
            });
          }
        }
      });
      
      // Listen for notification updates
      socketService.on('notificationUpdated', (data) => {
        if (data && data.notificationId) {
          // Update notification list
          dispatch(getNotificationsAsync());
          
          // If viewing the updated notification, update its content
          if (selectedNotification && selectedNotification._id === data.notificationId) {
            if (data.message) {
              // Update notification content in modal
              setSelectedNotification({
                ...selectedNotification,
                message: data.message
              });
              
              toast('This notification has been updated', {
                icon: '📝',
                duration: 3000,
              });
            }
          }
        }
      });
    }

    return () => {
      // Unregister events when component unmounts
      if (socketService) {
        socketService.off('newNotification');
        socketService.off('notificationDeleted');
        socketService.off('notificationUpdated');
      }
    };
  }, [userInfo, dispatch, selectedNotification]);

  // Get all notifications when component mounts
  useEffect(() => {
    dispatch(getNotificationsAsync());
  }, [dispatch]);

  const handleViewNotification = (notification) => {
    // Check if user has already viewed this notification
    const alreadyViewed = notification.viewers && notification.viewers.some(viewer => 
      socketService.compareIds(viewer.id || viewer._id, userInfo.id)
    );
    
    // If not yet viewed and socket is connected, send event to mark as viewed
    if (!alreadyViewed && socketService.isConnected() && userInfo?.id) {
      console.log('Marking notification as read:', notification._id);
      
      // Tạo bản sao sâu của notification để tránh thay đổi trực tiếp đối tượng gốc
      const notificationCopy = JSON.parse(JSON.stringify(notification));
      
      // Tạo bản sao với viewers mới, không thay đổi notification gốc
      const updatedNotification = {
        ...notificationCopy,
        viewers: [
          ...(notificationCopy.viewers || []),
          {
            id: userInfo.id,
            name: userInfo.name,
            email: userInfo.email,
            image: userInfo.image
          }
        ]
      };
      
      // Open notification detail modal with the updated copy for immediate UI feedback
      setSelectedNotification(updatedNotification);
      
      // Emit event to server with callback to handle response
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
          // Refresh notifications list to ensure all components show updated state
          dispatch(getNotificationsAsync());
        } else {
          console.error('Error marking notification as read:', response?.error);
          toast.error('Failed to update notification status');
        }
      });
    } else {
      // If already viewed, just open the original notification
      setSelectedNotification(notification);
    }
  };

  // Close notification detail modal
  const closeNotificationDetail = () => {
    setSelectedNotification(null);
  };

  return (
    <div className="px-4 py-4">
      {selectedNotification && (
        <NotificationDetailModal 
          notification={selectedNotification} 
          onClose={closeNotificationDetail} 
          userInfo={userInfo}
        />
      )}
      
      <div className="bg-white p-4 rounded-md shadow">
        <h1 className="text-xl font-bold mb-6">My Notifications</h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <HashLoader color="#36d7b7" />
          </div>
        ) : (
          <div className="space-y-4">
            {notifications && notifications.length > 0 ? (
              notifications.map(notification => {
                // Check if user has viewed this notification
                const isViewed = notification.viewers && notification.viewers.some(viewer => 
                  socketService.compareIds(viewer.id || viewer._id, userInfo.id)
                );
                
                return (
                  <div 
                    key={notification._id} 
                    className={`p-4 border ${!isViewed ? 'border-blue-200 bg-blue-50' : 'border-gray-200'} rounded-md hover:shadow-md cursor-pointer transition-all`}
                    onClick={() => handleViewNotification(notification)}
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-gray-800">{notification.message}</p>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${isViewed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {isViewed ? 'Viewed' : 'New'}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>From: {notification.sender ? notification.sender.name : 'Admin'}</p>
                      <p>Date: {moment(notification.createdAt).format('DD/MM/YYYY HH:mm')}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-gray-500">
                No notifications
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications; 