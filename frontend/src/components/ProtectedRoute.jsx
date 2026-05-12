import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, perfil }) {
  const { utilizador } = useAuth();

  if (!utilizador) return <Navigate to="/login" />;
  if (perfil && utilizador.perfil !== perfil) return <Navigate to="/" />;

  return children;
}

export default ProtectedRoute;