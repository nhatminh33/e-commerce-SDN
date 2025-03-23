import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api"; 

export const add_product = createAsyncThunk(
    'product/add_product',
    async({sellerId, formData}, {rejectWithValue, fulfillWithValue}) => {
        try { 
            const {data} = await api.post(`/product-add/${sellerId}`, formData, {withCredentials: true}) 
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

// End Method 

export const get_products = createAsyncThunk(
    'product//seller-products',
    async(options, {rejectWithValue, fulfillWithValue}) => {
        try {
            const { 
                page = 1, 
                searchValue = '', 
                parPage = 10, 
                sellerId = '',
                categoryId = '',
                minPrice = '',
                maxPrice = '',
                minDiscount = '',
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = options || {};
            
            const {data} = await api.get(`/seller-products?page=${page}&searchValue=${searchValue}&parPage=${parPage}&sellerId=${sellerId}&categoryId=${categoryId}&minPrice=${minPrice}&maxPrice=${maxPrice}&minDiscount=${minDiscount}&sortBy=${sortBy}&sortOrder=${sortOrder}`, {withCredentials: true}) 
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

  // End Method 


  
export const get_product = createAsyncThunk(
    'product/get_product',
    async(productId, {rejectWithValue, fulfillWithValue}) => {
        try {
            const {data} = await api.get(`/product-get/${productId}`, {withCredentials: true}) 
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

  // End Method 


  
export const update_product = createAsyncThunk(
    'product/update_product',
    async(product, {rejectWithValue, fulfillWithValue}) => {
        try {
            const {data} = await api.post('/product-update', product, {withCredentials: true}) 
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

  // End Method 


  export const product_image_update = createAsyncThunk(
    'product/product_image_update',
    async({oldImage, newImage, productId}, {rejectWithValue, fulfillWithValue}) => {
        try {
            const formData = new FormData()
            formData.append('oldImage', oldImage)
            formData.append('newImage', newImage)
            formData.append('productId', productId)             
            const {data} = await api.post('/product-image-update', formData, {withCredentials: true}) 
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

  // End Method 

export const delete_product = createAsyncThunk(
    'product/delete_product',
    async(productId, {rejectWithValue, fulfillWithValue}) => {
        try {
            const {data} = await api.delete(`/product-delete/${productId}`, {withCredentials: true}) 
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const productReducer = createSlice({
    name: 'product',
    initialState:{
        successMessage: '',
        errorMessage: '',
        loader: false,
        products: [], 
        product: '',
        totalProduct: 0
    },
    reducers: {
        messageClear: (state) => {
            state.errorMessage = ""
            state.successMessage = ""
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(add_product.pending, (state) => {
            state.loader = true;
        })
        .addCase(add_product.rejected, (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload.error
        }) 
        .addCase(add_product.fulfilled, (state, { payload }) => {
            state.loader = false;
            state.successMessage = payload.message 
        })

        .addCase(get_products.fulfilled, (state, { payload }) => {
            state.totalProduct = payload.totalProduts;
            state.products = payload.products;
        })
        .addCase(get_product.fulfilled, (state, { payload }) => {
            state.product = payload.product;  
        })

        .addCase(update_product.pending, (state) => {
            state.loader = true;
        })
        .addCase(update_product.rejected, (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload.error
        }) 
        .addCase(update_product.fulfilled, (state, { payload }) => {
            state.loader = false;
            state.product = payload.product 
            state.successMessage = payload.message 
        })

        .addCase(product_image_update.fulfilled, (state, { payload }) => { 
            state.product = payload.product 
            state.successMessage = payload.message  
        })
        
        .addCase(delete_product.pending, (state) => {
            state.loader = true;
        })
        .addCase(delete_product.rejected, (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload.error
        }) 
        .addCase(delete_product.fulfilled, (state, { payload }) => {
            state.loader = false;
            state.successMessage = payload.message;
            // Xóa sản phẩm khỏi danh sách hiện tại
            state.products = state.products.filter(p => p._id !== payload.productId);
        })
    }
})

export const {messageClear} = productReducer.actions
export default productReducer.reducer