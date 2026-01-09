import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import api from "../../services/api";
import type { Ticket, TicketStatus, ReplyTicketDto, UpdateTicketStatusDto } from "../../types/support";
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

export const TicketDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [status, setStatus] = useState<TicketStatus>("open");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await api.get<Ticket>(`/support/admin/tickets/${id}`);
      setTicket(response.data);
      setStatus(response.data.status);
      if (response.data.adminResponse) {
        setReplyText(response.data.adminResponse);
      }
    } catch (error) {
      console.error("Error fetching ticket:", error);
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (axiosError.response?.status === 404) {
        enqueueSnackbar("Тикет не найден", { variant: "error" });
        navigate("/admin/support/tickets");
      } else if (axiosError.response?.status === 403) {
        enqueueSnackbar("Недостаточно прав", { variant: "error" });
        navigate("/admin/support/tickets");
      } else {
        enqueueSnackbar("Ошибка при загрузке тикета", { variant: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!id || !replyText.trim()) {
      enqueueSnackbar("Введите ответ", { variant: "warning" });
      return;
    }

    if (replyText.length < 10) {
      enqueueSnackbar("Ответ должен содержать минимум 10 символов", {
        variant: "warning",
      });
      return;
    }

    if (replyText.length > 5000) {
      enqueueSnackbar("Ответ не должен превышать 5000 символов", {
        variant: "warning",
      });
      return;
    }

    setSubmitting(true);
    try {
      const replyData: ReplyTicketDto = { response: replyText };
      await api.patch<Ticket>(`/support/admin/tickets/${id}/reply`, replyData);
      enqueueSnackbar("Ответ успешно отправлен", { variant: "success" });
      fetchTicket();
    } catch (error) {
      console.error("Error replying to ticket:", error);
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (axiosError.response?.status === 400) {
        enqueueSnackbar(
          axiosError.response?.data?.message || "Нельзя ответить на закрытый тикет",
          { variant: "error" }
        );
      } else {
        enqueueSnackbar("Ошибка при отправке ответа", { variant: "error" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!id) return;
    setSubmitting(true);
    try {
      const statusData: UpdateTicketStatusDto = { status: newStatus };
      await api.patch<Ticket>(`/support/admin/tickets/${id}/status`, statusData);
      setStatus(newStatus);
      enqueueSnackbar("Статус тикета успешно обновлен", { variant: "success" });
      fetchTicket();
    } catch (error) {
      console.error("Error updating ticket status:", error);
      enqueueSnackbar("Ошибка при обновлении статуса", { variant: "error" });
    } finally {
      setSubmitting(false);
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

  if (!ticket) {
    return (
      <Box>
        <Alert severity="error">Тикет не найден</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin/support/tickets")}
          sx={{ mt: 2 }}
        >
          Вернуться к списку
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/admin/support/tickets")}
        sx={{ mb: 3 }}
      >
        Вернуться к списку
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h5">Тикет #{ticket.id}</Typography>
          <Chip
            label={statusLabels[ticket.status]}
            color={statusColors[ticket.status]}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Пользователь ID: {ticket.userId}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Создан:{" "}
            {format(new Date(ticket.createdAt), "dd.MM.yyyy HH:mm", {
              locale: ru,
            })}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Обновлен:{" "}
            {format(new Date(ticket.updatedAt), "dd.MM.yyyy HH:mm", {
              locale: ru,
            })}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Тема
          </Typography>
          <Typography variant="body1">{ticket.subject}</Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Сообщение пользователя
          </Typography>
          <Paper
            variant="outlined"
            sx={{ p: 2, bgcolor: "grey.50", whiteSpace: "pre-wrap" }}
          >
            <Typography variant="body1">{ticket.message}</Typography>
          </Paper>
        </Box>

        {ticket.adminResponse && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ответ администратора
            </Typography>
            <Paper
              variant="outlined"
              sx={{ p: 2, bgcolor: "primary.50", whiteSpace: "pre-wrap" }}
            >
              <Typography variant="body1">{ticket.adminResponse}</Typography>
            </Paper>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Управление тикетом
        </Typography>

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={status}
              label="Статус"
              onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
              disabled={submitting}
            >
              <MenuItem value="open">Открыт</MenuItem>
              <MenuItem value="in_progress">В работе</MenuItem>
              <MenuItem value="resolved">Решен</MenuItem>
              <MenuItem value="closed">Закрыт</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Ответить на тикет
        </Typography>

        {ticket.status === "closed" && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Нельзя ответить на закрытый тикет
          </Alert>
        )}

        <TextField
          fullWidth
          multiline
          rows={6}
          label="Ответ"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          disabled={submitting || ticket.status === "closed"}
          helperText={`${replyText.length}/5000 символов`}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          onClick={handleReply}
          disabled={submitting || ticket.status === "closed" || !replyText.trim()}
        >
          {ticket.adminResponse ? "Обновить ответ" : "Отправить ответ"}
        </Button>
      </Paper>
    </Box>
  );
};

