import { useEffect, useState } from "react";
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
  Chip,
} from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";
import api from "../../services/api";

interface BannerFormData {
  title: string;
  subtitle: string;
  originalLang: string;
}

interface BannerResponse {
  title: string;
  subtitle: string;
  lang: string;
  updatedAt: string;
}

export const BannerPage = () => {
  const [fetchLoading, setFetchLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BannerFormData>({
    defaultValues: { title: "", subtitle: "", originalLang: "ru" },
  });

  useEffect(() => {
    const fetchBanner = async () => {
      setFetchLoading(true);
      setFetchError("");
      try {
        const { data } = await api.get<BannerResponse>("/banner");
        reset({
          title: data.title,
          subtitle: data.subtitle,
          originalLang: data.lang ?? "ru",
        });
        setLastUpdated(data.updatedAt);
      } catch (err) {
        const status = (err as { response?: { status?: number } }).response
          ?.status;
        if (status !== 404) {
          setFetchError("Не удалось загрузить баннер");
        }
      } finally {
        setFetchLoading(false);
      }
    };

    void fetchBanner();
  }, [reset]);

  const onSubmit = async (values: BannerFormData) => {
    setSaving(true);
    setSaveError("");
    try {
      const { data } = await api.put<BannerResponse>("/admin/banner", values);
      setLastUpdated(data.updatedAt);
      reset({ title: data.title, subtitle: data.subtitle, originalLang: data.lang ?? "ru" });
      enqueueSnackbar("Баннер успешно сохранён", { variant: "success" });
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? "Ошибка при сохранении баннера";
      setSaveError(message);
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <CampaignIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h4">Рекламный баннер</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Глобальный баннер отображается в мобильном приложении. Текст будет
        автоматически переведён на язык устройства пользователя.
      </Typography>

      {fetchLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 3, maxWidth: 680 }}>
          {fetchError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {fetchError}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {saveError && <Alert severity="error">{saveError}</Alert>}

              <TextField
                label="Заголовок"
                {...register("title", {
                  required: "Заголовок обязателен",
                  maxLength: { value: 512, message: "Максимум 512 символов" },
                })}
                error={!!errors.title}
                helperText={errors.title?.message ?? "Макс. 512 символов"}
                fullWidth
                InputLabelProps={{ shrink: true }}
                placeholder="Летняя распродажа"
              />

              <TextField
                label="Подзаголовок"
                {...register("subtitle", {
                  required: "Подзаголовок обязателен",
                  maxLength: { value: 1024, message: "Максимум 1024 символа" },
                })}
                error={!!errors.subtitle}
                helperText={errors.subtitle?.message ?? "Макс. 1024 символа"}
                fullWidth
                multiline
                rows={3}
                InputLabelProps={{ shrink: true }}
                placeholder="Скидки до 50% на все товары"
              />

              <TextField
                label="Язык оригинала"
                {...register("originalLang", {
                  required: "Укажите язык",
                  minLength: { value: 2, message: "Минимум 2 символа" },
                  maxLength: { value: 10, message: "Максимум 10 символов" },
                })}
                error={!!errors.originalLang}
                helperText={
                  errors.originalLang?.message ??
                  "BCP-47 код языка текста выше (ru, en, de…)"
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
                placeholder="ru"
                sx={{ maxWidth: 200 }}
              />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mt: 1,
                  flexWrap: "wrap",
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={18} color="inherit" /> : undefined}
                >
                  {saving ? "Сохранение…" : "Сохранить баннер"}
                </Button>

                {lastUpdated && (
                  <Chip
                    label={`Обновлён: ${new Date(lastUpdated).toLocaleString("ru-RU")}`}
                    size="small"
                    variant="outlined"
                    color="default"
                  />
                )}
              </Box>
            </Box>
          </form>
        </Paper>
      )}
    </Box>
  );
};
