import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import {
  Box,
  Button,
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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DiscountIcon from "@mui/icons-material/Discount";
import api from "../../services/api";
import type { Product, ProductsResponse } from "../../types/products";

export const ProductsList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchProducts();
  }, [offset, search, statusFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = {
        limit,
        offset,
      };
      if (search) params.search = search;
      if (statusFilter !== "all") {
        params.inStock = statusFilter === "inStock";
      }

      const response = await api.get<ProductsResponse>("/products", { params });
      setProducts(response.data.products);
      setTotal(response.data.total);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await api.delete(`/products/${productToDelete.id}`);
      fetchProducts();
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      enqueueSnackbar("Товар успешно удален", { variant: "success" });
    } catch (error) {
      console.error("Error deleting product:", error);
      const message =
        error instanceof Error ? error.message : "Ошибка при удалении товара";
      enqueueSnackbar(message, { variant: "error" });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setOffset(0);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          mt: 10,
        }}
      >
        <Typography variant="h4">Товары</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/admin/products/create")}
        >
          Создать товар
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          label="Поиск товаров"
          value={search}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Статус</InputLabel>
          <Select
            value={statusFilter}
            label="Статус"
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setOffset(0);
            }}
          >
            <MenuItem value="all">Все</MenuItem>
            <MenuItem value="inStock">В наличии</MenuItem>
            <MenuItem value="outOfStock">Нет в наличии</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
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
                  <TableCell>Изображение</TableCell>
                  <TableCell>Название</TableCell>
                  <TableCell>Категория</TableCell>
                  <TableCell>Цена</TableCell>
                  <TableCell>Остаток</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.images[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          style={{ width: 50, height: 50, objectFit: "cover" }}
                        />
                      )}
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category?.name || "-"}</TableCell>
                    <TableCell>
                      <Box>
                        {product.oldPrice && (
                          <Typography
                            variant="body2"
                            sx={{
                              textDecoration: "line-through",
                              color: "text.secondary",
                            }}
                          >
                            {product.oldPrice.toLocaleString("ru-RU")} ₽
                          </Typography>
                        )}
                        <Typography variant="body1" fontWeight="bold">
                          {product.price.toLocaleString("ru-RU")} ₽
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{product.stockQuantity}</TableCell>
                    <TableCell>
                      <Chip
                        label={product.inStock ? "В наличии" : "Нет в наличии"}
                        color={product.inStock ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigate(`/admin/products/${product.id}/edit`)
                        }
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigate(`/admin/products/${product.id}/discount`)
                        }
                        title="Установить скидку"
                      >
                        <DiscountIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setProductToDelete(product);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 2,
            }}
          >
            <Typography variant="body2">
              Показано {products.length} из {total}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
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
        </>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Удалить товар?</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить товар "{productToDelete?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
