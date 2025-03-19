import io from 'socket.io-client';
import { toast } from 'react-hot-toast';

// Singleton instance để tránh nhiều kết nối
let socketInstance = null;

// Hàm utility so sánh ID an toàn
const compareIds = (id1, id2) => {
  if (!id1 || !id2) return false;
  
  try {
    const str1 = id1.toString ? id1.toString() : String(id1);
    const str2 = id2.toString ? id2.toString() : String(id2);
    return str1 === str2;
  } catch (error) {
    console.error('Error comparing IDs:', error);
    return false;
  }
};

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.userInfo = null;
    this.clientType = 'unknown';
    this.eventHandlers = {};  // Lưu trữ các handler để quản lý ghi nhớ tốt hơn
  }

  init(clientType, userInfo) {
    this.clientType = clientType;
    this.userInfo = userInfo;

    if (!this.socket) {
      // Tạo kết nối socket nếu chưa có
      console.log(`Tạo kết nối socket mới cho client: ${clientType}`);
      this.socket = io('http://localhost:5000', {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        transports: ['websocket', 'polling'],
        query: { 
          client: clientType,
          userId: userInfo?.id || 'pending'
        }
      });

      this._setupListeners();
    } else if (userInfo?.id) {
      // Chỉ cập nhật thông tin người dùng nếu socket đã được tạo
      console.log(`Cập nhật thông tin người dùng cho socket hiện có, client: ${clientType}`);
      this.socket.io.opts.query = {
        ...this.socket.io.opts.query,
        userId: userInfo.id
      };
      
      // Đồng bộ lại trạng thái kết nối
      this.connected = this.socket.connected;
      
      // Đăng ký lại user nếu đã kết nối
      if (this.connected) {
        this._registerUser();
      }
    }

    return this.socket;
  }

  _setupListeners() {
    this.socket.on('connect', () => {
      console.log(`Socket connected: ${this.socket.id}, client: ${this.clientType}`);
      this.connected = true;
      
      // Đăng ký người dùng khi kết nối thành công
      this._registerUser();
    });

    this.socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${this.socket.id}`);
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error(`Socket connection error: ${error.message}`);
      this.connected = false;
      
      // Thử kết nối lại sau 5 giây
      setTimeout(() => {
        console.log('Attempting to reconnect with different transport');
        this.socket.io.opts.transports = ['polling', 'websocket'];
        this.socket.connect();
      }, 5000);
    });
    
    // Xử lý khi socket tái kết nối
    this.socket.io.on('reconnect', () => {
      console.log('Socket reconnected successfully');
      this.connected = true;
      this._registerUser();
    });
  }
  
  _registerUser() {
    // Đăng ký user với server khi kết nối hoặc tái kết nối
    if (this.userInfo?.id) {
      console.log(`Registering user ${this.userInfo.id} (${this.userInfo.role}) to socket server`);
      this.socket.emit('add_user', this.userInfo.id, {
        id: this.userInfo.id,
        name: this.userInfo.name,
        email: this.userInfo.email,
        image: this.userInfo.image,
        role: this.userInfo.role
      });
    }
  }

  updateUser(userInfo) {
    this.userInfo = userInfo;
    
    if (this.socket && userInfo?.id) {
      // Cập nhật query parameter
      this.socket.io.opts.query = {
        ...this.socket.io.opts.query,
        userId: userInfo.id
      };
      
      // Đăng ký thông tin người dùng nếu đã kết nối
      if (this.connected) {
        this._registerUser();
      }
    }
  }

  on(event, callback) {
    if (!this.socket) return () => {};
    
    // Quản lý các handler để tránh memory leak
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    
    this.eventHandlers[event].push(callback);
    this.socket.on(event, callback);
    
    // Trả về function để remove handler
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    
    if (callback) {
      // Hủy một callback cụ thể
      this.socket.off(event, callback);
      
      // Xóa khỏi danh sách theo dõi nếu có
      if (this.eventHandlers[event]) {
        this.eventHandlers[event] = this.eventHandlers[event].filter(cb => cb !== callback);
      }
    } else {
      // Hủy tất cả các callback cho event này
      this.socket.off(event);
      this.eventHandlers[event] = [];
    }
  }

  emit(event, data, callback) {
    if (!this.socket || !this.connected) {
      console.warn(`Cannot emit ${event} - socket not connected`);
      toast.error('Mất kết nối với máy chủ thông báo');
      return false;
    }
    
    console.log(`Emitting ${event} with data:`, JSON.stringify(data).substring(0, 100) + (data ? '...' : ''));
    this.socket.emit(event, data, callback);
    return true;
  }

  isConnected() {
    return this.connected;
  }

  disconnect() {
    if (this.socket) {
      // Hủy tất cả các event listeners
      Object.keys(this.eventHandlers).forEach(event => {
        this.eventHandlers[event].forEach(handler => {
          this.socket.off(event, handler);
        });
        this.eventHandlers[event] = [];
      });
      
      // Ngắt kết nối
      this.socket.disconnect();
      this.connected = false;
    }
  }
  
  // Hàm tiện ích để kiểm tra ID
  compareIds(id1, id2) {
    return compareIds(id1, id2);
  }
}

// Singleton pattern
const getSocketService = () => {
  if (!socketInstance) {
    socketInstance = new SocketService();
  }
  return socketInstance;
};

export default getSocketService; 