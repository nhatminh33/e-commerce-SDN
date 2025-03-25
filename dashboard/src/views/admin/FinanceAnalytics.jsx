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

// Color configuration
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

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
    page: 0,
    rowsPerPage: 10
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
  
  // Fetch data on initial load and when filters change
  useEffect(() => {
    fetchAllData();
  }, [filters.startDate, filters.endDate, filters.period]);
  
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
    dispatch(get_revenue_details(filters));
    dispatch(get_cost_details(filters));
    
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
      page: field !== 'page' && field !== 'rowsPerPage' ? 0 : filters.page
    });
  };
  
  const handleDateFilterChange = () => {
    fetchAllData();
  };
  
  const handleChangePage = (event, newPage) => {
    setFilters({ ...filters, page: newPage });
  };
  
  const handleChangeRowsPerPage = (event) => {
    setFilters({
      ...filters,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0
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
  
  // Chart data getters
  const getCashFlowChartData = () => {
    if (!cashFlowData.timeSeriesData) return [];
    return cashFlowData.timeSeriesData.map(item => ({
      date: item.date,
      revenue: item.revenue,
      cost: item.cost,
      profit: item.profit
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
              <Bar dataKey="profit" name="Profit" fill="#8884d8" />
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
  };
  
  const getSellerProfitChart = () => {
    const data = sellerProfitData.map(item => ({
      name: item.name,
      profit: parseFloat(item.profit),
      margin: item.margin
    }));
    
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
    { id: 'quantity', label: 'Quantity', minWidth: 100, align: 'right' }
  ];
  
  const profitColumns = [
    { id: 'name', label: 'Name', minWidth: 170 },
    { id: 'revenue', label: 'Revenue', minWidth: 120, align: 'right', format: (value) => formatCurrency(value) },
    { id: 'cost', label: 'Cost', minWidth: 120, align: 'right', format: (value) => formatCurrency(value) },
    { id: 'profit', label: 'Profit', minWidth: 120, align: 'right', format: (value) => formatCurrency(value) },
    { id: 'margin', label: 'Margin', minWidth: 80, align: 'right', format: (value) => formatPercentage(value) }
  ];
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Finance Analytics
      </Typography>
      
      {/* Date Range Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              value={filters.startDate}
              onChange={handleFilterChange('startDate')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              label="End Date"
              type="date"
              fullWidth
              value={filters.endDate}
              onChange={handleFilterChange('endDate')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth>
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
          </Grid>
          <Grid item xs={12} md={3}>
            <Button 
              variant="contained" 
              fullWidth
              startIcon={<FilterList />}
              onClick={handleDateFilterChange}
            >
              Apply Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Revenue</Typography>
              <Typography variant="h4">
                {formatCurrency(profitData.summary.totalRevenue)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUp sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Revenue in period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Cost</Typography>
              <Typography variant="h4">
                {formatCurrency(profitData.summary.totalCost)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <MonetizationOn sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Cost of goods sold
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Profit</Typography>
              <Typography variant="h4">
                {formatCurrency(profitData.summary.totalProfit)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <ShowChart sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Net profit
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Profit Margin</Typography>
              <Typography variant="h4">
                {formatPercentage(profitData.summary.profitMargin)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TimelineOutlined sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Profit / Revenue
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Main tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={mainTabValue}
          onChange={handleMainTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Cash Flow" />
          <Tab label="Profit Analysis" />
        </Tabs>
      </Paper>
      
      {/* Tab Panels */}
      <TabPanel value={mainTabValue} index={0}>
        <Box sx={{ mb: 2 }}>
          <Paper>
            <Tabs
              value={cashFlowTabValue}
              onChange={handleCashFlowTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Cash Flow Overview" icon={<TimelineOutlined />} />
              <Tab label="Revenue Details" icon={<TrendingUp />} />
              <Tab label="Cost Details" icon={<MonetizationOn />} />
            </Tabs>
            
            {/* Cash Flow Overview Tab */}
            <TabPanel value={cashFlowTabValue} index={0}>
              <Box sx={{ height: 400, mb: 3 }}>
                <Typography variant="h6" gutterBottom align="center">
                  Cash Flow Over Time
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getCashFlowChartData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#0088FE" name="Revenue" />
                    <Line type="monotone" dataKey="cost" stroke="#FF8042" name="Cost" />
                    <Line type="monotone" dataKey="profit" stroke="#00C49F" name="Profit" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </TabPanel>
            
            {/* Revenue Details Tab */}
            <TabPanel value={cashFlowTabValue} index={1}>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {revenueColumns.map((column) => (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          style={{ minWidth: column.minWidth }}
                        >
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {revenueData
                      .slice(filters.page * filters.rowsPerPage, filters.page * filters.rowsPerPage + filters.rowsPerPage)
                      .map((row) => (
                        <TableRow hover role="checkbox" tabIndex={-1} key={row.date}>
                          {revenueColumns.map((column) => {
                            const value = row[column.id];
                            return (
                              <TableCell key={column.id} align={column.align}>
                                {column.format && typeof value === 'number' ? column.format(value) : value}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 100]}
                  component="div"
                  count={revenueData.length}
                  rowsPerPage={filters.rowsPerPage}
                  page={filters.page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
            </TabPanel>
            
            {/* Cost Details Tab */}
            <TabPanel value={cashFlowTabValue} index={2}>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {costColumns.map((column) => (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          style={{ minWidth: column.minWidth }}
                        >
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {costData
                      .slice(filters.page * filters.rowsPerPage, filters.page * filters.rowsPerPage + filters.rowsPerPage)
                      .map((row) => (
                        <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                          {costColumns.map((column) => {
                            const value = row[column.id];
                            return (
                              <TableCell key={column.id} align={column.align}>
                                {column.format && typeof value === 'number' ? column.format(value) : value}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 100]}
                  component="div"
                  count={costData.length}
                  rowsPerPage={filters.rowsPerPage}
                  page={filters.page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
            </TabPanel>
          </Paper>
        </Box>
      </TabPanel>
      
      {/* Profit Analysis Tab */}
      <TabPanel value={mainTabValue} index={1}>
        <Box sx={{ mb: 2 }}>
          <Paper>
            <Tabs
              value={profitTabValue}
              onChange={handleProfitTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="By Product" />
              <Tab label="By Category" />
              <Tab label="By Seller" />
            </Tabs>
            
            {/* Chart Type Selection */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
              <Button 
                variant={chartType === 'bar' ? 'contained' : 'outlined'} 
                size="small"
                sx={{ mr: 1 }}
                onClick={() => handleChartTypeChange('bar')}
              >
                Bar Chart
              </Button>
              <Button 
                variant={chartType === 'pie' ? 'contained' : 'outlined'} 
                size="small"
                onClick={() => handleChartTypeChange('pie')}
              >
                Pie Chart
              </Button>
            </Box>
            
            {/* By Product Tab */}
            <TabPanel value={profitTabValue} index={0}>
              {getProductProfitChart()}
              
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {profitColumns.map((column) => (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          style={{ minWidth: column.minWidth }}
                        >
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {productProfitData
                      .slice(filters.page * filters.rowsPerPage, filters.page * filters.rowsPerPage + filters.rowsPerPage)
                      .map((row) => (
                        <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                          {profitColumns.map((column) => {
                            const value = row[column.id];
                            return (
                              <TableCell key={column.id} align={column.align}>
                                {column.format && typeof value === 'number' ? column.format(value) : value}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 100]}
                  component="div"
                  count={productProfitData.length}
                  rowsPerPage={filters.rowsPerPage}
                  page={filters.page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
            </TabPanel>
            
            {/* By Category Tab */}
            <TabPanel value={profitTabValue} index={1}>
              {getCategoryProfitChart()}
              
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {profitColumns.map((column) => (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          style={{ minWidth: column.minWidth }}
                        >
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categoryProfitData
                      .slice(filters.page * filters.rowsPerPage, filters.page * filters.rowsPerPage + filters.rowsPerPage)
                      .map((row) => (
                        <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                          {profitColumns.map((column) => {
                            const value = row[column.id];
                            return (
                              <TableCell key={column.id} align={column.align}>
                                {column.format && typeof value === 'number' ? column.format(value) : value}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 100]}
                  component="div"
                  count={categoryProfitData.length}
                  rowsPerPage={filters.rowsPerPage}
                  page={filters.page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
            </TabPanel>
            
            {/* By Seller Tab */}
            <TabPanel value={profitTabValue} index={2}>
              {getSellerProfitChart()}
              
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {profitColumns.map((column) => (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          style={{ minWidth: column.minWidth }}
                        >
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sellerProfitData
                      .slice(filters.page * filters.rowsPerPage, filters.page * filters.rowsPerPage + filters.rowsPerPage)
                      .map((row) => (
                        <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                          {profitColumns.map((column) => {
                            const value = row[column.id];
                            return (
                              <TableCell key={column.id} align={column.align}>
                                {column.format && typeof value === 'number' ? column.format(value) : value}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 100]}
                  component="div"
                  count={sellerProfitData.length}
                  rowsPerPage={filters.rowsPerPage}
                  page={filters.page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
            </TabPanel>
          </Paper>
        </Box>
      </TabPanel>
      
      {/* Dialog for editing product cost */}
      {editingProduct && (
        <Dialog open onClose={handleCancelEdit} maxWidth="sm" fullWidth>
          <DialogTitle>
            Edit Cost Price: {editingProduct.name}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
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
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelEdit} color="inherit">
              Cancel
            </Button>
            <Button 
              onClick={handleCostSubmit}
              color="primary" 
              variant="contained"
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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Loading indicator */}
      {loading && (
        <Box sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 9999
        }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default FinanceAnalytics; 