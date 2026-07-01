import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function ModalPerfil({ onClose }) {
  const { utilizador, atualizarUtilizador } = useAuth();

  const [form, setForm] = useState({
    nome: utilizador?.nome || '',
    email: utilizador?.email || '',
    telefone: '',
  });
  const [alterarPassword, setAlterarPassword] = useState(false);
  const [passwords, setPasswords] = useState({ atual: '', nova: '', confirmar: '' });
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState('');

  // Carregar dados frescos (ex.: telefone, que não vem no login) ao abrir
  useEffect(() => {
    api.get('/utilizadores/me')
      .then(({ data }) => setForm({ nome: data.nome || '', email: data.email || '', telefone: data.telefone || '' }))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (alterarPassword) {
      if (!passwords.atual) {
        setErro('Introduz a tua password atual.');
        return;
      }
      if (passwords.nova.length < 6) {
        setErro('A nova password deve ter pelo menos 6 caracteres.');
        return;
      }
      if (passwords.nova !== passwords.confirmar) {
        setErro('A confirmação da nova password não coincide.');
        return;
      }
    }

    setAGuardar(true);
    try {
      const payload = { nome: form.nome, email: form.email, telefone: form.telefone };
      if (alterarPassword) {
        payload.password_atual = passwords.atual;
        payload.password_nova = passwords.nova;
      }
      const { data } = await api.put('/utilizadores/me', payload);
      atualizarUtilizador({ nome: data.nome, email: data.email, perfil: data.perfil });
      Swal.fire('Perfil atualizado!', 'As tuas informações foram guardadas.', 'success');
      onClose();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Não foi possível guardar as alterações.');
    } finally {
      setAGuardar(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h5>O Meu Perfil</h5>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {erro && <div className="alert alert-danger">{erro}</div>}

            <div className="mb-3">
              <label className="form-label">Nome</label>
              <input
                required
                className="form-input"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                required
                type="email"
                className="form-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Telefone</label>
              <input
                className="form-input"
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                placeholder="+351 912 000 000"
              />
            </div>

            {!alterarPassword ? (
              <button
                type="button"
                className="btn-voltar"
                style={{ padding: 0 }}
                onClick={() => setAlterarPassword(true)}
              >
                Alterar password
              </button>
            ) : (
              <>
                <div className="mb-3">
                  <label className="form-label">Password atual</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwords.atual}
                    onChange={(e) => setPasswords({ ...passwords, atual: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Nova password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwords.nova}
                    onChange={(e) => setPasswords({ ...passwords, nova: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirmar nova password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwords.confirmar}
                    onChange={(e) => setPasswords({ ...passwords, confirmar: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  className="btn-voltar"
                  style={{ padding: 0 }}
                  onClick={() => { setAlterarPassword(false); setPasswords({ atual: '', nova: '', confirmar: '' }); }}
                >
                  Cancelar alteração de password
                </button>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-guardar" disabled={aGuardar}>
              {aGuardar ? 'A guardar…' : 'Guardar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalPerfil;
