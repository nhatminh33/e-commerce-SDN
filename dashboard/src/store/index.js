import {configureStore} from '@reduxjs/toolkit'
import authReducer from './Reducers/authReducer'
import categoryReducer from './Reducers/categoryReducer'
import productReducer from './Reducers/productReducer'
import sellerReducer from './Reducers/sellerReducer'
import chatReducer from './Reducers/chatReducer'
import OrderReducer from './Reducers/OrderReducer'
import PaymentReducer from './Reducers/PaymentReducer'
import dashboardReducer from './Reducers/dashboardReducer'
import bannerReducer from './Reducers/bannerReducer'
import notificationReducer from './Reducers/notificationReducer'
import cashFlowReducer from './Reducers/cashFlowReducer'

const store = configureStore({
    reducer: {
        auth: authReducer,
        category: categoryReducer,
        product: productReducer,
        seller: sellerReducer,
        chat: chatReducer,
        order: OrderReducer,
        payment: PaymentReducer,
        dashboard: dashboardReducer,
        banner: bannerReducer,
        notification: notificationReducer,
        cashFlow: cashFlowReducer
    },
    middleware: getDefaultMiddleware => {
        return getDefaultMiddleware({
            serializableCheck: false
        })
    },
    devTools: true
})
export default store