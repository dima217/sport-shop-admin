import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
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
  TablePagination,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import api from "../../services/api";
import type {
  Ticket,
  TicketsResponse,
  TicketStatus,
  TicketsFilters,
} from "../../types/support";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const statusColors: Record<
  TicketStatus,
  "default" | "primary" | "success" | "warning" | "error"
> = {
  open: "warning",
  in_progress: "primary",
  resolved: "success",
  closed: "error",
};

const statusLabels: Record<TicketStatus, string> = {
  open: "Открыт",
  in_progress: "В работе",
  resolved: "Решен",
  closed: "Закрыт",
};

export const TicketsList = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt" | "status">(
    "createdAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params: TicketsFilters = {
        limit,
        offset,
        sortBy,
        sortOrder,
      };
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await api.get<TicketsResponse>(
        "/support/admin/tickets",
        { params }
      );
      setTickets(response.data.tickets);
      setTotal(response.data.total);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (axiosError.response?.status === 403) {
        enqueueSnackbar("Недостаточно прав для просмотра тикетов", {
          variant: "error",
        });
      } else {
        enqueueSnackbar("Ошибка при загрузке тикетов", { variant: "error" });
      }
    } finally {
      setLoading(false);
    }
  }, [limit, offset, statusFilter, sortBy, sortOrder, enqueueSnackbar]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handlePageChange = (_event: unknown, newPage: number) => {
    setOffset(newPage * limit);
  };

  const handleStatusFilterChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setStatusFilter(event.target.value as TicketStatus | "all");
    setOffset(0);
  };

  const handleSortByChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSortBy(event.target.value as "createdAt" | "updatedAt" | "status");
    setOffset(0);
  };

  const handleSortOrderChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSortOrder(event.target.value as "asc" | "desc");
    setOffset(0);
  };

  if (loading && tickets.length === 0) {
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

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Тикеты поддержки</Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Статус</InputLabel>
          <Select
            value={statusFilter}
            label="Статус"
            onChange={handleStatusFilterChange}
          >
            <MenuItem value="all">Все</MenuItem>
            <MenuItem value="open">Открыт</MenuItem>
            <MenuItem value="in_progress">В работе</MenuItem>
            <MenuItem value="resolved">Решен</MenuItem>
            <MenuItem value="closed">Закрыт</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Сортировка</InputLabel>
          <Select value={sortBy} label="Сортировка" onChange={handleSortByChange}>
            <MenuItem value="createdAt">Дата создания</MenuItem>
            <MenuItem value="updatedAt">Дата обновления</MenuItem>
            <MenuItem value="status">Статус</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Порядок</InputLabel>
          <Select
            value={sortOrder}
            label="Порядок"
            onChange={handleSortOrderChange}
          >
            <MenuItem value="desc">По убыванию</MenuItem>
            <MenuItem value="asc">По возрастанию</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Пользователь ID</TableCell>
              <TableCell>Тема</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Дата создания</TableCell>
              <TableCell>Дата обновления</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    Тикеты не найдены
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket.id} hover>
                  <TableCell>{ticket.id}</TableCell>
                  <TableCell>{ticket.userId}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 300,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ticket.subject}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusLabels[ticket.status]}
                      color={statusColors[ticket.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(ticket.createdAt), "dd.MM.yyyy HH:mm", {
                      locale: ru,
                    })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(ticket.updatedAt), "dd.MM.yyyy HH:mm", {
                      locale: ru,
                    })}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/admin/support/tickets/${ticket.id}`)}
                      color="primary"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={offset / limit}
        onPageChange={handlePageChange}
        rowsPerPage={limit}
        rowsPerPageOptions={[]}
        labelRowsPerPage=""
      />
    </Box>
  );
};

