import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import api from '../services/api';
import type { ProductStatistics } from '../types/statistics';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const Statistics = () => {
  const [statistics, setStatistics] = useState<ProductStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchStatistics();
  }, [period]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const response = await api.get<ProductStatistics>('/admin/statistics/products', {
        params: { period },
      });
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!statistics) {
    return <Typography>Не удалось загрузить статистику</Typography>;
  }

  const topProductsData = statistics.topProducts.map((product) => ({
    name: product.productName,
    продажи: product.salesCount,
    выручка: product.revenue,
  }));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Статистика по товарам</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Период</InputLabel>
          <Select value={period} label="Период" onChange={(e) => setPeriod(e.target.value as any)}>
            <MenuItem value="day">День</MenuItem>
            <MenuItem value="week">Неделя</MenuItem>
            <MenuItem value="month">Месяц</MenuItem>
            <MenuItem value="year">Год</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Топ продаваемых товаров
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topProductsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="продажи" fill="#8884d8" name="Количество продаж" />
                <Bar
                  yAxisId="right"
                  dataKey="выручка"
                  fill="#82ca9d"
                  name="Выручка (₽)"
                  formatter={(value: number) => `${value.toLocaleString('ru-RU')} ₽`}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Товары с низким остатком
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Товар</TableCell>
                    <TableCell align="right">Остаток</TableCell>
                    <TableCell align="center">Статус</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {statistics.lowStock.map((product) => (
                    <TableRow key={product.productId}>
                      <TableCell>{product.productName}</TableCell>
                      <TableCell align="right">{product.stockQuantity}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={product.inStock ? 'В наличии' : 'Нет в наличии'}
                          color={product.inStock ? 'warning' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Товары отсутствуют в наличии
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Товар</TableCell>
                    <TableCell align="right">Остаток</TableCell>
                    <TableCell align="center">Статус</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {statistics.outOfStock.map((product) => (
                    <TableRow key={product.productId}>
                      <TableCell>{product.productName}</TableCell>
                      <TableCell align="right">{product.stockQuantity}</TableCell>
                      <TableCell align="center">
                        <Chip label="Нет в наличии" color="error" size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

