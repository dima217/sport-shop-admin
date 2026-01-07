import { useEffect, useState, useCallback } from "react";
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
  IconButton,
  CircularProgress,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
} from "@mui/material";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonIcon from "@mui/icons-material/Person";
import api from "../../services/api";
import type {
  User,
  UpdateUserDto,
  UsersResponse,
  UserRole,
} from "../../types/users";

export const UsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [sortBy, setSortBy] = useState<"id" | "email">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [userToAction, setUserToAction] = useState<User | null>(null);
  const [banAction, setBanAction] = useState<"ban" | "unban">("ban");
  const [newRole, setNewRole] = useState<UserRole>("user");
  const { enqueueSnackbar } = useSnackbar();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        limit,
        offset,
        sortBy,
        sortOrder,
      };

      const response = await api.get<UsersResponse>("/users", { params });
      setUsers(response.data.users);
      setTotal(response.data.total);
    } catch (error) {
      console.error("Error fetching users:", error);
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      const errorMessage =
        axiosError.response?.status === 403
          ? "Доступ запрещен. Требуются права администратора."
          : axiosError.response?.data?.message ||
            "Ошибка при загрузке пользователей";
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [limit, offset, sortBy, sortOrder, enqueueSnackbar]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleBan = (user: User) => {
    setUserToAction(user);
    setBanAction(user.isBanned ? "unban" : "ban");
    setBanDialogOpen(true);
  };

  const confirmBan = async () => {
    if (!userToAction) return;

    const updateData: UpdateUserDto = {
      isBanned: banAction === "ban",
    };

    try {
      await api.put<User>(`/users/${userToAction.id}`, updateData);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userToAction.id ? { ...u, isBanned: banAction === "ban" } : u
        )
      );

      setBanDialogOpen(false);
      setUserToAction(null);

      const actionText = banAction === "ban" ? "забанен" : "разбанен";
      enqueueSnackbar(`Пользователь успешно ${actionText}`, {
        variant: "success",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const errorMessage =
        axiosError.response?.data?.message ||
        "Ошибка при обновлении пользователя";
      enqueueSnackbar(errorMessage, { variant: "error" });
    }
  };

  const handleDelete = (user: User) => {
    setUserToAction(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToAction) return;

    try {
      await api.delete(`/users/${userToAction.id}`);
      fetchUsers();
      setDeleteDialogOpen(false);
      setUserToAction(null);
      enqueueSnackbar("Пользователь успешно удален", { variant: "success" });
    } catch (error) {
      console.error("Error deleting user:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const errorMessage =
        axiosError.response?.data?.message ||
        "Ошибка при удалении пользователя";
      enqueueSnackbar(errorMessage, { variant: "error" });
    }
  };

  const handleRoleChange = (user: User) => {
    setUserToAction(user);
    setNewRole(user.role === "admin" ? "user" : "admin");
    setRoleDialogOpen(true);
  };

  const confirmRoleChange = async () => {
    if (!userToAction) return;

    const updateData: UpdateUserDto = {
      role: newRole,
    };

    try {
      const response = await api.put<User>(
        `/users/${userToAction.id}`,
        updateData
      );

      setUsers((prev) =>
        prev.map((u) => (u.id === userToAction.id ? response.data : u))
      );

      setRoleDialogOpen(false);
      setUserToAction(null);

      const roleText =
        newRole === "admin" ? "администратором" : "пользователем";
      enqueueSnackbar(`Роль пользователя изменена на ${roleText}`, {
        variant: "success",
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const errorMessage =
        axiosError.response?.data?.message || "Ошибка при изменении роли";
      enqueueSnackbar(errorMessage, { variant: "error" });
    }
  };

  const handlePageChange = (_event: unknown, newPage: number) => {
    setOffset(newPage * limit);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          mt: 10,
        }}
      >
        <Typography variant="h4">Пользователи</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Сортировать по</InputLabel>
            <Select
              value={sortBy}
              label="Сортировать по"
              onChange={(e) => {
                setSortBy(e.target.value as "id" | "email");
                setOffset(0);
              }}
            >
              <MenuItem value="id">ID</MenuItem>
              <MenuItem value="email">Email</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Порядок</InputLabel>
            <Select
              value={sortOrder}
              label="Порядок"
              onChange={(e) => {
                setSortOrder(e.target.value as "asc" | "desc");
                setOffset(0);
              }}
            >
              <MenuItem value="asc">По возрастанию</MenuItem>
              <MenuItem value="desc">По убыванию</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {loading && users.length === 0 ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Имя</TableCell>
                  <TableCell>Фамилия</TableCell>
                  <TableCell>Роль</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>OAuth</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ py: 3 }}
                      >
                        Пользователи не найдены
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.profile?.firstName || "-"}</TableCell>
                      <TableCell>{user.profile?.lastName || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            user.role === "admin" ? "Админ" : "Пользователь"
                          }
                          color={user.role === "admin" ? "primary" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.isBanned ? "Забанен" : "Активен"}
                          color={user.isBanned ? "error" : "success"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{user.isOAuthUser ? "Да" : "Нет"}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => handleRoleChange(user)}
                          color={user.role === "admin" ? "default" : "primary"}
                          size="small"
                          title={
                            user.role === "admin"
                              ? "Сделать пользователем"
                              : "Сделать администратором"
                          }
                        >
                          {user.role === "admin" ? (
                            <PersonIcon />
                          ) : (
                            <AdminPanelSettingsIcon />
                          )}
                        </IconButton>
                        <IconButton
                          onClick={() => handleBan(user)}
                          color={user.isBanned ? "success" : "error"}
                          size="small"
                          title={user.isBanned ? "Разбанить" : "Забанить"}
                        >
                          {user.isBanned ? <CheckCircleIcon /> : <BlockIcon />}
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(user)}
                          color="error"
                          size="small"
                          title="Удалить"
                        >
                          <DeleteIcon />
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
            page={Math.floor(offset / limit)}
            onPageChange={handlePageChange}
            rowsPerPage={limit}
            rowsPerPageOptions={[20]}
            labelRowsPerPage="Строк на странице:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} из ${count !== -1 ? count : `более чем ${to}`}`
            }
          />
        </>
      )}

      {/* Диалог бана/разбана */}
      <Dialog open={banDialogOpen} onClose={() => setBanDialogOpen(false)}>
        <DialogTitle>
          {banAction === "ban"
            ? "Забанить пользователя"
            : "Разбанить пользователя"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {banAction === "ban"
              ? `Вы уверены, что хотите забанить пользователя ${userToAction?.email}?`
              : `Вы уверены, что хотите разбанить пользователя ${userToAction?.email}?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBanDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={confirmBan}
            color={banAction === "ban" ? "error" : "success"}
            variant="contained"
          >
            {banAction === "ban" ? "Забанить" : "Разбанить"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Удалить пользователя</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить пользователя {userToAction?.email}?
            Это действие нельзя отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог изменения роли */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)}>
        <DialogTitle>Изменить роль пользователя</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Изменить роль пользователя {userToAction?.email}?
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel>Новая роль</InputLabel>
            <Select
              value={newRole}
              label="Новая роль"
              onChange={(e) => setNewRole(e.target.value as UserRole)}
            >
              <MenuItem value="user">Пользователь</MenuItem>
              <MenuItem value="admin">Администратор</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={confirmRoleChange}
            color="primary"
            variant="contained"
          >
            Изменить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
