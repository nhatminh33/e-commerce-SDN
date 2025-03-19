import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaTrash, FaPlus, FaSearch, FaFilter, FaChevronLeft, FaChevronRight, FaEye, FaInfoCircle, FaEdit } from 'react-icons/fa';
import { 
  getAllNotificationsAsync, 
  deleteNotificationAsync, 
  createNotificationAsync, 
  updateNotificationAsync,
  clearMessage,
  getSellerListAsync,
  updateNotificationViewers
} from '../../store/Reducers/notificationReducer';
import { toast } from 'react-hot-toast';
import { HashLoader } from 'react-spinners';
import Avatar from 'react-avatar';
import moment from 'moment';
import getSocketService from '../../utils/socketService';

// Modal component for notification details
const NotificationDetailModal = ({ notification, onClose }) => {
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
          {/* <div className="mb-8">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${notification.read ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {notification.read ? 'Read' : 'Unread'}
            </span>
          </div> */}

          <div className="mb-8">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Content</h4>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <p className="text-gray-900 whitespace-pre-line">{notification.message}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Recipients</h4>
            {notification.receivers && notification.receivers.length > 0 ? (
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="mb-2 text-sm text-gray-700">
                  {notification.receivers.length === 1 
                    ? '1 recipient' 
                    : `${notification.receivers.length} recipients`}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {notification.receivers.map(receiver => (
                    <div key={receiver.id} className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        {receiver.image ? (
                          <img 
                            className="h-8 w-8 rounded-full" 
                            src={receiver.image} 
                            alt={receiver.name} 
                          />
                        ) : (
                          <Avatar 
                            name={receiver.name} 
                            size="32" 
                            round={true} 
                          />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{receiver.name}</p>
                        <p className="text-xs text-gray-500">{receiver.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No recipients</div>
            )}
          </div>
          
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Created On</p>
                <p className="text-sm font-medium">{moment(notification.createdAt).format('DD/MM/YYYY HH:mm:ss')}</p>
                <p className="text-xs text-gray-500 mt-1">
                  ({moment(notification.createdAt).fromNow()})
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Viewers ({notification.viewers ? notification.viewers.length : 0})
            </h4>
            
            {notification.viewers && notification.viewers.length > 0 ? (
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {notification.viewers.map(viewer => (
                    <div key={viewer.id} className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        {viewer.image ? (
                          <img 
                            className="h-8 w-8 rounded-full" 
                            src={viewer.image} 
                            alt={viewer.name} 
                          />
                        ) : (
                          <Avatar 
                            name={viewer.name} 
                            size="32" 
                            round={true} 
                          />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {viewer.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {viewer.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-gray-500 text-center">
                No viewers yet
              </div>
            )}
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

// Modal component for creating or editing notification
const NotificationFormModal = ({ notification, onClose, onSave, sellers, isEdit = false }) => {
  const [message, setMessage] = useState(notification ? notification.message : '');
  
  // Handle receiver which can be an array
  const [selectedReceivers, setSelectedReceivers] = useState([]);
  const [receiverMode, setReceiverMode] = useState(isEdit ? 'original' : 'all'); // 'original', 'all', 'specific'
  
  useEffect(() => {
    // Initialize initial values
    if (notification) {
      setMessage(notification.message || '');
      
      // If there are many receivers (almost equal to the total number of sellers) then consider it as "all"
      if (notification.receivers && notification.receivers.length > 0) {
        if (sellers && notification.receivers.length >= sellers.length * 0.9) {
          setReceiverMode('all');
        } else {
          setReceiverMode('specific');
          setSelectedReceivers(notification.receivers.map(r => r.id));
        }
      } else {
        setReceiverMode(isEdit ? 'specific' : 'all');
        setSelectedReceivers([]);
      }
    } else {
      // For new notification
      setMessage('');
      setReceiverMode('all');
      setSelectedReceivers([]);
    }
  }, [notification, sellers, isEdit]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error('Please enter the notification content');
      return;
    }
    
    setIsSubmitting(true);
    
    let receiverData;
    if (isEdit && receiverMode === 'original') {
      // Keep the current recipient list
      receiverData = null;
    } else if (receiverMode === 'all') {
      receiverData = 'all';
    } else {
      receiverData = selectedReceivers;
    }
    
    onSave(message, receiverData);
  };

  // Handle recipient changes
  const handleReceiverChange = (e) => {
    const value = e.target.value;
    setReceiverMode(value);
  };

  // Handle when selecting/deselecting a specific recipient
  const handleSellerSelection = (e) => {
    const sellerId = e.target.value;
    const isChecked = e.target.checked;
    
    if (isChecked) {
      setSelectedReceivers(prev => [...prev, sellerId]);
    } else {
      setSelectedReceivers(prev => prev.filter(id => id !== sellerId));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit Notification' : 'Create New Notification'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {!isEdit && (
              <div className="mb-4 text-gray-600 text-sm bg-blue-50 p-3 rounded-md">
                <p>As an Admin, you will send notifications to one or all sellers in the system.</p>
              </div>
            )}
          
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipients
              </label>
              
              <div className="space-y-2">
                {isEdit && (
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="original-receivers"
                      name="receiver-mode"
                      value="original"
                      checked={receiverMode === 'original'}
                      onChange={handleReceiverChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="original-receivers" className="ml-2 block text-sm text-gray-700">
                      Keep current recipients list
                    </label>
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="all-receivers"
                    name="receiver-mode"
                    value="all"
                    checked={receiverMode === 'all'}
                    onChange={handleReceiverChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="all-receivers" className="ml-2 block text-sm text-gray-700">
                    Send to all sellers
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="specific-receivers"
                    name="receiver-mode"
                    value="specific"
                    checked={receiverMode === 'specific'}
                    onChange={handleReceiverChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="specific-receivers" className="ml-2 block text-sm text-gray-700">
                    Select specific recipients
                  </label>
                </div>
              </div>
              
              {/* List of sellers to select when mode is 'specific' */}
              {receiverMode === 'specific' && sellers && (
                <div className="mt-4 border border-gray-200 rounded-md p-4 max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {sellers.map(seller => (
                      <div key={seller.id || seller._id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`seller-${seller.id || seller._id}`}
                          value={seller.id || seller._id}
                          checked={selectedReceivers.includes(seller.id || seller._id)}
                          onChange={handleSellerSelection}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor={`seller-${seller.id || seller._id}`} className="ml-2 block text-sm text-gray-700">
                          {seller.name} ({seller.email})
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  {selectedReceivers.length === 0 && (
                    <div className="text-red-500 text-sm mt-2">
                      Please select at least one recipient
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Notification Content
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3 min-h-[150px]"
                placeholder="Enter notification content..."
                required
              />
            </div>
          </div>
          
          <div className="bg-gray-100 px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
              disabled={isSubmitting || (receiverMode === 'specific' && selectedReceivers.length === 0)}
            >
              {isSubmitting ? (isEdit ? 'Saving...' : 'Sending...') : (isEdit ? 'Save Changes' : 'Send Notification')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Notifications = () => {
  const dispatch = useDispatch();
  const { 
    notifications, 
    sellers,
    loading, 
    error, 
    success, 
    message,
    pagination
  } = useSelector(state => state.notification);
  const { userInfo } = useSelector(state => state.auth);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  
  // Sử dụng socketService thay vì socket trực tiếp
  const socketService = getSocketService();
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReadStatus, setFilterReadStatus] = useState('all'); // 'all', 'read', 'unread'
  const [filterRecipient, setFilterRecipient] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showViewers, setShowViewers] = useState({});
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Toggle viewers display for a specific notification
  const toggleViewers = (notificationId) => {
    setShowViewers(prev => ({
      ...prev,
      [notificationId]: !prev[notificationId]
    }));
  };

  // Open notification detail modal
  const openNotificationDetail = (notification) => {
    setSelectedNotification(notification);
  };

  // Close notification detail modal
  const closeNotificationDetail = () => {
    setSelectedNotification(null);
  };

  // Open notification edit modal
  const openNotificationEdit = (notification) => {
    setEditingNotification(notification);
  };

  // Close notification edit modal
  const closeNotificationEdit = () => {
    setEditingNotification(null);
  };
  
  // Open notification create modal
  const openCreateNotification = () => {
    setShowCreateForm(true);
  };
  
  // Close notification create modal
  const closeCreateNotification = () => {
    setShowCreateForm(false);
  };

  useEffect(() => {
    fetchNotifications();
    dispatch(getSellerListAsync());
  }, [dispatch, currentPage, itemsPerPage, searchTerm, filterReadStatus, filterRecipient]);

  useEffect(() => {
    if (success && message) {
      toast.success(message);
      dispatch(clearMessage());
    }
    if (error) {
      toast.error(error);
      dispatch(clearMessage());
    }
  }, [success, error, message, dispatch]);

  // Initialize socketService and register events
  useEffect(() => {
    if (userInfo?.id) {
      socketService.init('admin-dashboard', userInfo);
      
      // Listen for new notifications
      socketService.on('newNotification', (data) => {
        console.log('Admin received newNotification event:', data);
        fetchNotifications();
        toast.success('New notification received!');
      });
      
      // Listen for notification sent confirmation
      socketService.on('notificationSent', (data) => {
        if (data.success) {
          fetchNotifications();
          toast.success('Notification sent successfully!');
        }
      });
      
      // Listen for notification viewed event
      socketService.on('notificationViewed', (data) => {
        // Update notification without reloading the entire list
        if (data.notificationId && data.viewerId && data.notification) {
          dispatch(updateNotificationViewers({
            notificationId: data.notificationId,
            notification: data.notification
          }));
          
          toast.success(`Notification viewed by a seller`, {
            duration: 3000,
            position: 'bottom-right'
          });
        }
      });
    }

    return () => {
      // Unregister events when component unmounts
      if (socketService) {
        socketService.off('newNotification');
        socketService.off('notificationSent');
        socketService.off('notificationViewed');
      }
    };
  }, [userInfo, dispatch]);

  const fetchNotifications = () => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
      status: filterReadStatus,
      receiver: filterRecipient
    };
    
    dispatch(getAllNotificationsAsync(params));
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      // Get receivers info before deleting to send socket events
      const notification = notifications.find(n => n._id === id);
      const receivers = notification?.receivers || [];
      
      dispatch(deleteNotificationAsync(id))
        .then(() => {
          // After successful deletion, notify all receivers
          if (socketService.isConnected() && receivers.length > 0) {
            socketService.emit('deleteNotification', {
              notificationId: id,
              receivers: receivers.map(r => r.id || r._id)
            });
          }
        });
    }
  };

  // Handle create notification
  const handleCreateNotification = (content, receiver) => {
    dispatch(createNotificationAsync({
      message: content,
      receiver: receiver
    })).then(() => {
      closeCreateNotification();
      fetchNotifications();
      
      // Emit socket event for realtime notification
      if (socketService.isConnected()) {
        socketService.emit('sendNotification', {
          receiver: receiver,
          message: content,
          sender: userInfo.id
        });
      } else {
        toast.warning('Notification sent, but real-time features may not be working');
      }
    });
  };

  // Save edited notification
  const handleSaveEdit = (content, receiver) => {
    // Get original receivers for comparison
    const notification = notifications.find(n => n._id === editingNotification._id);
    const oldReceivers = notification?.receivers?.map(r => r.id || r._id) || [];
    
    dispatch(updateNotificationAsync({ 
      id: editingNotification._id, 
      message: content,
      receiver
    })).then((result) => {
      closeNotificationEdit();
      fetchNotifications();
      
      // Send update notification through socket if connected
      if (socketService.isConnected()) {
        // Calculate new receivers list
        let newReceivers = [];
        if (receiver === 'all') {
          // If sending to all sellers, get all seller IDs
          newReceivers = sellers.map(s => s.id || s._id);
        } else if (Array.isArray(receiver)) {
          // If specific list selected
          newReceivers = receiver;
        } else if (receiver === null) {
          // Keep current list
          newReceivers = oldReceivers;
        }
        
        // Emit update event via socket
        socketService.emit('updateNotification', {
          notificationId: editingNotification._id,
          message: content,
          oldReceivers: oldReceivers,
          newReceivers: newReceivers
        });
      }
    });
  };

  // Format date to a more readable format
  const formatDate = (dateString) => {
    return moment(dateString).format('DD/MM/YYYY HH:mm');
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterReadStatus('all');
    setFilterRecipient('');
    setCurrentPage(1);
  };

  // Apply filters and search
  const applyFilters = () => {
    setCurrentPage(1);
    fetchNotifications();
  };

  return (
    <div className="px-4 py-4">
      {selectedNotification && (
        <NotificationDetailModal 
          notification={selectedNotification} 
          onClose={closeNotificationDetail} 
        />
      )}
      
      {showCreateForm && (
        <NotificationFormModal
          notification={null}
          onClose={closeCreateNotification}
          onSave={handleCreateNotification}
          sellers={sellers}
          isEdit={false}
        />
      )}
      
      {editingNotification && (
        <NotificationFormModal 
          notification={editingNotification} 
          onClose={closeNotificationEdit}
          onSave={handleSaveEdit}
          sellers={sellers}
          isEdit={true}
        />
      )}
      
      <div className="bg-white p-4 rounded-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Notification Management</h1>
          <button 
            onClick={openCreateNotification} 
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md flex items-center"
          >
            <FaPlus className="mr-2" /> Create New Notification
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                  placeholder="Search notifications..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            
            <div className="flex items-center">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md"
              >
                <FaFilter className="mr-2" /> {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              
              {(filterReadStatus !== 'all' || filterRecipient) && (
                <button
                  onClick={resetFilters}
                  className="ml-2 bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-md"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
          
          {showFilters && (
            <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filterReadStatus}
                    onChange={(e) => setFilterReadStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="all">All Statuses</option>
                    <option value="read">Read</option>
                    <option value="unread">Unread</option>
                  </select>
                </div> */}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receiver</label>
                  <select
                    value={filterRecipient}
                    onChange={(e) => setFilterRecipient(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="all">All Sellers</option>
                    {sellers && sellers.map(seller => (
                      <option key={seller.id || seller._id} value={seller.id || seller._id}>
                        {seller.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={applyFilters}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <HashLoader color="#36d7b7" />
          </div>
        ) : (
          <>
            <div className="bg-white rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Content
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created On
                    </th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Viewers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notifications && notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <React.Fragment key={notification._id}>
                        <tr>
                          <td className="px-6 py-4 whitespace-normal">
                            <div className="text-sm text-gray-900">{notification.message}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {notification.receivers && notification.receivers.length > 0 ? (
                              notification.receivers.length > 1 ? (
                                <div>
                                  <div className="text-sm text-gray-900 font-semibold">
                                    {notification.receivers.length} recipients
                                  </div>
                                  <div className="flex -space-x-2 overflow-hidden mt-1">
                                    {notification.receivers.slice(0, 3).map(receiver => (
                                      <div key={receiver.id} className="inline-block h-6 w-6">
                                        {receiver.image ? (
                                          <img 
                                            className="h-6 w-6 rounded-full ring-2 ring-white" 
                                            src={receiver.image} 
                                            alt={receiver.name} 
                                          />
                                        ) : (
                                          <Avatar 
                                            name={receiver.name} 
                                            size="24" 
                                            round={true} 
                                          />
                                        )}
                                      </div>
                                    ))}
                                    {notification.receivers.length > 3 && (
                                      <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 text-xs font-medium text-gray-800 ring-2 ring-white">
                                        +{notification.receivers.length - 3}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    {notification.receivers[0].image ? (
                                      <img 
                                        className="h-10 w-10 rounded-full" 
                                        src={notification.receivers[0].image} 
                                        alt={notification.receivers[0].name} 
                                      />
                                    ) : (
                                      <Avatar 
                                        name={notification.receivers[0].name} 
                                        size="40" 
                                        round={true} 
                                      />
                                    )}
                                  </div>
                                  {/* <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {notification.receivers[0].name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {notification.receivers[0].email}
                                    </div>
                                  </div> */}
                                </div>
                              )
                            ) : (
                              <div className="text-sm text-gray-500">No recipients</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(notification.createdAt)}
                            </div>
                          </td>
                          {/* <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${notification.read ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {notification.read ? 'Read' : 'Unread'}
                            </span>
                          </td> */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {notification.viewers && notification.viewers.length > 0 ? (
                                <div className="flex items-center">
                                  <span className="mr-2">{notification.viewers.length}</span>
                                  <button 
                                    onClick={() => toggleViewers(notification._id)}
                                    className="text-blue-500 hover:text-blue-700"
                                    title="View list of viewers"
                                  >
                                    <FaEye />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-gray-500">No viewers yet</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => openNotificationDetail(notification)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View notification details"
                              >
                                <FaInfoCircle />
                              </button>
                              <button 
                                onClick={() => openNotificationEdit(notification)}
                                className="text-green-600 hover:text-green-900"
                                title="Edit notification"
                              >
                                <FaEdit />
                              </button>
                              <button 
                                onClick={() => handleDelete(notification._id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete notification"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {showViewers[notification._id] && notification.viewers && notification.viewers.length > 0 && (
                          <tr className="bg-gray-50">
                            <td colSpan="6" className="px-8 py-4">
                              <div className="text-sm font-medium text-gray-900 mb-2">Viewers:</div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {notification.viewers.map(viewer => (
                                  <div key={viewer.id} className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8">
                                      {viewer.image ? (
                                        <img 
                                          className="h-8 w-8 rounded-full" 
                                          src={viewer.image} 
                                          alt={viewer.name} 
                                        />
                                      ) : (
                                        <Avatar 
                                          name={viewer.name} 
                                          size="32" 
                                          round={true} 
                                        />
                                      )}
                                    </div>
                                    <div className="ml-3">
                                      <div className="text-sm font-medium text-gray-900">
                                        {viewer.name}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {viewer.email}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center">
                        No notifications
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {pagination && pagination.totalCount > 0 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.totalCount}</span> results
                </div>
                
                <div className="flex items-center space-x-2">
                  <div>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1); // Reset to first page when changing items per page
                      }}
                      className="border border-gray-300 rounded-md p-1"
                    >
                      <option value={5}>5 per page</option>
                      <option value={10}>10 per page</option>
                      <option value={20}>20 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                  </div>
                  
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <FaChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {/* Page number buttons */}
                    {pagination.totalPages <= 7 ? (
                      // Show all pages if 7 or fewer
                      [...Array(pagination.totalPages).keys()].map(number => (
                        <button
                          key={number + 1}
                          onClick={() => setCurrentPage(number + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                            currentPage === number + 1
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {number + 1}
                        </button>
                      ))
                    ) : (
                      // Show limited pages with ellipses for many pages
                      <>
                        {/* First page */}
                        <button
                          onClick={() => setCurrentPage(1)}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                            currentPage === 1
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          1
                        </button>
                        
                        {/* Ellipsis or page 2 */}
                        {currentPage > 3 && (
                          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            ...
                          </span>
                        )}
                        
                        {/* Pages around current page */}
                        {[...Array(5)].map((_, idx) => {
                          const pageNumber = currentPage - 2 + idx;
                          return (
                            pageNumber > 1 && 
                            pageNumber < pagination.totalPages && (
                              <button
                                key={pageNumber}
                                onClick={() => setCurrentPage(pageNumber)}
                                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                                  currentPage === pageNumber
                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                    : 'bg-white text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {pageNumber}
                              </button>
                            )
                          );
                        })}
                        
                        {/* Ellipsis or second-to-last page */}
                        {currentPage < pagination.totalPages - 2 && (
                          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            ...
                          </span>
                        )}
                        
                        {/* Last page */}
                        <button
                          onClick={() => setCurrentPage(pagination.totalPages)}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                            currentPage === pagination.totalPages
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pagination.totalPages}
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                      disabled={currentPage === pagination.totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === pagination.totalPages 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <FaChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications; 