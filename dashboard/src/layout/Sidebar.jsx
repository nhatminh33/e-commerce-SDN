// import React, { useEffect, useState } from 'react';
// import { Link,useLocation, useNavigate } from 'react-router-dom';
// import { getNav } from '../navigation/index';
// import { BiLogOutCircle } from "react-icons/bi";
// import { useDispatch, useSelector } from "react-redux";
// import { logout } from '../store/Reducers/authReducer';
// import logo from '../assets/logo.png'
// import { get_unread_counts } from '../store/Reducers/chatReducer';

// const Sidebar = ({showSidebar, setShowSidebar}) => {

//     const dispatch = useDispatch()
//     const { role } = useSelector(state => state.auth)
//     const { totalUnreadMessages } = useSelector(state => state.chat)
//     const navigate = useNavigate()

//     const {pathname} = useLocation()
//     const [allNav,setAllNav] = useState([])
    
//     useEffect(() => {
//         const navs = getNav(role)
//         setAllNav(navs)
//     },[role])
    
//     // Lấy số lượng tin nhắn chưa đọc khi component mount
//     useEffect(() => {
//         if (role === 'seller') {
//             dispatch(get_unread_counts());
            
//             // Cập nhật số lượng tin nhắn chưa đọc mỗi phút
//             const interval = setInterval(() => {
//                 dispatch(get_unread_counts());
//             }, 60000); // 60 giây
            
//             return () => clearInterval(interval);
//         }
//     }, [dispatch, role]);


//     return (
//         <div>
//             <div onClick={()=> setShowSidebar(false)} className={`fixed duration-200 ${!showSidebar ? 'invisible' : 'visible'} w-screen h-screen bg-[#8cbce780] top-0 left-0 z-10`} > 
//             </div>

//     <div className={`w-[260px] fixed bg-[#e6e7fb] z-50 top-0 h-screen shadow-[0_0_15px_0_rgb(34_41_47_/_5%)] transition-all ${showSidebar ? 'left-0' : '-left-[260px] lg:left-0'} `}>
//         <div className='h-[70px] flex justify-center items-center'>
//             <Link to='/' className='w-[180px] h-[50px]'>
//                 <img className='w-full h-full' src={logo} alt="" />
//             </Link> 
//         </div>

//         <div className='px-[16px]'>
//             <ul>
//                 {
//                     allNav.map((n,i) =><li key={i}>
//                        <Link to={n.path} className={`${pathname === n.path ? 'bg-blue-600 shadow-indigo-500/50 text-white duration-500' : 'text-[#030811] font-bold duration-200 ' } px-[12px] py-[9px] rounded-sm flex justify-start items-center gap-[12px] hover:pl-4 transition-all w-full mb-1 relative`} >
//                         <span>{n.icon}</span>
//                         <span>{n.title}</span>
                        
//                         {/* Hiển thị badge cho menu Chat-Customer */}
//                         {n.title === 'Chat-Customer' && totalUnreadMessages > 0 && (
//                             <div className="absolute right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
//                                 {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
//                             </div>
//                         )}
//                         </Link>

//                     </li> )
//                 }

//             <li>
//                 <button onClick={() => dispatch(logout({navigate}))} className='text-[#030811] font-bold duration-200 px-[12px] py-[9px] rounded-sm flex justify-start items-center gap-[12px] hover:pl-4 transition-all w-full mb-1'>
//                 <span><BiLogOutCircle /></span>
//                 <span>Logout</span>
//                 </button>
//             </li>
 


//             </ul>

//         </div>
        
//     </div>

//         </div>
//     );
// };

// export default Sidebar;
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getNav } from '../navigation/index';
import { BiLogOutCircle } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { logout } from '../store/Reducers/authReducer';
import logo from '../assets/logo.png';
import { get_unread_counts } from '../store/Reducers/chatReducer';

const Sidebar = ({showSidebar, setShowSidebar}) => {
    const dispatch = useDispatch();
    const { role } = useSelector(state => state.auth);
    const { totalUnreadMessages } = useSelector(state => state.chat);
    const navigate = useNavigate();

    const {pathname} = useLocation();
    const [allNav, setAllNav] = useState([]);
    
    useEffect(() => {
        const navs = getNav(role);
        setAllNav(navs);
    }, [role]);
    
    // Lấy số lượng tin nhắn chưa đọc khi component mount
    useEffect(() => {
        if (role === 'seller') {
            dispatch(get_unread_counts());
            
            // Cập nhật số lượng tin nhắn chưa đọc mỗi phút
            const interval = setInterval(() => {
                dispatch(get_unread_counts());
            }, 60000); // 60 giây
            
            return () => clearInterval(interval);
        }
    }, [dispatch, role]);

    return (
        <div>
            <div 
                onClick={() => setShowSidebar(false)} 
                className={`fixed duration-200 ${!showSidebar ? 'invisible' : 'visible'} w-screen h-screen bg-black/20 top-0 left-0 z-10`} 
            ></div>

            <div className={`w-[260px] fixed bg-white z-50 top-0 h-screen shadow-md transition-all ${showSidebar ? 'left-0' : '-left-[260px] lg:left-0'}`}>
                <div className='h-[70px] flex justify-center items-center border-b border-pink-100'>
                    <Link to='/' className='w-[180px] h-[50px]'>
                        <img className='w-full h-full object-contain' src={logo} alt="Logo" />
                    </Link> 
                </div>

                <div className='px-[16px] py-3'>
                    <ul className='flex flex-col gap-1'>
                        {allNav.map((n, i) => (
                            <li key={i}>
                                <Link 
                                    to={n.path} 
                                    className={`
                                        ${pathname === n.path 
                                            ? 'bg-pink-500 text-white shadow-sm' 
                                            : 'text-gray-700 hover:bg-pink-50'
                                        } 
                                        px-4 py-3 rounded-md flex justify-start items-center gap-3 transition-all w-full relative
                                    `}
                                >
                                    <span className='text-lg'>{n.icon}</span>
                                    <span className='font-medium'>{n.title}</span>
                                    
                                    {/* Hiển thị badge cho menu Chat-Customer */}
                                    {n.title === 'Chat-Customer' && totalUnreadMessages > 0 && (
                                        <div className="absolute right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                            {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
                                        </div>
                                    )}
                                </Link>
                            </li>
                        ))}

                        <li className='mt-4 pt-4 border-t border-pink-100'>
                            <button 
                                onClick={() => dispatch(logout({navigate}))} 
                                className='text-gray-700 hover:bg-pink-50 px-4 py-3 rounded-md flex justify-start items-center gap-3 transition-all w-full'
                            >
                                <span className='text-lg'><BiLogOutCircle /></span>
                                <span className='font-medium'>Logout</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;