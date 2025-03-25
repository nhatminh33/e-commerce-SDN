import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";
import axios from "axios";


export const get_category = createAsyncThunk(
    'product/get_categories',
    async (_, { fulfillWithValue, rejectWithValue }) => {
        try {
            const { data } = await api.get('/get-categories');
            console.log("Categories API Response:", data);
            return fulfillWithValue(data);
        } catch (error) {
            console.error("Categories API Error:", error.response);
            return rejectWithValue(error.response?.data || "Error fetching categories");
        }
    }
);

// End Method 
export const get_products = createAsyncThunk(
    'product/get_products',
    async (filters, { fulfillWithValue, rejectWithValue }) => {
        try {
            const {
                page = 1,
                perPage = 10,
                searchValue = '',
                categoryId = '',
                sortBy = 'createdAt',
                sortOrder = 'desc',
            } = filters || {};

            const { data } = await api.get(`/products-get?page=${page}&perPage=${perPage}&searchValue=${searchValue}&categoryId=${categoryId}&sortBy=${sortBy}&sortOrder=${sortOrder}`);

            console.log('API Response:', data); // Check the API response
            return fulfillWithValue(data);
        } catch (error) {
            console.error('Error fetching products:', error);
            return rejectWithValue(error.response?.data || 'Error fetching products');
        }
    }
);

// End Method 


export const price_range_product = createAsyncThunk(
    'product/price_range_product',
    async(_, { fulfillWithValue }) => {
        try {
            const {data} = await api.get('/home/price-range-latest-product')
             console.log(data)
            return fulfillWithValue(data)
        } catch (error) {
            console.log(error.respone)
        }
    }
)
// End Method 

export const query_products = createAsyncThunk(
    'product/query_products',
    async(query , { fulfillWithValue }) => {
        try {
            const {data} = await api.get(`/home/query-products?category=${query.category}&&rating=${query.rating}&&lowPrice=${query.low}&&highPrice=${query.high}&&sortPrice=${query.sortPrice}&&pageNumber=${query.pageNumber}&&searchValue=${query.searchValue ? query.searchValue : ''} `)
            //  console.log(data)
            return fulfillWithValue(data)
        } catch (error) {
            console.log(error.respone)
        }
    }
)
// End Method 

export const product_details = createAsyncThunk(
    'product/product_details',
    async(id, { fulfillWithValue }) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/customer/product/${id}`)
             console.log('haha', res.data.data)
            return fulfillWithValue(res.data.data)
        } catch (error) {
            console.log(error.respone)
        }
    }
)
// End Method 

export const customer_review = createAsyncThunk(
    'review/customer_review',
    async(info, { fulfillWithValue }) => {
        try {
            const {data} = await api.post('/home/customer/submit-review',info)
            //  console.log(data)
            return fulfillWithValue(data)
        } catch (error) {
            console.log(error.respone)
        }
    }
)
// End Method 


export const get_reviews = createAsyncThunk(
    'review/get_reviews',
    async({productId, pageNumber}, { fulfillWithValue }) => {
        try {
            const {data} = await api.get(`/home/customer/get-reviews/${productId}?pageNo=${pageNumber}`)
            //  console.log(data)
            return fulfillWithValue(data)
        } catch (error) {
            console.log(error.respone)
        }
    }
)
// End Method 


export const get_banners = createAsyncThunk(
    'banner/get_banners',
    async( _ , { fulfillWithValue }) => {
        try {
            const {data} = await api.get(`/banner`)
            //  console.log(data)
            return fulfillWithValue(data)
        } catch (error) {
            console.log(error.respone)
        }
    }
)
// End Method 




export const homeReducer = createSlice({
    name: 'home',
    initialState:{
        categorys : [],
        loading: false,
    error: null,
        products : [],
        totalProduct : 0,
        parPage: 3,
        latest_product : [],
        topRated_product : [],
        discount_product : [],
        priceRange : {
            low: 0,
            high: 100
        },
        product: {},
        relatedProducts: [],
        moreProducts: [],
        errorMessage : '',
        successMessage: '',
        totalReview: 0,
        rating_review: [],
        reviews : [],
        banners: [] 
    },
    reducers : {

        messageClear : (state,_) => {
            state.errorMessage = ""
            state.successMessage = ""
        }
 
    },
    extraReducers: (builder) => {
        builder
        .addCase(get_category.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(get_category.fulfilled, (state, { payload }) => {
            state.loading = false;
            state.categorys = payload.categorys || [];
        })
        .addCase(get_category.rejected, (state, { payload }) => {
            state.loading = false;
            state.error = payload;
        })
        .addCase(get_products.fulfilled, (state, { payload }) => {
            console.log('payload', payload);
            
            state.products = payload.products;
            state.totalProducts = payload.totalProduts;
            state.perPage = payload.perPage; 
            state.pages = payload.pages;
            state.currentPage = payload.currentPage;
        })
        .addCase(price_range_product.fulfilled, (state, { payload }) => { 
            state.latest_product = payload.latest_product;
            state.priceRange = payload.priceRange; 
        })
        .addCase(query_products.fulfilled, (state, { payload }) => { 
            state.products = payload.products;
            state.totalProduct = payload.totalProduct;
            state.parPage = payload.parPage; 
        })

        .addCase(product_details.fulfilled, (state, { payload }) => { 
            state.product = payload;
            // state.relatedProducts = payload.relatedProducts;
            // state.moreProducts = payload.moreProducts; 
        })

        .addCase(customer_review.fulfilled, (state, { payload }) => {
            state.successMessage = payload.message;
        })

        .addCase(get_reviews.fulfilled, (state, { payload }) => {
            state.reviews = payload.reviews;
            state.totalReview = payload.totalReview;
            state.rating_review = payload.rating_review;
        })

        .addCase(get_banners.fulfilled, (state, { payload }) => {
            state.banners = payload.banners; 
        })

    }
})
export const {messageClear} = homeReducer.actions
export default homeReducer.reducer