import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
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
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../../services/api';
import type { Order, OrderStatus } from '../../types/orders';
import { format } from 'date-fns';

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Ожидает',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменен',
};

export const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await api.get<Order>(`/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!id || !order) return;
    try {
      await api.patch(`/orders/${id}/status`, { status: newStatus });
      setOrder({ ...order, status: newStatus });
      enqueueSnackbar('Статус заказа успешно обновлен', { variant: 'success' });
    } catch (error) {
      console.error('Error updating order status:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при обновлении статуса';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return <Typography>Заказ не найден</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/orders')}>
          Назад к заказам
        </Button>
        <Typography variant="h4">Детали заказа</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Товары в заказе
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Изображение</TableCell>
                    <TableCell>Товар</TableCell>
                    <TableCell>Размер</TableCell>
                    <TableCell>Цвет</TableCell>
                    <TableCell>Количество</TableCell>
                    <TableCell align="right">Цена</TableCell>
                    <TableCell align="right">Сумма</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.product?.images?.[0] && (
                          <img
                            src={item.product.images[0]}
                            alt={item.product?.name || 'Товар'}
                            style={{ width: 50, height: 50, objectFit: 'cover' }}
                          />
                        )}
                      </TableCell>
                      <TableCell>{item.product?.name || 'Неизвестный товар'}</TableCell>
                      <TableCell>{item.size || '-'}</TableCell>
                      <TableCell>{item.color || '-'}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell align="right">
                        {item.price.toLocaleString('ru-RU')} ₽
                      </TableCell>
                      <TableCell align="right">
                        {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Typography variant="h6">
                Итого: {order.total.toLocaleString('ru-RU')} ₽
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Информация о заказе
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  ID заказа
                </Typography>
                <Typography>{order.id}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Дата создания
                </Typography>
                <Typography>
                  {format(new Date(order.createdAt), 'dd.MM.yyyy HH:mm')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Статус
                </Typography>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <Select
                    value={order.status}
                    onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Клиент
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography>
                {order.user?.profile?.firstName || ''} {order.user?.profile?.lastName || ''}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {order.user?.email || 'Не указан'}
              </Typography>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Доставка
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography>
                {order.deliveryCountry}, {order.deliveryCity}
              </Typography>
              <Typography>{order.deliveryStreet}</Typography>
              <Typography>Индекс: {order.deliveryPostalCode}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Способ оплаты: {order.paymentMethod}
              </Typography>
              {order.comment && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Комментарий:
                  </Typography>
                  <Typography variant="body2">{order.comment}</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

