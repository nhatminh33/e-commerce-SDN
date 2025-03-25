import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert,
  InputAdornment,
  Grid,
  Divider
} from '@mui/material';
import { update_product_cost_price, messageClear } from '../../store/Reducers/cashFlowReducer';

const ProductCostDialog = ({ open, handleClose, product, onSuccess }) => {
  const dispatch = useDispatch();
  const cashFlowState = useSelector(state => state.cashFlow) || {};
  const { 
    loading: isLoading = false, 
    error: apiError = '', 
    success: apiSuccess = '', 
    updatedProduct: updatedProductData = null 
  } = cashFlowState;
  
  // Local state
  const [costPrice, setCostPrice] = useState(product?.costPrice || 0);
  const [costError, setCostError] = useState('');
  
  // Initialize cost price when dialog opens
  useEffect(() => {
    if (open && product) {
      setCostPrice(product.costPrice || 0);
      setCostError('');
    }
  }, [open, product]);
  
  // Handle success from Redux
  useEffect(() => {
    if (apiSuccess && updatedProductData) {
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(updatedProductData);
      }
      
      // Auto close after success
      setTimeout(() => {
        handleClose();
        dispatch(messageClear());
      }, 1500);
    }
  }, [apiSuccess, updatedProductData, dispatch, onSuccess, handleClose]);
  
  // Handle cost price change
  const handleCostChange = (e) => {
    const value = e.target.value;
    setCostPrice(value);
    
    // Validate cost
    if (value.trim() === '') {
      setCostError('Cost price is required');
    } else if (isNaN(value)) {
      setCostError('Cost price must be a number');
    } else if (Number(value) < 0) {
      setCostError('Cost price cannot be negative');
    } else if (Number(value) > 1000000) { // Assuming a reasonable upper limit
      setCostError('Cost price is too high');
    } else {
      setCostError('');
    }
  };
  
  // Calculate profit and margin
  const calculateProfit = () => {
    if (!product) return { profit: 0, margin: 0 };
    
    const sellingPrice = product.price * (1 - (product.discount / 100));
    const profit = sellingPrice - Number(costPrice);
    const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
    
    return {
      sellingPrice,
      profit,
      margin
    };
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Handle submit
  const handleSubmit = () => {
    // Validate cost price
    if (costError) return;
    
    dispatch(update_product_cost_price({
      productId: product._id,
      costPrice: Number(costPrice)
    }));
  };
  
  const { sellingPrice, profit, margin } = calculateProfit();
  
  return (
    <Dialog
      open={open}
      onClose={isLoading ? null : handleClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        Update Cost Price
      </DialogTitle>
      <DialogContent>
        {product ? (
          <Box sx={{ pt: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              {product.name}
            </Typography>
            
            <TextField
              label="Cost Price"
              type="number"
              fullWidth
              value={costPrice}
              onChange={handleCostChange}
              error={!!costError}
              helperText={costError}
              margin="normal"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              disabled={isLoading}
            />
            
            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Profit Analysis
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Selling Price (after discount):
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" fontWeight="medium">
                    {formatCurrency(sellingPrice)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Cost Price:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" fontWeight="medium">
                    {formatCurrency(Number(costPrice) || 0)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Profit:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="body1"
                    fontWeight="medium"
                    color={profit >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatCurrency(profit)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Margin:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="body1"
                    fontWeight="medium"
                    color={margin >= 0 ? 'success.main' : 'error.main'}
                  >
                    {margin.toFixed(2)}%
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            
            {apiError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {apiError}
              </Alert>
            )}
            
            {apiSuccess && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Cost price updated successfully!
              </Alert>
            )}
          </Box>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography>Product information not available</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isLoading || !!costError || !product}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? 'Updating...' : 'Update Cost'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductCostDialog; 