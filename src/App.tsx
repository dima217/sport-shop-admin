import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { Layout } from './components/Layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CategoriesList } from './pages/Categories/CategoriesList';
import { CategoryForm } from './pages/Categories/CategoryForm';
import { ProductsList } from './pages/Products/ProductsList';
import { ProductForm } from './pages/Products/ProductForm';
import { ProductDiscount } from './pages/Products/ProductDiscount';
import { OrdersList } from './pages/Orders/OrdersList';
import { OrderDetails } from './pages/Orders/OrderDetails';
import { Statistics } from './pages/Statistics';
import { UsersList } from './pages/Users/UsersList';
import { TicketsList } from './pages/Support/TicketsList';
import { TicketDetails } from './pages/Support/TicketDetails';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const { init } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <BrowserRouter>
          <Routes>
          <Route path="/admin/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Layout>
                  <Navigate to="/admin/dashboard" replace />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute>
                <Layout>
                  <CategoriesList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <CategoryForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories/:id/edit"
            element={
              <ProtectedRoute>
                <Layout>
                  <CategoryForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProductsList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProductForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/:id/edit"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProductForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/:id/discount"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProductDiscount />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute>
                <Layout>
                  <OrdersList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <OrderDetails />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/statistics"
            element={
              <ProtectedRoute>
                <Layout>
                  <Statistics />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <Layout>
                  <UsersList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/support/tickets"
            element={
              <ProtectedRoute>
                <Layout>
                  <TicketsList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/support/tickets/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <TicketDetails />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
