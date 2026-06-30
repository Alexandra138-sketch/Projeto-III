import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/auth/Login';
import Inicio from './pages/public/Inicio';
import Servicos from './pages/public/Servicos';
import Noticias from './pages/public/Noticias';
import NoticiaDetalhe from './pages/public/NoticiaDetalhe';
import Contacto from './pages/public/Contacto';
import AdminDashboard from './pages/admin/Dashboard';
import AdminAnalises from './pages/admin/Analises';
import AdminUtilizadores from './pages/admin/Utilizadores';
import AdminClientes from './pages/admin/Clientes';
import AdminDocumentos from './pages/admin/Documentos';
import AdminIncidentes from './pages/admin/Incidentes';
import AdminLogs from './pages/admin/Logs';
import AdminConteudo from './pages/admin/Conteudo';
import GestorDashboard from './pages/gestor/Dashboard';
import GestorClientes from './pages/gestor/Clientes';
import GestorClientePerfil from './pages/gestor/ClientePerfil';
import GestorDocumentos from './pages/gestor/Documentos';
import GestorIncidentes from './pages/gestor/Incidentes';
import GestorAnalises from './pages/gestor/Analises';
import EmpresaDashboard from './pages/empresa/Dashboard';
import EmpresaDocumentos from './pages/empresa/Documentos';
import EmpresaIncidentes from './pages/empresa/Incidentes';
import EmpresaAnalises from './pages/empresa/Analises';
import EmpresaAmbiente from './pages/empresa/Ambiente';
import ClientePerfil from './pages/admin/ClientePerfil';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/servicos" element={<Servicos />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/noticias/:articleId" element={<NoticiaDetalhe />} />
          <Route path="/contacto" element={<Contacto />} />

          <Route path="/admin" element={<ProtectedRoute perfil="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/analises" element={<ProtectedRoute perfil="admin"><AdminAnalises /></ProtectedRoute>} />
          <Route path="/admin/utilizadores" element={<ProtectedRoute perfil="admin"><AdminUtilizadores /></ProtectedRoute>} />
          <Route path="/admin/clientes" element={<ProtectedRoute perfil="admin"><AdminClientes /></ProtectedRoute>} />
          <Route path="/admin/documentos" element={<ProtectedRoute perfil="admin"><AdminDocumentos /></ProtectedRoute>} />
          <Route path="/admin/incidentes" element={<ProtectedRoute perfil="admin"><AdminIncidentes /></ProtectedRoute>} />
          <Route path="/admin/logs" element={<ProtectedRoute perfil="admin"><AdminLogs /></ProtectedRoute>} />
          <Route path="/admin/conteudo" element={<ProtectedRoute perfil="admin"><AdminConteudo /></ProtectedRoute>} />
          <Route path="/admin/clientes/:clienteId" element={<ClientePerfil />} />

          
          <Route path="/gestor" element={<ProtectedRoute perfil="gestor"><GestorDashboard /></ProtectedRoute>} />
          <Route path="/gestor/clientes" element={<ProtectedRoute perfil="gestor"><GestorClientes /></ProtectedRoute>} />
          <Route path="/gestor/clientes/:clienteId" element={<ProtectedRoute perfil="gestor"><GestorClientePerfil /></ProtectedRoute>} />
          <Route path="/gestor/documentos" element={<ProtectedRoute perfil="gestor"><GestorDocumentos /></ProtectedRoute>} />
          <Route path="/gestor/incidentes" element={<ProtectedRoute perfil="gestor"><GestorIncidentes /></ProtectedRoute>} />
          <Route path="/gestor/analises" element={<ProtectedRoute perfil="gestor"><GestorAnalises /></ProtectedRoute>} />

          <Route path="/empresa" element={<ProtectedRoute perfil="empresa"><EmpresaDashboard /></ProtectedRoute>} />
          <Route path="/empresa/documentos" element={<ProtectedRoute perfil="empresa"><EmpresaDocumentos /></ProtectedRoute>} />
          <Route path="/empresa/incidentes" element={<ProtectedRoute perfil="empresa"><EmpresaIncidentes /></ProtectedRoute>} />
          <Route path="/empresa/analises" element={<ProtectedRoute perfil="empresa"><EmpresaAnalises /></ProtectedRoute>} />
          <Route path="/empresa/ambiente" element={<ProtectedRoute perfil="empresa"><EmpresaAmbiente /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
