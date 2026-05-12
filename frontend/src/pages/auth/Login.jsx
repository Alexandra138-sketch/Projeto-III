import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.utilizador, res.data.token);
      const perfil = res.data.utilizador.perfil;
      if (perfil === 'admin') navigate('/admin');
      else if (perfil === 'gestor') navigate('/gestor');
      else navigate('/empresa');
    } catch (err) {
      setErro('Email ou password incorretos');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '12px', width: '360px', color: 'white' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>CyberBoxSecur</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.3rem', background: '#334155', border: 'none', borderRadius: '6px', color: 'white', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.3rem', background: '#334155', border: 'none', borderRadius: '6px', color: 'white', boxSizing: 'border-box' }} />
          </div>
          {erro && <p style={{ color: '#f87171', marginBottom: '1rem' }}>{erro}</p>}
          <button type="submit" style={{ width: '100%', padding: '0.75rem', background: '#6366f1', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;