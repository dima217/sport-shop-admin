import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import api from '../../services/api';
import type { Category } from '../../types/categories';

interface CategoryFormData {
  name: string;
  image: string;
  slug: string;
  parentId: string | null;
}

export const CategoryForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const isEdit = !!id;
  const { enqueueSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CategoryFormData>({
    defaultValues: {
      name: '',
      image: '',
      slug: '',
      parentId: null,
    },
  });

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchCategory();
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

  const fetchCategory = async () => {
    if (!id) return;
    try {
      const response = await api.get<Category>(`/categories/${id}`);
      setValue('name', response.data.name);
      setValue('image', response.data.image);
      setValue('slug', response.data.slug);
      setValue('parentId', response.data.parentId);
    } catch (error) {
      console.error('Error fetching category:', error);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const onSubmit = async (data: CategoryFormData) => {
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await api.patch(`/categories/${id}`, data);
        enqueueSnackbar('Категория успешно обновлена', { variant: 'success' });
      } else {
        await api.post('/categories', data);
        enqueueSnackbar('Категория успешно создана', { variant: 'success' });
      }
      navigate('/admin/categories');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ошибка при сохранении категории';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const nameValue = watch('name');
  useEffect(() => {
    if (!isEdit && nameValue) {
      setValue('slug', generateSlug(nameValue));
    }
  }, [nameValue, isEdit]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Редактировать категорию' : 'Создать категорию'}
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Название"
              {...register('name', { required: 'Название обязательно' })}
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
            />

            <TextField
              label="Slug"
              {...register('slug', { required: 'Slug обязателен' })}
              error={!!errors.slug}
              helperText={errors.slug?.message || 'URL-friendly идентификатор (латиница, дефисы)'}
              fullWidth
            />

            <TextField
              label="URL изображения"
              {...register('image', { required: 'Изображение обязательно' })}
              error={!!errors.image}
              helperText={errors.image?.message}
              fullWidth
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Сохранить'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/admin/categories')}
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

