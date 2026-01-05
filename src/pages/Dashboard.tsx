import { useEffect, useState } from "react";
import { Paper, Typography, Box, CircularProgress } from "@mui/material";
import api from "../services/api";
import type { Statistics } from "../types/statistics";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export const Dashboard = () => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await api.get<Statistics>("/admin/statistics");
      setStatistics(response.data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      // Если эндпоинт не найден, возможно он называется по-другому
      // Попробуем альтернативный путь
      try {
        const altResponse = await api.get<Statistics>("/statistics");
        setStatistics(altResponse.data);
      } catch (altError) {
        console.error("Alternative endpoint also failed:", altError);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!statistics) {
    return <Typography>Не удалось загрузить статистику</Typography>;
  }

  const orderStatusData = [
    { name: "Ожидает", value: statistics.orders.pending },
    { name: "В обработке", value: statistics.orders.processing },
    { name: "Отправлен", value: statistics.orders.shipped },
    { name: "Доставлен", value: statistics.orders.delivered },
    { name: "Отменен", value: statistics.orders.cancelled },
  ];

  const revenueData = [
    { name: "Сегодня", value: statistics.revenue.today },
    { name: "Неделя", value: statistics.revenue.week },
    { name: "Месяц", value: statistics.revenue.month },
    { name: "Всего", value: statistics.revenue.total },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 3,
          mb: 3,
        }}
      >
        <Paper sx={{ p: 2 }}>
          <Typography color="textSecondary" gutterBottom>
            Всего заказов
          </Typography>
          <Typography variant="h4">{statistics.orders.total}</Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography color="textSecondary" gutterBottom>
            Товаров в наличии
          </Typography>
          <Typography variant="h4">{statistics.products.inStock}</Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography color="textSecondary" gutterBottom>
            Выручка (месяц)
          </Typography>
          <Typography variant="h4">
            {statistics.revenue.month.toLocaleString("ru-RU")} ₽
          </Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography color="textSecondary" gutterBottom>
            Категорий
          </Typography>
          <Typography variant="h4">{statistics.categories.total}</Typography>
        </Paper>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, 1fr)",
          },
          gap: 3,
        }}
      >
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Распределение заказов по статусам
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {orderStatusData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Выручка по периодам
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: number | undefined) =>
                  value ? `${value.toLocaleString("ru-RU")} ₽` : ""
                }
              />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>
    </Box>
  );
};
