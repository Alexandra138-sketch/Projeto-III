import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Bell, LogOut, User } from 'lucide-react';
import ModalPerfil from './ModalPerfil';
import './layout.css';

const PAGE_TITLES = {
  '/admin': 'Dashboard',
  '/admin/analises': 'Análises & Gráficos',
  '/admin/utilizadores': 'Utilizadores',
  '/admin/clientes': 'Clientes',
  '/admin/documentos': 'Documentos',
  '/admin/incidentes': 'Incidentes',
  '/admin/logs': 'Logs de Atividade',
  '/admin/conteudo': 'Conteúdo do Site',
  '/gestor': 'Dashboard',
  '/gestor/clientes': 'Clientes',
  '/gestor/documentos': 'Documentos',
  '/gestor/incidentes': 'Incidentes',
  '/empresa': 'Dashboard',
  '/empresa/documentos': 'Os Meus Documentos',
  '/empresa/incidentes': 'Incidentes',
};

const AREA_LABELS = {
  admin: 'Área Administrador',
  gestor: 'Área Gestor',
  empresa: 'Área Empresa',
};

function AdminTopbar() {
  const { utilizador, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [modalPerfil, setModalPerfil] = useState(false);

  const pageTitle = PAGE_TITLES[location.pathname] || 'Painel';
  const areaLabel = `CyberBoxSecur — ${AREA_LABELS[utilizador?.perfil] || 'Painel'}`;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="admin-topbar">
      <div>
        <p className="topbar-title">{pageTitle}</p>
        <p className="topbar-subtitle">{areaLabel}</p>
      </div>

      <div className="d-flex align-items-center gap-2">
        <button className="topbar-btn" title="Página Inicial" onClick={() => navigate('/')}>
          <Home size={17} />
        </button>

        <button className="topbar-btn" title="O Meu Perfil" onClick={() => setModalPerfil(true)}>
          <User size={17} />
        </button>

        <div className="topbar-bell">
          <button className="topbar-btn" title="Notificações">
            <Bell size={17} />
          </button>
          <span className="notif-badge">2</span>
        </div>

        <button className="topbar-btn logout" title="Sair" onClick={handleLogout}>
          <LogOut size={15} />
          <span>Sair</span>
        </button>
      </div>

      {modalPerfil && <ModalPerfil onClose={() => setModalPerfil(false)} />}
    </header>
  );
}

export default AdminTopbar;
