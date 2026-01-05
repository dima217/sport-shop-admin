import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Chip,
} from '@mui/material';
import api from '../../services/api';
import type { Product } from '../../types/products';
import type { Category } from '../../types/categories';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  images: string[];
  categoryId: string;
  inStock: boolean;
  stockQuantity: number;
  sizes: string[] | string;
  colors: string[] | string;
  brand: string;
  sku: string;
}

export const ProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const isEdit = !!id;
  const { enqueueSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      oldPrice: undefined,
      images: [],
      categoryId: '',
      inStock: true,
      stockQuantity: 0,
      sizes: [],
      colors: [],
      brand: '',
      sku: '',
    },
  });

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await api.get<Category[]>('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async () => {
    if (!id) return;
    try {
      const response = await api.get<Product>(`/products/${id}`);
      const product = response.data;
      setValue('name', product.name);
      setValue('description', product.description);
      setValue('price', product.price);
      setValue('oldPrice', product.oldPrice || undefined);
      setValue('categoryId', product.categoryId);
      setValue('inStock', product.inStock);
      setValue('stockQuantity', product.stockQuantity);
      const sizesValue = product.sizes 
        ? (Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes)
        : '';
      const colorsValue = product.colors
        ? (Array.isArray(product.colors) ? product.colors.join(', ') : product.colors)
        : '';
      setValue('sizes', sizesValue);
      setValue('colors', colorsValue);
      setValue('brand', product.brand || '');
      setValue('sku', product.sku);
      setImageUrls(product.images.length > 0 ? product.images : ['']);
      setValue('images', product.images);
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
    setValue('images', newUrls.filter((url) => url.trim() !== ''));
  };

  const addImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const removeImageUrl = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
    setValue('images', newUrls.filter((url) => url.trim() !== ''));
  };

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    setError('');

    const images = imageUrls.filter((url) => url.trim() !== '');
    if (images.length === 0) {
      setError('Необходимо добавить хотя бы одно изображение');
      setLoading(false);
      return;
    }

    try {
      // Преобразуем строки sizes и colors в массивы
      const sizesArray = typeof data.sizes === 'string' 
        ? data.sizes.split(',').map(s => s.trim()).filter(s => s !== '')
        : data.sizes || [];
      
      const colorsArray = typeof data.colors === 'string'
        ? data.colors.split(',').map(c => c.trim()).filter(c => c !== '')
        : data.colors || [];

      const payload = {
        ...data,
        images,
        sizes: sizesArray.length > 0 ? sizesArray : null,
        colors: colorsArray.length > 0 ? colorsArray : null,
        oldPrice: data.oldPrice || undefined,
      };

      if (isEdit) {
        await api.patch(`/products/${id}`, payload);
        enqueueSnackbar('Товар успешно обновлен', { variant: 'success' });
      } else {
        await api.post('/products', payload);
        enqueueSnackbar('Товар успешно создан', { variant: 'success' });
      }
      navigate('/admin/products');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ошибка при сохранении товара';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Редактировать товар' : 'Создать товар'}
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <Typography variant="h6">Основная информация</Typography>
            <TextField
              label="Название"
              {...register('name', { required: 'Название обязательно' })}
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
            />

            <TextField
              label="Описание"
              {...register('description', { required: 'Описание обязательно' })}
              error={!!errors.description}
              helperText={errors.description?.message}
              fullWidth
              multiline
              rows={4}
            />

            <FormControl fullWidth error={!!errors.categoryId}>
              <InputLabel>Категория</InputLabel>
              <Controller
                name="categoryId"
                control={control}
                rules={{ required: 'Категория обязательна' }}
                render={({ field }) => (
                  <Select {...field} label="Категория">
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.categoryId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {errors.categoryId.message}
                </Typography>
              )}
            </FormControl>

            <TextField
              label="SKU (Артикул)"
              {...register('sku', { required: 'SKU обязателен' })}
              error={!!errors.sku}
              helperText={errors.sku?.message}
              fullWidth
            />

            <Typography variant="h6">Цены</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Цена (₽)"
                type="number"
                {...register('price', {
                  required: 'Цена обязательна',
                  min: { value: 0, message: 'Цена должна быть положительной' },
                  valueAsNumber: true,
                })}
                error={!!errors.price}
                helperText={errors.price?.message}
                fullWidth
              />
              <TextField
                label="Старая цена (₽)"
                type="number"
                {...register('oldPrice', {
                  min: { value: 0, message: 'Цена должна быть положительной' },
                  valueAsNumber: true,
                })}
                error={!!errors.oldPrice}
                helperText={errors.oldPrice?.message || 'Для скидок'}
                fullWidth
              />
            </Box>

            <Typography variant="h6">Изображения</Typography>
            {imageUrls.map((url, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <TextField
                  label={`Изображение ${index + 1}`}
                  value={url}
                  onChange={(e) => handleImageUrlChange(index, e.target.value)}
                  fullWidth
                />
                {imageUrls.length > 1 && (
                  <Button onClick={() => removeImageUrl(index)} color="error">
                    Удалить
                  </Button>
                )}
              </Box>
            ))}
            <Button onClick={addImageUrl} variant="outlined">
              Добавить изображение
            </Button>

            <Typography variant="h6">Характеристики</Typography>
            <TextField
              label="Бренд"
              {...register('brand')}
              fullWidth
            />

            <TextField
              label="Размеры (через запятую)"
              {...register('sizes')}
              helperText="Например: S, M, L, XL"
              fullWidth
            />

            <TextField
              label="Цвета (через запятую)"
              {...register('colors')}
              helperText="Например: Черный, Белый, Красный"
              fullWidth
            />

            <Typography variant="h6">Склад</Typography>
            <FormControlLabel
              control={
                <Controller
                  name="inStock"
                  control={control}
                  render={({ field }) => (
                    <Checkbox {...field} checked={field.value} />
                  )}
                />
              }
              label="В наличии"
            />

            <TextField
              label="Количество на складе"
              type="number"
              {...register('stockQuantity', {
                min: { value: 0, message: 'Количество должно быть неотрицательным' },
                valueAsNumber: true,
              })}
              error={!!errors.stockQuantity}
              helperText={errors.stockQuantity?.message}
              fullWidth
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                size="large"
              >
                {loading ? <CircularProgress size={24} /> : 'Сохранить'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/admin/products')}
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

