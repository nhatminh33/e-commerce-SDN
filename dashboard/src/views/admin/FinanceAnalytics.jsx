import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Grid, Paper, Card, CardContent, FormControl,
  InputLabel, Select, MenuItem, Button, TextField, 
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  TablePagination, CircularProgress, Alert, Snackbar, IconButton,
  Tooltip, Tabs, Tab, Divider, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis
} from 'recharts';
import {
  FilterList, Refresh, Download, GpsFixed, TrendingUp,
  MonetizationOn, ShowChart, TimelineOutlined, PieChartOutlined,
  Edit, Save, Cancel
} from '@mui/icons-material';
import { 
  get_cash_flow_overview,
  get_revenue_details,
  get_cost_details,
  get_profit_details,
  update_product_cost_price,
  messageClear
} from '../../store/Reducers/cashFlowReducer';
import moment from 'moment';
import { FaDollarSign, FaMoneyBillWave, FaChartLine, FaPercentage } from 'react-icons/fa';

// Color configuration
const COLORS = ['#f472b6', '#ec4899', '#db2777', '#be185d', '#9d174d', '#831843'];

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`finance-analytics-tabpanel-${index}`}
      aria-labelledby={`finance-analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Main component
const FinanceAnalytics = () => {
  const dispatch = useDispatch();
  const { token } = useSelector(state => state.auth);
  const cashFlowState = useSelector(state => state.cashFlow) || {};
  const { 
    cashFlowData = {
      summary: {
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0,
        profitMargin: 0,
        orderCount: 0
      },
      timeSeriesData: []
    },
    revenueData = [],
    costData = [],
    profitData = {
      summary: {
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0,
        profitMargin: 0
      },
      profitData: []
    }, 
    productProfitData = [], 
    categoryProfitData = [], 
    sellerProfitData = [],
    loading = false,
    error = '',
    success = '',
    updatedProduct = null
  } = cashFlowState;
  
  // State for filters
  const [filters, setFilters] = useState({
    startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
    period: 'daily',
    sortBy: 'profit',
    order: 'desc',
  });
  
  // State for pagination
  const [pagination, setPagination] = useState({
    revenuePage: 0,
    revenueRowsPerPage: 10,
    costPage: 0,
    costRowsPerPage: 10,
    productPage: 0,
    productRowsPerPage: 10,
    categoryPage: 0,
    categoryRowsPerPage: 10,
    sellerPage: 0,
    sellerRowsPerPage: 10
  });
  
  // State for main tabs and subtabs
  const [mainTabValue, setMainTabValue] = useState(0);
  const [cashFlowTabValue, setCashFlowTabValue] = useState(0);
  const [profitTabValue, setProfitTabValue] = useState(0);
  const [chartType, setChartType] = useState('bar');
  
  // State for product cost editing
  const [editingProduct, setEditingProduct] = useState(null);
  
  // State for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // State for data sorting
  const [sorting, setSorting] = useState({
    revenue: {
      field: 'date',
      order: 'desc'
    },
    cost: {
      field: 'cost',
      order: 'desc'
    },
    product: {
      field: 'profit',
      order: 'desc'
    },
    category: {
      field: 'profit',
      order: 'desc'
    },
    seller: {
      field: 'profit',
      order: 'desc'
    }
  });
  
  // Fetch data on initial load and when filters change
  useEffect(() => {
    fetchAllData();
  }, [filters.startDate, filters.endDate, filters.period]);
  
  // Add debugging logs
  useEffect(() => {
    console.log('Revenue Data:', revenueData);
    console.log('Cost Data:', costData);
    console.log('Loading:', loading);
    console.log('Error:', error);
    console.log('Cash Flow Data:', cashFlowData);
  }, [revenueData, costData, loading, error, cashFlowData]);
  
  // Handle success and error messages
  useEffect(() => {
    if (success) {
      setSnackbar({
        open: true,
        message: success,
        severity: 'success'
      });
      dispatch(messageClear());
      setEditingProduct(null);
      fetchAllData();
    }
    if (error) {
      setSnackbar({
        open: true,
        message: error,
        severity: 'error'
      });
      dispatch(messageClear());
    }
  }, [success, error, dispatch]);
  
  // API calls
  const fetchAllData = async () => {
    // Cash Flow data
    dispatch(get_cash_flow_overview(filters));
    dispatch(get_revenue_details({
      ...filters,
      groupBy: 'date'  // Ensure groupBy is 'date' to get date, revenue, orderCount data
    }));
    dispatch(get_cost_details({
      ...filters,
      groupBy: 'product'  // Ensure groupBy is 'product' to get product, cost, quantity data
    }));
    
    // Profit Analysis data
    dispatch(get_profit_details({
      ...filters,
      groupBy: 'product'
    }));
    dispatch(get_profit_details({
      ...filters,
      groupBy: 'category'
    }));
    dispatch(get_profit_details({
      ...filters,
      groupBy: 'seller'
    }));
  };
  
  // Event handlers
  const handleMainTabChange = (event, newValue) => {
    setMainTabValue(newValue);
  };
  
  const handleCashFlowTabChange = (event, newValue) => {
    setCashFlowTabValue(newValue);
  };
  
  const handleProfitTabChange = (event, newValue) => {
    setProfitTabValue(newValue);
  };
  
  const handleChartTypeChange = (type) => {
    setChartType(type);
  };
  
  const handleFilterChange = (field) => (event) => {
    setFilters({
      ...filters,
      [field]: event.target.value,
    });
  };
  
  const handleDateFilterChange = () => {
    fetchAllData();
  };
  
  // Xử lý phân trang cho từng loại bảng dữ liệu
  const handleChangePage = (type, newPage) => {
    setPagination({
      ...pagination,
      [`${type}Page`]: newPage
    });
  };
  
  const handleChangeRowsPerPage = (type, event) => {
    setPagination({
      ...pagination,
      [`${type}Page`]: 0,
      [`${type}RowsPerPage`]: parseInt(event.target.value, 10)
    });
  };
  
  // Product cost editing handlers
  const handleEditCost = (product) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      currentCost: product.cost,
      newCost: product.cost
    });
  };
  
  const handleCostChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setEditingProduct({
        ...editingProduct,
        newCost: value
      });
    }
  };
  
  const handleCostSubmit = () => {
    if (editingProduct && editingProduct.id) {
      dispatch(update_product_cost_price({
        productId: editingProduct.id,
        costPrice: editingProduct.newCost
      }));
    }
  };
  
  const handleCancelEdit = () => {
    setEditingProduct(null);
  };
  
  // Hàm xử lý sắp xếp
  const handleSort = (type, field) => {
    setSorting({
      ...sorting,
      [type]: {
        field,
        order: sorting[type].field === field && sorting[type].order === 'asc' ? 'desc' : 'asc'
      }
    });
  };
  
  // Hàm sắp xếp dữ liệu
  const sortData = (data, type) => {
    const { field, order } = sorting[type];
    
    if (!data || data.length === 0) return [];
    
    return [...data].sort((a, b) => {
      let valueA = a[field];
      let valueB = b[field];
      
      // Xử lý giá trị là chuỗi
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }
      
      // Để xử lý null hoặc undefined
      if (valueA === undefined) valueA = '';
      if (valueB === undefined) valueB = '';
      
      if (order === 'asc') {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });
  };
  
  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  const formatPercentage = (value) => {
    return `${parseFloat(value).toFixed(2)}%`;
  };
  
  const getDateRangeText = () => {
    const startDateFormatted = moment(filters.startDate).format('DD/MM/YYYY');
    const endDateFormatted = moment(filters.endDate).format('DD/MM/YYYY');
    return `${startDateFormatted} - ${endDateFormatted}`;
  };
  
  // Chart data getters
  const getCashFlowChartData = () => {
    if (!cashFlowData || !cashFlowData.timeSeriesData || !Array.isArray(cashFlowData.timeSeriesData)) return [];
    return cashFlowData.timeSeriesData.map(item => ({
      date: item.date,
      revenue: item.revenue || 0,
      cost: item.cost || 0,
      profit: item.profit || 0
    }));
  };
  
  const getProductProfitChart = () => {
    const data = productProfitData.slice(0, 10).map(item => ({
      name: item.name,
      profit: parseFloat(item.profit),
      margin: item.margin
    }));
    
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="profit" name="Profit" fill="#f472b6" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                nameKey="name"
                dataKey="profit"
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid />
              <XAxis type="number" dataKey="profit" name="Profit" unit="$" />
              <YAxis type="number" dataKey="margin" name="Margin" unit="%" />
              <ZAxis type="number" range={[100, 500]} />
              <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value) => {
                return typeof value === 'number' && value > 1 ? formatCurrency(value) : formatPercentage(value);
              }} />
              <Legend />
              <Scatter name="Products" data={data} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };
  
  const getCategoryProfitChart = () => {
    const data = categoryProfitData.map(item => ({
      name: item.name,
      profit: parseFloat(item.profit),
      margin: item.margin
    }));
    
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="profit" name="Profit" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                nameKey="name"
                dataKey="profit"
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid />
              <XAxis type="number" dataKey="profit" name="Profit" unit="$" />
              <YAxis type="number" dataKey="margin" name="Margin" unit="%" />
              <ZAxis type="number" range={[100, 500]} />
              <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value) => {
                return typeof value === 'number' && value > 1 ? formatCurrency(value) : formatPercentage(value);
              }} />
              <Legend />
              <Scatter name="Categories" data={data} fill="#00C49F" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };
  
  const getSellerProfitChart = () => {
    const data = sellerProfitData.map(item => ({
      name: item.name,
      profit: parseFloat(item.profit),
      margin: item.margin
    }));
    
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="profit" name="Profit" fill="#FFBB28" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                nameKey="name"
                dataKey="profit"
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid />
              <XAxis type="number" dataKey="profit" name="Profit" unit="$" />
              <YAxis type="number" dataKey="margin" name="Margin" unit="%" />
              <ZAxis type="number" range={[100, 500]} />
              <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value) => {
                return typeof value === 'number' && value > 1 ? formatCurrency(value) : formatPercentage(value);
              }} />
              <Legend />
              <Scatter name="Sellers" data={data} fill="#FFBB28" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };
  
  // Table columns config
  const revenueColumns = [
    { id: 'date', label: 'Date', minWidth: 100 },
    { id: 'revenue', label: 'Revenue', minWidth: 120, align: 'right', format: (value) => formatCurrency(value) },
    { id: 'orderCount', label: 'Orders', minWidth: 80, align: 'right' }
  ];
  
  const costColumns = [
    { id: 'name', label: 'Product', minWidth: 170 },
    { id: 'cost', label: 'Cost', minWidth: 100, align: 'right', format: (value) => formatCurrency(value) },
    { id: 'quantity', label: 'Quantity', minWidth: 80, align: 'right' }
  ];
  
  const profitColumns = [
    { id: 'name', label: 'Name', minWidth: 170 },
    { id: 'revenue', label: 'Revenue', minWidth: 120, align: 'right', format: (value) => formatCurrency(value) },
    { id: 'cost', label: 'Cost', minWidth: 120, align: 'right', format: (value) => formatCurrency(value) },
    { id: 'profit', label: 'Profit', minWidth: 120, align: 'right', format: (value) => formatCurrency(value) },
    { id: 'margin', label: 'Margin', minWidth: 80, align: 'right', format: (value) => formatPercentage(value) }
  ];
  
  // Hàm kiểm tra dữ liệu trống
  const isEmptyData = (data) => {
    return !data || data.length === 0;
  };

  // Đảm bảo revenueData và costData luôn là mảng
  const safeRevenueData = Array.isArray(revenueData) ? revenueData : [];
  const safeCostData = Array.isArray(costData) ? costData : [];
  
  // CSS class cho tiêu đề cột có thể sắp xếp
  const sortableHeaderClass = 'py-3 px-4 cursor-pointer select-none transition-colors hover:bg-pink-100';
  
  return (
    <div className='px-2 md:px-7 py-5'>
      <h2 className='text-2xl font-bold text-pink-600 mb-4'>Finance Analytics</h2>
      
      {/* Date Range Filters */}
      <div className='w-full bg-white p-4 rounded-md mb-6 shadow-sm'>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center'>
          <div>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              value={filters.startDate}
              onChange={handleFilterChange('startDate')}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </div>
          <div>
            <TextField
              label="End Date"
              type="date"
              fullWidth
              value={filters.endDate}
              onChange={handleFilterChange('endDate')}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </div>
          <div>
            <FormControl fullWidth size="small">
              <InputLabel>Time Period</InputLabel>
              <Select
                value={filters.period}
                label="Time Period"
                onChange={handleFilterChange('period')}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div>
            <Button 
              variant="contained" 
              fullWidth
              startIcon={<FilterList />}
              onClick={handleDateFilterChange}
              className='bg-pink-600 hover:bg-pink-700'
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Revenue */}
        <div className="p-4 bg-white rounded-lg shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
              <h4 className="text-2xl font-semibold text-gray-800 mt-1">
                {formatCurrency(cashFlowData?.summary?.totalRevenue || 0)}
              </h4>
            </div>
            <div className="p-2 rounded-full bg-pink-100 text-pink-500">
              <FaDollarSign size={20} />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            <span>Period: </span>
            <span className="font-medium">{getDateRangeText()}</span>
          </p>
        </div>
        
        {/* Total Cost */}
        <div className="p-4 bg-white rounded-lg shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Cost</p>
              <h4 className="text-2xl font-semibold text-gray-800 mt-1">
                {formatCurrency(cashFlowData?.summary?.totalCost || 0)}
              </h4>
            </div>
            <div className="p-2 rounded-full bg-pink-100 text-pink-500">
              <FaMoneyBillWave size={20} />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            <span>Period: </span>
            <span className="font-medium">{getDateRangeText()}</span>
          </p>
        </div>
        
        {/* Total Profit */}
        <div className="p-4 bg-white rounded-lg shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Profit</p>
              <h4 className="text-2xl font-semibold text-gray-800 mt-1">
                {formatCurrency(cashFlowData?.summary?.totalProfit || 0)}
              </h4>
            </div>
            <div className="p-2 rounded-full bg-pink-100 text-pink-500">
              <FaChartLine size={20} />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            <span>Period: </span>
            <span className="font-medium">{getDateRangeText()}</span>
          </p>
        </div>
        
        {/* Profit Margin */}
        <div className="p-4 bg-white rounded-lg shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Profit Margin</p>
              <h4 className="text-2xl font-semibold text-gray-800 mt-1">
                {formatPercentage(cashFlowData?.summary?.profitMargin || 0)}
              </h4>
            </div>
            <div className="p-2 rounded-full bg-pink-100 text-pink-500">
              <FaPercentage size={20} />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            <span>Period: </span>
            <span className="font-medium">{getDateRangeText()}</span>
          </p>
        </div>
      </div>
      
      {/* Main tabs */}
      <div className='w-full bg-white p-4 rounded-md shadow-sm mb-6'>
        <Tabs
          value={mainTabValue}
          onChange={handleMainTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#ec4899',
            },
            '& .MuiTab-root.Mui-selected': {
              color: '#ec4899',
            },
          }}
        >
          <Tab label="Cash Flow Analysis" icon={<TimelineOutlined />} iconPosition="start" className='text-gray-700 font-medium' />
          <Tab label="Profit Analysis" icon={<ShowChart />} iconPosition="start" className='text-gray-700 font-medium' />
        </Tabs>
      </div>
      
      {/* Tab Panels */}
      <TabPanel value={mainTabValue} index={0}>
        <div className='w-full bg-white p-4 rounded-md shadow-sm mb-6'>
          <Tabs
            value={cashFlowTabValue}
            onChange={handleCashFlowTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#ec4899',
              },
              '& .MuiTab-root.Mui-selected': {
                color: '#ec4899',
              },
            }}
          >
            <Tab label="Cash Flow Overview" icon={<TimelineOutlined />} iconPosition="start" className='text-gray-700' />
            <Tab label="Revenue Details" icon={<TrendingUp />} iconPosition="start" className='text-gray-700' />
            <Tab label="Cost Details" icon={<MonetizationOn />} iconPosition="start" className='text-gray-700' />
          </Tabs>
            
          {/* Cash Flow Overview Tab */}
          <div className='py-5'>
            <TabPanel value={cashFlowTabValue} index={0}>
              <div className='w-full bg-white p-4 rounded-md mb-6'>
                <h2 className='text-xl font-bold text-pink-600 mb-3 border-b border-pink-100 pb-2'>Cash Flow Trends</h2>
                <div className='h-[400px]'>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={getCashFlowChartData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f9a8d4" />
                      <XAxis dataKey="date" stroke="#374151" />
                      <YAxis stroke="#374151" />
                      <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#ec4899" name="Revenue" strokeWidth={2} />
                      <Line type="monotone" dataKey="cost" stroke="#8b5cf6" name="Cost" strokeWidth={2} />
                      <Line type="monotone" dataKey="profit" stroke="#10b981" name="Profit" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabPanel>
            
            {/* Revenue Details Tab */}
            <TabPanel value={cashFlowTabValue} index={1}>
              <div className='relative overflow-x-auto sm:rounded-lg'>
                {loading ? (
                  <div className='w-full py-16 flex justify-center items-center'>
                    <div className='text-center'>
                      <CircularProgress className='text-pink-600 mb-2' />
                      <p className='text-gray-500'>Loading revenue data...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className='w-full py-8 text-center'>
                    <div className='bg-red-50 text-red-600 p-4 rounded-md inline-block'>
                      <p>Error loading data: {error}</p>
                      <button 
                        className='mt-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-md'
                        onClick={() => dispatch(get_revenue_details({
                          ...filters,
                          groupBy: 'date'
                        }))}
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                ) : isEmptyData(safeRevenueData) ? (
                  <div className='w-full py-8 text-center'>
                    <p className='text-gray-500'>No revenue data available for this time period</p>
                    <button 
                      className='mt-2 bg-pink-100 hover:bg-pink-200 text-pink-700 px-4 py-2 rounded-md'
                      onClick={() => dispatch(get_revenue_details({
                        ...filters,
                        groupBy: 'date'
                      }))}
                    >
                      Refresh Data
                    </button>
                  </div>
                ) : (
                  <>
                    <div className='mb-4 flex justify-between items-center'>
                      <h2 className='text-xl font-bold text-pink-600'>Revenue by Time Period</h2>
                      <button
                        className='flex items-center text-pink-600 hover:text-pink-800 transition-colors'
                        onClick={() => dispatch(get_revenue_details({
                          ...filters,
                          groupBy: 'date'
                        }))}
                      >
                        <Refresh className='w-5 h-5 mr-1' />
                        Refresh
                      </button>
                    </div>
                    
                    <div className='overflow-x-auto'>
                      <table className='w-full border-collapse'>
                        <thead className='text-xs text-gray-700 uppercase bg-pink-50'>
                          <tr>
                            {revenueColumns.map((column) => (
                              <th
                                key={column.id}
                                scope='col'
                                className={sortableHeaderClass}
                                style={{ minWidth: column.minWidth, textAlign: column.align || 'left' }}
                                onClick={() => handleSort('revenue', column.id)}
                              >
                                <div className="flex items-center justify-between">
                                  {column.label}
                                  {sorting.revenue.field === column.id && (
                                    <span className="ml-1">
                                      {sorting.revenue.order === 'asc' ? '↑' : '↓'}
                                    </span>
                                  )}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sortData(safeRevenueData, 'revenue')
                            .slice(
                              pagination.revenuePage * pagination.revenueRowsPerPage, 
                              pagination.revenuePage * pagination.revenueRowsPerPage + pagination.revenueRowsPerPage
                            )
                            .map((row, i) => (
                              <tr key={row.date || i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-pink-50'} border-b border-pink-100 hover:bg-pink-100`}>
                                {revenueColumns.map((column) => {
                                  const value = row[column.id];
                                  return (
                                    <td
                                      key={column.id}
                                      className='py-3 px-4 font-medium whitespace-nowrap'
                                      style={{ textAlign: column.align || 'left' }}
                                    >
                                      {column.format && typeof value === 'number' ? column.format(value) : value}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    <div className='py-3 px-4'>
                      <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={safeRevenueData.length}
                        rowsPerPage={pagination.revenueRowsPerPage}
                        page={pagination.revenuePage}
                        onPageChange={(event, newPage) => handleChangePage('revenue', newPage)}
                        onRowsPerPageChange={(event) => handleChangeRowsPerPage('revenue', event)}
                        labelRowsPerPage="Rows per page:"
                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
                      />
                    </div>
                  </>
                )}
              </div>
            </TabPanel>
            
            {/* Cost Details Tab */}
            <TabPanel value={cashFlowTabValue} index={2}>
              <div className='relative overflow-x-auto sm:rounded-lg'>
                {loading ? (
                  <div className='w-full py-16 flex justify-center items-center'>
                    <div className='text-center'>
                      <CircularProgress className='text-pink-600 mb-2' />
                      <p className='text-gray-500'>Loading cost data...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className='w-full py-8 text-center'>
                    <div className='bg-red-50 text-red-600 p-4 rounded-md inline-block'>
                      <p>Error loading data: {error}</p>
                      <button 
                        className='mt-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-md'
                        onClick={() => dispatch(get_cost_details({
                          ...filters,
                          groupBy: 'product'
                        }))}
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                ) : isEmptyData(safeCostData) ? (
                  <div className='w-full py-8 text-center'>
                    <p className='text-gray-500'>No cost data available for this time period</p>
                    <button 
                      className='mt-2 bg-pink-100 hover:bg-pink-200 text-pink-700 px-4 py-2 rounded-md'
                      onClick={() => dispatch(get_cost_details({
                        ...filters,
                        groupBy: 'product'
                      }))}
                    >
                      Refresh Data
                    </button>
                  </div>
                ) : (
                  <>
                    <div className='mb-4 flex justify-between items-center'>
                      <h2 className='text-xl font-bold text-pink-600'>Product Cost Details</h2>
                      <button
                        className='flex items-center text-pink-600 hover:text-pink-800 transition-colors'
                        onClick={() => dispatch(get_cost_details({
                          ...filters,
                          groupBy: 'product'
                        }))}
                      >
                        <Refresh className='w-5 h-5 mr-1' />
                        Refresh
                      </button>
                    </div>
                    
                    <div className='overflow-x-auto'>
                      <table className='w-full border-collapse'>
                        <thead className='text-xs text-gray-700 uppercase bg-pink-50'>
                          <tr>
                            {costColumns.map((column) => (
                              <th
                                key={column.id}
                                scope='col'
                                className={sortableHeaderClass}
                                style={{ minWidth: column.minWidth, textAlign: column.align || 'left' }}
                                onClick={() => handleSort('cost', column.id)}
                              >
                                <div className="flex items-center justify-between">
                                  {column.label}
                                  {sorting.cost.field === column.id && (
                                    <span className="ml-1">
                                      {sorting.cost.order === 'asc' ? '↑' : '↓'}
                                    </span>
                                  )}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sortData(safeCostData, 'cost')
                            .slice(
                              pagination.costPage * pagination.costRowsPerPage, 
                              pagination.costPage * pagination.costRowsPerPage + pagination.costRowsPerPage
                            )
                            .map((row, i) => (
                              <tr key={row.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-pink-50'} border-b border-pink-100 hover:bg-pink-100`}>
                                {costColumns.map((column) => {
                                  const value = row[column.id];
                                  return (
                                    <td
                                      key={column.id}
                                      className='py-3 px-4 font-medium whitespace-nowrap'
                                      style={{ textAlign: column.align || 'left' }}
                                    >
                                      {column.format && typeof value === 'number' ? column.format(value) : value}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    <div className='py-3 px-4'>
                      <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={safeCostData.length}
                        rowsPerPage={pagination.costRowsPerPage}
                        page={pagination.costPage}
                        onPageChange={(event, newPage) => handleChangePage('cost', newPage)}
                        onRowsPerPageChange={(event) => handleChangeRowsPerPage('cost', event)}
                        labelRowsPerPage="Rows per page:"
                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
                      />
                    </div>
                  </>
                )}
              </div>
            </TabPanel>
          </div>
        </div>
      </TabPanel>
      
      {/* Profit Analysis Tab */}
      <TabPanel value={mainTabValue} index={1}>
        <div className='w-full bg-white p-4 rounded-md shadow-sm mb-6'>
          <Tabs
            value={profitTabValue}
            onChange={handleProfitTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#ec4899',
              },
              '& .MuiTab-root.Mui-selected': {
                color: '#ec4899',
              },
            }}
          >
            <Tab label="By Product" icon={<PieChartOutlined />} iconPosition="start" className='text-gray-700' />
            <Tab label="By Category" icon={<PieChartOutlined />} iconPosition="start" className='text-gray-700' />
            <Tab label="By Seller" icon={<PieChartOutlined />} iconPosition="start" className='text-gray-700' />
          </Tabs>
          
          <div className='flex justify-end space-x-2 my-4'>
            <button 
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${chartType === 'bar' ? 'bg-pink-600 text-white' : 'bg-white text-pink-600 border border-pink-600'}`}
              onClick={() => handleChartTypeChange('bar')}
            >
              Bar Chart
            </button>
            <button 
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${chartType === 'pie' ? 'bg-pink-600 text-white' : 'bg-white text-pink-600 border border-pink-600'}`}
              onClick={() => handleChartTypeChange('pie')}
            >
              Pie Chart
            </button>
            {/* <button 
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${chartType === 'scatter' ? 'bg-pink-600 text-white' : 'bg-white text-pink-600 border border-pink-600'}`}
              onClick={() => handleChartTypeChange('scatter')}
            >
              Scatter Chart
            </button> */}
          </div>
          
          <div className='py-5'>
            {/* By Product Tab */}
            <TabPanel value={profitTabValue} index={0}>
              {loading ? (
                <div className='w-full py-16 flex justify-center items-center'>
                  <div className='text-center'>
                    <CircularProgress className='text-pink-600 mb-2' />
                    <p className='text-gray-500'>Loading product profit data...</p>
                  </div>
                </div>
              ) : error ? (
                <div className='w-full py-8 text-center'>
                  <div className='bg-red-50 text-red-600 p-4 rounded-md inline-block'>
                    <p>Error loading data: {error}</p>
                    <button 
                      className='mt-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-md'
                      onClick={() => dispatch(get_profit_details({ ...filters, groupBy: 'product' }))}
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : isEmptyData(productProfitData) ? (
                <div className='w-full py-8 text-center'>
                  <p className='text-gray-500'>No product profit data available for this time period</p>
                </div>
              ) : (
                <>
                  <div className='w-full bg-white p-4 rounded-md mb-6'>
                    <div className='mb-4 flex justify-between items-center'>
                      <h2 className='text-xl font-bold text-pink-600 border-b border-pink-100 pb-2'>Product Profit Analysis</h2>
                      <button
                        className='flex items-center text-pink-600 hover:text-pink-800 transition-colors'
                        onClick={() => dispatch(get_profit_details({ ...filters, groupBy: 'product' }))}
                      >
                        <Refresh className='w-5 h-5 mr-1' />
                        Refresh
                      </button>
                    </div>
                    <div className='h-[400px] mb-4'>
                      {getProductProfitChart()}
                    </div>
                  </div>
                  
                  <div className='relative overflow-x-auto sm:rounded-lg'>
                    <table className='w-full text-sm text-left text-gray-700'>
                      <thead className='text-xs text-gray-700 uppercase bg-pink-50'>
                        <tr>
                          {profitColumns.map((column) => (
                            <th
                              key={column.id}
                              scope='col'
                              className={sortableHeaderClass}
                              style={{ textAlign: column.align || 'left' }}
                              onClick={() => handleSort('product', column.id)}
                            >
                              <div className="flex items-center justify-between">
                                {column.label}
                                {sorting.product.field === column.id && (
                                  <span className="ml-1">
                                    {sorting.product.order === 'asc' ? '↑' : '↓'}
                                  </span>
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sortData(productProfitData, 'product')
                          .slice(
                            pagination.productPage * pagination.productRowsPerPage, 
                            pagination.productPage * pagination.productRowsPerPage + pagination.productRowsPerPage
                          )
                          .map((row, i) => (
                            <tr key={row.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-pink-50'} border-b border-pink-100 hover:bg-pink-100`}>
                              {profitColumns.map((column) => {
                                const value = row[column.id];
                                return (
                                  <td
                                    key={column.id}
                                    className='py-3 px-4 font-medium whitespace-nowrap'
                                    style={{ textAlign: column.align || 'left' }}
                                  >
                                    {column.format && typeof value === 'number' ? column.format(value) : value}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    <div className='py-3 px-4'>
                      <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={productProfitData.length}
                        rowsPerPage={pagination.productRowsPerPage}
                        page={pagination.productPage}
                        onPageChange={(event, newPage) => handleChangePage('product', newPage)}
                        onRowsPerPageChange={(event) => handleChangeRowsPerPage('product', event)}
                        labelRowsPerPage="Rows per page:"
                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
                      />
                    </div>
                  </div>
                </>
              )}
            </TabPanel>
            
            {/* By Category Tab */}
            <TabPanel value={profitTabValue} index={1}>
              {loading ? (
                <div className='w-full py-16 flex justify-center items-center'>
                  <div className='text-center'>
                    <CircularProgress className='text-pink-600 mb-2' />
                    <p className='text-gray-500'>Loading category profit data...</p>
                  </div>
                </div>
              ) : error ? (
                <div className='w-full py-8 text-center'>
                  <div className='bg-red-50 text-red-600 p-4 rounded-md inline-block'>
                    <p>Error loading data: {error}</p>
                    <button 
                      className='mt-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-md'
                      onClick={() => dispatch(get_profit_details({ ...filters, groupBy: 'category' }))}
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : isEmptyData(categoryProfitData) ? (
                <div className='w-full py-8 text-center'>
                  <p className='text-gray-500'>No category profit data available for this time period</p>
                </div>
              ) : (
                <>
                  <div className='w-full bg-white p-4 rounded-md mb-6'>
                    <div className='mb-4 flex justify-between items-center'>
                      <h2 className='text-xl font-bold text-pink-600 border-b border-pink-100 pb-2'>Category Profit Analysis</h2>
                      <button
                        className='flex items-center text-pink-600 hover:text-pink-800 transition-colors'
                        onClick={() => dispatch(get_profit_details({ ...filters, groupBy: 'category' }))}
                      >
                        <Refresh className='w-5 h-5 mr-1' />
                        Refresh
                      </button>
                    </div>
                    <div className='h-[400px] mb-4'>
                      {getCategoryProfitChart()}
                    </div>
                  </div>
                  
                  <div className='relative overflow-x-auto sm:rounded-lg'>
                    <table className='w-full text-sm text-left text-gray-700'>
                      <thead className='text-xs text-gray-700 uppercase bg-pink-50'>
                        <tr>
                          {profitColumns.map((column) => (
                            <th
                              key={column.id}
                              scope='col'
                              className={sortableHeaderClass}
                              style={{ textAlign: column.align || 'left' }}
                              onClick={() => handleSort('category', column.id)}
                            >
                              <div className="flex items-center justify-between">
                                {column.label}
                                {sorting.category.field === column.id && (
                                  <span className="ml-1">
                                    {sorting.category.order === 'asc' ? '↑' : '↓'}
                                  </span>
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sortData(categoryProfitData, 'category')
                          .slice(
                            pagination.categoryPage * pagination.categoryRowsPerPage, 
                            pagination.categoryPage * pagination.categoryRowsPerPage + pagination.categoryRowsPerPage
                          )
                          .map((row, i) => (
                            <tr key={row.id || i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-pink-50'} border-b border-pink-100 hover:bg-pink-100`}>
                              {profitColumns.map((column) => {
                                const value = row[column.id];
                                return (
                                  <td
                                    key={column.id}
                                    className='py-3 px-4 font-medium whitespace-nowrap'
                                    style={{ textAlign: column.align || 'left' }}
                                  >
                                    {column.format && typeof value === 'number' ? column.format(value) : value}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    <div className='py-3 px-4'>
                      <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={categoryProfitData.length}
                        rowsPerPage={pagination.categoryRowsPerPage}
                        page={pagination.categoryPage}
                        onPageChange={(event, newPage) => handleChangePage('category', newPage)}
                        onRowsPerPageChange={(event) => handleChangeRowsPerPage('category', event)}
                        labelRowsPerPage="Rows per page:"
                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
                      />
                    </div>
                  </div>
                </>
              )}
            </TabPanel>
            
            {/* By Seller Tab */}
            <TabPanel value={profitTabValue} index={2}>
              {loading ? (
                <div className='w-full py-16 flex justify-center items-center'>
                  <div className='text-center'>
                    <CircularProgress className='text-pink-600 mb-2' />
                    <p className='text-gray-500'>Loading seller profit data...</p>
                  </div>
                </div>
              ) : error ? (
                <div className='w-full py-8 text-center'>
                  <div className='bg-red-50 text-red-600 p-4 rounded-md inline-block'>
                    <p>Error loading data: {error}</p>
                    <button 
                      className='mt-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-md'
                      onClick={() => dispatch(get_profit_details({ ...filters, groupBy: 'seller' }))}
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : isEmptyData(sellerProfitData) ? (
                <div className='w-full py-8 text-center'>
                  <p className='text-gray-500'>No seller profit data available for this time period</p>
                </div>
              ) : (
                <>
                  <div className='w-full bg-white p-4 rounded-md mb-6'>
                    <div className='mb-4 flex justify-between items-center'>
                      <h2 className='text-xl font-bold text-pink-600 border-b border-pink-100 pb-2'>Seller Profit Analysis</h2>
                      <button
                        className='flex items-center text-pink-600 hover:text-pink-800 transition-colors'
                        onClick={() => dispatch(get_profit_details({ ...filters, groupBy: 'seller' }))}
                      >
                        <Refresh className='w-5 h-5 mr-1' />
                        Refresh
                      </button>
                    </div>
                    <div className='h-[400px] mb-4'>
                      {getSellerProfitChart()}
                    </div>
                  </div>
                  
                  <div className='relative overflow-x-auto sm:rounded-lg'>
                    <table className='w-full text-sm text-left text-gray-700'>
                      <thead className='text-xs text-gray-700 uppercase bg-pink-50'>
                        <tr>
                          {profitColumns.map((column) => (
                            <th
                              key={column.id}
                              scope='col'
                              className={sortableHeaderClass}
                              style={{ textAlign: column.align || 'left' }}
                              onClick={() => handleSort('seller', column.id)}
                            >
                              <div className="flex items-center justify-between">
                                {column.label}
                                {sorting.seller.field === column.id && (
                                  <span className="ml-1">
                                    {sorting.seller.order === 'asc' ? '↑' : '↓'}
                                  </span>
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sortData(sellerProfitData, 'seller')
                          .slice(
                            pagination.sellerPage * pagination.sellerRowsPerPage, 
                            pagination.sellerPage * pagination.sellerRowsPerPage + pagination.sellerRowsPerPage
                          )
                          .map((row, i) => (
                            <tr key={row.id || i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-pink-50'} border-b border-pink-100 hover:bg-pink-100`}>
                              {profitColumns.map((column) => {
                                const value = row[column.id];
                                return (
                                  <td
                                    key={column.id}
                                    className='py-3 px-4 font-medium whitespace-nowrap'
                                    style={{ textAlign: column.align || 'left' }}
                                  >
                                    {column.format && typeof value === 'number' ? column.format(value) : value}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    <div className='py-3 px-4'>
                      <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={sellerProfitData.length}
                        rowsPerPage={pagination.sellerRowsPerPage}
                        page={pagination.sellerPage}
                        onPageChange={(event, newPage) => handleChangePage('seller', newPage)}
                        onRowsPerPageChange={(event) => handleChangeRowsPerPage('seller', event)}
                        labelRowsPerPage="Rows per page:"
                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
                      />
                    </div>
                  </div>
                </>
              )}
            </TabPanel>
          </div>
        </div>
      </TabPanel>
      
      {/* Dialog for editing product cost */}
      {editingProduct && (
        <Dialog open onClose={handleCancelEdit} maxWidth="sm" fullWidth>
          <DialogTitle className='bg-pink-50 border-b border-pink-100'>
            <h2 className='text-xl font-bold text-gray-800'>Edit Cost Price: {editingProduct.name}</h2>
          </DialogTitle>
          <DialogContent>
            <div className='mt-4'>
              <TextField
                label="Current Cost Price"
                value={editingProduct.currentCost}
                fullWidth
                disabled
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
              <TextField
                label="New Cost Price"
                value={editingProduct.newCost}
                onChange={handleCostChange}
                fullWidth
                margin="normal"
                autoFocus
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </div>
          </DialogContent>
          <DialogActions className='p-4 bg-gray-50'>
            <Button 
              onClick={handleCancelEdit} 
              className='bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md'
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCostSubmit}
              className={`${editingProduct.currentCost === editingProduct.newCost ? 'bg-gray-400 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-700'} text-white px-4 py-2 rounded-md`}
              disabled={editingProduct.currentCost === editingProduct.newCost}
            >
              Update
            </Button>
          </DialogActions>
        </Dialog>
      )}
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          className='rounded-md shadow-md'
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Loading indicator */}
      {loading && (
        <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50'>
          <div className='p-6 bg-white rounded-lg shadow-lg'>
            <CircularProgress className='text-pink-600' />
            <p className='mt-4 text-gray-700 text-center'>Loading data...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceAnalytics; 