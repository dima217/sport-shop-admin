import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Button,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../services/api';
import type { Order, OrdersResponse, OrderStatus } from '../../types/orders';
import { format } from 'date-fns';

const statusColors: Record<OrderStatus, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  pending: 'warning',
  processing: 'primary',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
};

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Ожидает',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменен',
};

export const OrdersList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchOrders();
  }, [offset, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: any = {
        limit,
        offset,
      };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await api.get<OrdersResponse>('/orders/admin/all', { params });
      setOrders(response.data.orders);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      enqueueSnackbar('Статус заказа успешно обновлен', { variant: 'success' });
    } catch (error: any) {
      console.error('Error updating order status:', error);
      enqueueSnackbar(error.response?.data?.message || 'Ошибка при обновлении статуса', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Заказы</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Статус</InputLabel>
          <Select
            value={statusFilter}
            label="Статус"
            onChange={(e) => {
              setStatusFilter(e.target.value as OrderStatus | 'all');
              setOffset(0);
            }}
          >
            <MenuItem value="all">Все</MenuItem>
            <MenuItem value="pending">Ожидает</MenuItem>
            <MenuItem value="processing">В обработке</MenuItem>
            <MenuItem value="shipped">Отправлен</MenuItem>
            <MenuItem value="delivered">Доставлен</MenuItem>
            <MenuItem value="cancelled">Отменен</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell>Клиент</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Сумма</TableCell>
              <TableCell>Адрес доставки</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id.slice(0, 8)}...</TableCell>
                <TableCell>
                  {format(new Date(order.createdAt), 'dd.MM.yyyy HH:mm')}
                </TableCell>
                <TableCell>
                  {order.user.profile.firstName} {order.user.profile.lastName}
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    {order.user.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value as OrderStatus)
                      }
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <MenuItem key={value} value={value}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>{order.total.toLocaleString('ru-RU')} ₽</TableCell>
                <TableCell>
                  {order.deliveryCity}, {order.deliveryStreet}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Typography variant="body2">
          Показано {orders.length} из {total}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - limit))}
          >
            Назад
          </Button>
          <Button
            disabled={offset + limit >= total}
            onClick={() => setOffset(offset + limit)}
          >
            Вперед
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

