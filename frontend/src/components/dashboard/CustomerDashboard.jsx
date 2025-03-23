import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { FaList } from 'react-icons/fa'
import { RxDashboard } from 'react-icons/rx'
import { RiProductHuntLine } from 'react-icons/ri'
import { BsChat } from 'react-icons/bs'
import { TfiLock } from 'react-icons/tfi'
import { BiLogInCircle } from 'react-icons/bi'
import { useDispatch, useSelector } from 'react-redux'
import { get_user_info } from '../../store/reducers/authReducer'
import { SideBarList } from './SideBarList'
import { Header } from './Header'
import { get_sellers, get_unread_seller_counts } from '../../store/reducers/chatReducer'
import toast from 'react-hot-toast'

export const CustomerDashboard = () => {
    const dispatch = useDispatch()
    const { userInfo } = useSelector(state => state.auth)
    const { sellerUnreadCounts, successMessage, errorMessage } = useSelector(state => state.chat)
    const [sideBar, setSideBar] = useState(false)
    
    // Lấy tổng số tin nhắn chưa đọc từ các người bán
    const totalUnreadMessages = sellerUnreadCounts 
        ? Object.values(sellerUnreadCounts).reduce((total, count) => total + count, 0) 
        : 0;

    useEffect(() => {
        dispatch(get_user_info())
    }, [])

    useEffect(() => {
        dispatch(get_sellers())
        dispatch(get_unread_seller_counts())
    }, [dispatch])

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage)
            dispatch({ type: 'chat/clearMessage' })
        }
        if (errorMessage) {
            toast.error(errorMessage)
            dispatch({ type: 'chat/clearMessage' })
        }
    }, [successMessage, errorMessage])

    // Thiết lập interval để cập nhật số tin nhắn chưa đọc mỗi 30 giây
    useEffect(() => {
        const interval = setInterval(() => {
            dispatch(get_unread_seller_counts())
        }, 30000) // 30 seconds
        
        return () => clearInterval(interval)
    }, [dispatch])

    const sideBarList = [
        {
            id: 1,
            title: 'Dashboard',
            icon: <RxDashboard />,
            path: '/dashboard'
        },
        {
            id: 2,
            title: 'My Orders',
            icon: <FaList />,
            path: '/dashboard/my-orders'
        },
        {
            id: 3,
            title: 'Wishlist',
            icon: <RiProductHuntLine />,
            path: '/dashboard/wishlist'
        },
        {
            id: 4,
            title: 'Chat',
            icon: <BsChat />,
            path: '/dashboard/chat',
            badge: totalUnreadMessages > 0 ? totalUnreadMessages : null
        },
        {
            id: 5,
            title: 'Change Password',
            icon: <TfiLock />,
            path: '/dashboard/change-password'
        },
        {
            id: 6,
            title: 'Logout',
            icon: <BiLogInCircle />,
            path: '/customer/logout'
        }
    ]

    return (
        <div className='bg-[#f8f5ff] w-full min-h-screen'>
            <Header userInfo={userInfo} setSideBar={setSideBar} />
            <div className='w-full flex'>
                <div className={`${sideBar ? 'block' : 'hidden'} sm:block w-[270px] min-h-screen bg-white`}>
                    <div className='w-full px-4 py-5'>
                        <div className='flex justify-center items-center flex-col mt-5'>
                            <div className='h-[130px] w-[130px] rounded-full flex justify-center items-center border-2 border-green-500 p-[2px]'>
                                <img className='h-full w-full rounded-full' src={userInfo?.image} alt="user" />
                            </div>
                            <span className='text-2xl mt-2 text-center'>{userInfo?.name}</span>
                        </div>
                        <div className='w-full flex flex-col gap-2 pt-10'>
                            <SideBarList lists={sideBarList} />
                        </div>
                    </div>
                </div>
                <div className={`w-full min-h-screen ml-0 ${sideBar ? 'block' : 'hidden'} sm:block`}>
                    <Outlet />
                </div>
            </div>
        </div>
    )
} 