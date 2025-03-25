import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

// Fetch Cash Flow Overview
export const get_cash_flow_overview = createAsyncThunk(
    'cashFlow/get_cash_flow_overview',
    async(filters, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.get('/dashboard/cash-flow/overview', {
                params: {
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                    period: filters.period
                },
                withCredentials: true
            });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Fetch Revenue Details
export const get_revenue_details = createAsyncThunk(
    'cashFlow/get_revenue_details',
    async(filters, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.get('/dashboard/cash-flow/revenue', {
                params: {
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                    groupBy: filters.groupBy
                },
                withCredentials: true
            });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Fetch Cost Details
export const get_cost_details = createAsyncThunk(
    'cashFlow/get_cost_details',
    async(filters, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.get('/dashboard/cash-flow/cost', {
                params: {
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                    groupBy: filters.groupBy
                },
                withCredentials: true
            });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Fetch Profit Details
export const get_profit_details = createAsyncThunk(
    'cashFlow/get_profit_details',
    async(filters, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.get('/dashboard/cash-flow/profit', {
                params: {
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                    groupBy: filters.groupBy,
                    sortBy: filters.sortBy,
                    order: filters.order
                },
                withCredentials: true
            });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Update Product Cost Price
export const update_product_cost_price = createAsyncThunk(
    'cashFlow/update_product_cost_price',
    async({productId, costPrice}, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.put(`/dashboard/cash-flow/product/${productId}/cost`, 
                { costPrice },
                { withCredentials: true }
            );
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const cashFlowReducer = createSlice({
    name: 'cashFlow',
    initialState: {
        // Overview data
        cashFlowData: {
            summary: {
                totalRevenue: 0,
                totalCost: 0,
                totalProfit: 0,
                profitMargin: 0,
                orderCount: 0
            },
            timeSeriesData: []
        },
        
        // Revenue data
        revenueData: [],
        totalRevenue: 0,
        
        // Cost data
        costData: [],
        totalCost: 0,
        
        // Profit data
        profitData: {
            summary: {
                totalRevenue: 0,
                totalCost: 0,
                totalProfit: 0,
                profitMargin: 0
            },
            profitData: []
        },
        
        // Profit analysis data by different groupings
        productProfitData: [],
        categoryProfitData: [],
        sellerProfitData: [],
        
        // Product cost update
        updatedProduct: null,
        
        // UI state
        loading: false,
        error: '',
        success: ''
    },
    reducers: {
        messageClear: (state) => {
            state.error = '';
            state.success = '';
        }
    },
    extraReducers: (builder) => {
        builder
            // Cash Flow Overview
            .addCase(get_cash_flow_overview.pending, (state) => {
                state.loading = true;
            })
            .addCase(get_cash_flow_overview.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.cashFlowData = payload;
            })
            .addCase(get_cash_flow_overview.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload?.error || 'Failed to fetch cash flow data';
            })
            
            // Revenue Details
            .addCase(get_revenue_details.pending, (state) => {
                state.loading = true;
            })
            .addCase(get_revenue_details.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.revenueData = payload.revenueData || [];
                state.totalRevenue = payload.totalRevenue || 0;
            })
            .addCase(get_revenue_details.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload?.error || 'Failed to fetch revenue data';
            })
            
            // Cost Details
            .addCase(get_cost_details.pending, (state) => {
                state.loading = true;
            })
            .addCase(get_cost_details.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.costData = payload.costData || [];
                state.totalCost = payload.totalCost || 0;
            })
            .addCase(get_cost_details.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload?.error || 'Failed to fetch cost data';
            })
            
            // Profit Details
            .addCase(get_profit_details.pending, (state) => {
                state.loading = true;
            })
            .addCase(get_profit_details.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.profitData = payload;
                // Set based on groupBy parameter (handled in the component)
                if (payload.groupBy === 'product') {
                    state.productProfitData = payload.profitData;
                } else if (payload.groupBy === 'category') {
                    state.categoryProfitData = payload.profitData;
                } else if (payload.groupBy === 'seller') {
                    state.sellerProfitData = payload.profitData;
                } else {
                    state.productProfitData = payload.profitData;
                }
            })
            .addCase(get_profit_details.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload?.error || 'Failed to fetch profit data';
            })
            
            // Update Product Cost Price
            .addCase(update_product_cost_price.pending, (state) => {
                state.loading = true;
            })
            .addCase(update_product_cost_price.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.updatedProduct = payload.product;
                state.success = payload.message;
            })
            .addCase(update_product_cost_price.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload?.error || 'Failed to update product cost';
            });
    }
});

export const { messageClear } = cashFlowReducer.actions;
export default cashFlowReducer.reducer; 