import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUtilizadores from './pages/admin/Utilizadores';
import AdminDocumentos from './pages/admin/Documentos';
import AdminIncidentes from './pages/admin/Incidentes';
import GestorDashboard from './pages/gestor/Dashboard';
import GestorClientes from './pages/gestor/Clientes';
import GestorDocumentos from './pages/gestor/Documentos';
import GestorIncidentes from './pages/gestor/Incidentes';
import EmpresaDashboard from './pages/empresa/Dashboard';
import EmpresaDocumentos from './pages/empresa/Documentos';
import EmpresaIncidentes from './pages/empresa/Incidentes';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/admin" element={<ProtectedRoute perfil="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/utilizadores" element={<ProtectedRoute perfil="admin"><AdminUtilizadores /></ProtectedRoute>} />
          <Route path="/admin/documentos" element={<ProtectedRoute perfil="admin"><AdminDocumentos /></ProtectedRoute>} />
          <Route path="/admin/incidentes" element={<ProtectedRoute perfil="admin"><AdminIncidentes /></ProtectedRoute>} />

          <Route path="/gestor" element={<ProtectedRoute perfil="gestor"><GestorDashboard /></ProtectedRoute>} />
          <Route path="/gestor/clientes" element={<ProtectedRoute perfil="gestor"><GestorClientes /></ProtectedRoute>} />
          <Route path="/gestor/documentos" element={<ProtectedRoute perfil="gestor"><GestorDocumentos /></ProtectedRoute>} />
          <Route path="/gestor/incidentes" element={<ProtectedRoute perfil="gestor"><GestorIncidentes /></ProtectedRoute>} />

          <Route path="/empresa" element={<ProtectedRoute perfil="empresa"><EmpresaDashboard /></ProtectedRoute>} />
          <Route path="/empresa/documentos" element={<ProtectedRoute perfil="empresa"><EmpresaDocumentos /></ProtectedRoute>} />
          <Route path="/empresa/incidentes" element={<ProtectedRoute perfil="empresa"><EmpresaIncidentes /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;