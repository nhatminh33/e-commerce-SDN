import { lazy } from "react";         
const AdminDashboard = lazy(()=> import('../../views/admin/AdminDashboard'))  
const Orders = lazy(()=> import('../../views/admin/Orders')) 
const Category = lazy(()=> import('../../views/admin/Category'))  
const Sellers = lazy(()=> import('../../views/admin/Sellers'))
const PaymentRequest = lazy(()=> import('../../views/admin/PaymentRequest'))  
const DeactiveSellers = lazy(()=> import('../../views/admin/DeactiveSellers'))  
const SellerRequest = lazy(()=> import('../../views/admin/SellerRequest'))   
const SellerDetails = lazy(()=> import('../../views/admin/SellerDetails'))   
const ChatSeller = lazy(()=> import('../../views/admin/ChatSeller'))   
const OrderDetails = lazy(()=> import('../../views/admin/OrderDetails'))  
const Notifications = lazy(()=> import('../../views/admin/Notifications'))
const Products = lazy(()=> import('../../views/admin/Products'))
const ProductDetails = lazy(()=> import('../../views/admin/ProductDetails'))
// const CashFlow = lazy(()=> import('../../views/admin/CashFlow'))
// const ProfitAnalysis = lazy(()=> import('../../views/admin/ProfitAnalysis'))
const FinanceAnalytics = lazy(()=> import('../../views/admin/FinanceAnalytics'))

export const adminRoutes = [
    {
        path: 'admin/dashboard',
        element : <AdminDashboard/>,
        role : 'admin'
    },
    {
        path: 'admin/dashboard/orders',
        element : <Orders/> ,
        role : 'admin'
    },
    {
        path: 'admin/dashboard/category',
        element : <Category/> ,
        role : 'admin'
    },
    {
        path: 'admin/dashboard/sellers',
        element : <Sellers/> ,
        role : 'admin'
    },
    {
        path: 'admin/dashboard/products',
        element : <Products/> ,
        role : 'admin'
    },
    {
        path: 'admin/dashboard/product/details/:productId',
        element : <ProductDetails/> ,
        role : 'admin'
    },
    // {
    //     path: 'admin/dashboard/cash-flow',
    //     element : <CashFlow/> ,
    //     role : 'admin'
    // },
    // {
    //     path: 'admin/dashboard/profit-analysis',
    //     element : <ProfitAnalysis/> ,
    //     role : 'admin'
    // },
    {
        path: 'admin/dashboard/finance-analytics',
        element : <FinanceAnalytics/> ,
        role : 'admin'
    },
    {
        path: 'admin/dashboard/payment-request',
        element : <PaymentRequest/> ,
        role : 'admin'
    },
    {
        path: 'admin/dashboard/deactive-sellers',
        element : <DeactiveSellers/> ,
        role : 'admin'
    },
    {
        path: 'admin/dashboard/sellers-request',
        element : <SellerRequest/> ,
        role : 'admin'
    },
    {
        path: 'admin/dashboard/seller/details/:sellerId',
        element : <SellerDetails/> ,
        role : 'admin'
    }, 
    {
        path: 'admin/dashboard/chat-sellers',
        element : <ChatSeller/> ,
        role : 'admin'
    },
    {
        path: 'admin/dashboard/chat-sellers/:sellerId',
        element : <ChatSeller/> ,
        role : 'admin'
    },
    {
        path: 'admin/dashboard/order/details/:orderId',
        element : <OrderDetails/> ,
        role : 'admin'
    },
    {
        path: 'admin/dashboard/notifications',
        element : <Notifications/> ,
        role : 'admin'
    },
]