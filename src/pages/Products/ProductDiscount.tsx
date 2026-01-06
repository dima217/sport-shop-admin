/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import api from "../../services/api";
import type { Product } from "../../types/products";

interface DiscountFormData {
  discountPercent: number;
  oldPrice?: number;
}

export const ProductDiscount = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<DiscountFormData>({
    defaultValues: {
      discountPercent: 0,
      oldPrice: undefined,
    },
  });

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get<Product>(`/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const discountPercent = watch("discountPercent");
  const oldPrice = watch("oldPrice");
  const currentPrice = product?.price || 0;
  const calculatedOldPrice = oldPrice || currentPrice;
  const newPrice = calculatedOldPrice * (1 - (discountPercent || 0) / 100);

  const onSubmit = async (data: DiscountFormData) => {
    if (!id) return;
    setLoading(true);
    setError("");

    try {
      await api.patch(`/products/${id}/discount`, {
        discountPercent: data.discountPercent,
        oldPrice: data.oldPrice,
      });
      enqueueSnackbar("Скидка успешно установлена", { variant: "success" });
      navigate("/admin/products");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Ошибка при установке скидки";
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDiscount = async () => {
    if (!id) return;
    setRemoveLoading(true);
    try {
      await api.patch(`/products/${id}/discount/remove`);
      enqueueSnackbar("Скидка успешно удалена", { variant: "success" });
      navigate("/admin/products");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Ошибка при удалении скидки";
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setRemoveLoading(false);
    }
  };

  if (!product) {
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
      <Typography variant="h4" gutterBottom>
        Установить скидку на товар
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">{product.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            Текущая цена: {product.price.toLocaleString("ru-RU")} ₽
          </Typography>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Процент скидки"
              type="number"
              {...register("discountPercent", {
                required: "Процент скидки обязателен",
                min: { value: 0, message: "Процент должен быть от 0 до 100" },
                max: { value: 100, message: "Процент должен быть от 0 до 100" },
                valueAsNumber: true,
              })}
              error={!!errors.discountPercent}
              helperText={errors.discountPercent?.message}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              label="Старая цена (опционально)"
              type="number"
              {...register("oldPrice", {
                min: { value: 0, message: "Цена должна быть положительной" },
                valueAsNumber: true,
              })}
              error={!!errors.oldPrice}
              helperText={
                errors.oldPrice?.message ||
                "Если не указана, будет использована текущая цена"
              }
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />

            {discountPercent > 0 && (
              <Alert severity="info">
                <Typography variant="body2">
                  Старая цена: {calculatedOldPrice.toLocaleString("ru-RU")} ₽
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  Новая цена: {Math.round(newPrice).toLocaleString("ru-RU")} ₽
                </Typography>
                <Typography variant="body2">
                  Скидка: {discountPercent}% (
                  {Math.round(calculatedOldPrice - newPrice).toLocaleString(
                    "ru-RU"
                  )}{" "}
                  ₽)
                </Typography>
              </Alert>
            )}

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                size="large"
              >
                {loading ? <CircularProgress size={24} /> : "Установить скидку"}
              </Button>
              {product.oldPrice && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleRemoveDiscount}
                  disabled={removeLoading}
                  size="large"
                >
                  {removeLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Удалить скидку"
                  )}
                </Button>
              )}
              <Button
                variant="outlined"
                onClick={() => navigate("/admin/products")}
                size="large"
              >
                Отмена
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};
