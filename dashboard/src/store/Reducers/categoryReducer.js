import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api"; 

export const categoryAdd = createAsyncThunk(
    'category/categoryAdd',
    async(formData, {rejectWithValue, fulfillWithValue}) => {
        try { 
            const {data} = await api.post('/add-category', formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }) 
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

// End Method 
 
export const get_category = createAsyncThunk(
    'category/get_category',
    async({perPage, page, searchValue}, {rejectWithValue, fulfillWithValue}) => {
        try {
            const {data} = await api.get(`/get-categories?page=${page}&searchValue=${searchValue}&perPage=${perPage}`, {
                withCredentials: true
            }) 
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

  // End Method 

export const get_categories = createAsyncThunk(
    'category/get_categories',
    async(_, {rejectWithValue, fulfillWithValue}) => {
        try {
            const {data} = await api.get('/statistics/get-all-categories', {
                withCredentials: true
            }) 
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

// End Method

export const updateCategory = createAsyncThunk(
    'category/updateCategory',
    async({id, formData}, {rejectWithValue, fulfillWithValue}) => {
        try { 
            const {data} = await api.put(`/update-category/${id}`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }) 
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

// End Method 

export const deleteCategory = createAsyncThunk(
    'category/deleteCategory',
    async(id, {rejectWithValue, fulfillWithValue}) => {
        try { 
            const {data} = await api.delete(`/delete-category/${id}`, {
                withCredentials: true
            })
            return fulfillWithValue({...data, id})
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

// End Method 
 
export const categoryReducer = createSlice({
    name: 'category',
    initialState: {
        successMessage: '',
        errorMessage: '',
        loader: false,
        categorys: [], 
        totalCategory: 0,
        pages: 1
    },
    reducers: {
        messageClear: (state) => {
            state.successMessage = ''
            state.errorMessage = ''
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(categoryAdd.pending, (state) => {
            state.loader = true
        })
        .addCase(categoryAdd.rejected, (state, { payload }) => {
            state.loader = false
            state.errorMessage = payload?.error || 'Something went wrong'
        }) 
        .addCase(categoryAdd.fulfilled, (state, { payload }) => {
            state.loader = false
            state.successMessage = payload.message
            state.categorys = [...state.categorys, payload.category]
            state.totalCategory += 1
        })

        .addCase(get_category.pending, (state) => {
            state.loader = true
        })
        .addCase(get_category.fulfilled, (state, { payload }) => {
            state.loader = false
            state.totalCategory = payload.totalCategory
            state.categorys = payload.categorys
            state.pages = payload.pages
        })
        .addCase(get_category.rejected, (state, { payload }) => {
            state.loader = false
            state.errorMessage = payload?.error || 'Failed to fetch categories'
        })

        .addCase(get_categories.pending, (state) => {
            state.loader = true
        })
        .addCase(get_categories.fulfilled, (state, { payload }) => {
            state.loader = false
            state.totalCategory = payload.totalCategory
            state.categorys = payload.categorys
            state.pages = payload.pages
        })
        .addCase(get_categories.rejected, (state, { payload }) => {
            state.loader = false
            state.errorMessage = payload?.error || 'Failed to fetch all categories'
        })

        .addCase(updateCategory.pending, (state) => {
            state.loader = true
        })
        .addCase(updateCategory.fulfilled, (state, { payload }) => {
            state.loader = false
            state.successMessage = payload.message
            const index = state.categorys.findIndex(cat => cat._id === payload.category._id)
            if (index !== -1) {
                state.categorys[index] = payload.category
            }
        })
        .addCase(updateCategory.rejected, (state, { payload }) => {
            state.loader = false
            state.errorMessage = payload?.error || 'Failed to update category'
        })

        .addCase(deleteCategory.pending, (state) => {
            state.loader = true
        })
        .addCase(deleteCategory.fulfilled, (state, { payload }) => {
            state.loader = false
            state.successMessage = payload.message
            state.categorys = state.categorys.filter(cat => cat._id !== payload.id)
            state.totalCategory -= 1
        })
        .addCase(deleteCategory.rejected, (state, { payload }) => {
            state.loader = false
            state.errorMessage = payload?.error || 'Failed to delete category'
        })
    }
})

export const {messageClear} = categoryReducer.actions
export default categoryReducer.reducer