// ─────────────────────────────────────────────────────────────
//  Página: empresa/Pedidos.jsx
//
//  Permite à empresa submeter questões e pedidos de suporte
//  ao gestor responsável, e acompanhar o estado de cada pedido.
//
//  Funcionalidades:
//    - Listar todos os pedidos com estado atual
//    - Submeter novo pedido/questão
//    - Ver resposta do gestor
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';

// Tipos de pedido disponíveis
const TIPOS_PEDIDO = ['Questão', 'Pedido de Suporte', 'Pedido de Pentest', 'Outro'];

// Cores dos badges de estado
const BADGE_ESTADO = {
  Pendente:    'badge bg-warning text-dark',
  'Em Análise':'badge bg-primary',
  Resolvido:   'badge bg-success',
  Fechado:     'badge bg-secondary',
};

// Ícones por estado
const ICONE_ESTADO = {
  Pendente:    '⏳',
  'Em Análise':'🔍',
  Resolvido:   '✅',
  Fechado:     '🔒',
};

function EmpresaPedidos() {
  const [pedidos,     setPedidos]     = useState([]);
  const [carregando,  setCarregando]  = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [pedidoAberto, setPedidoAberto] = useState(null); // pedido selecionado para ver detalhes
  const [aEnviar,     setAEnviar]     = useState(false);
  const [erro,        setErro]        = useState('');

  // Formulário de novo pedido
  const [form, setForm] = useState({
    tipo: 'Questão',
    assunto: '',
    descricao: '',
  });

  // Carregar pedidos ao abrir a página
  useEffect(() => {
    api.get('/empresa/pedidos')
      .then(({ data }) => setPedidos(Array.isArray(data) ? data : []))
      .catch(() => setErro('Não foi possível carregar os pedidos.'))
      .finally(() => setCarregando(false));
  }, []);

  // Submeter novo pedido
  const handleSubmeter = async (e) => {
    e.preventDefault();
    setAEnviar(true);
    setErro('');
    try {
      const { data } = await api.post('/empresa/pedidos', form);
      // Adicionar o novo pedido no topo da lista
      setPedidos((prev) => [data, ...prev]);
      setForm({ tipo: 'Questão', assunto: '', descricao: '' });
      setMostrarForm(false);
    } catch (err) {
      console.error('Erro ao submeter pedido:', err);
      setErro('Não foi possível submeter o pedido. Tenta novamente.');
    } finally {
      setAEnviar(false);
    }
  };

  // Estatísticas rápidas
  const totalPendentes  = pedidos.filter((p) => p.estado === 'Pendente').length;
  const totalResolvidos = pedidos.filter((p) => p.estado === 'Resolvido' || p.estado === 'Fechado').length;

  return (
    <AdminLayout>

      {/* ── Cabeçalho ── */}
      <div className="dash-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4>Pedidos e Questões</h4>
          <p>Submete pedidos de suporte e questões ao teu gestor.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? 'Cancelar' : '+ Novo Pedido'}
        </button>
      </div>

      {/* ── Estatísticas ── */}
      {!carregando && (
        <div className="row g-3 mb-4">
          {[
            { numero: pedidos.length,  label: 'Total',      bg: '#f8fafc', cor: '#64748b' },
            { numero: totalPendentes,   label: 'Pendentes',  bg: '#fffbeb', cor: '#b45309' },
            { numero: pedidos.filter((p) => p.estado === 'Em Análise').length,
              label: 'Em Análise',     bg: '#eff6ff', cor: '#2563eb' },
            { numero: totalResolvidos,  label: 'Resolvidos', bg: '#f0fdf4', cor: '#16a34a' },
          ].map(({ numero, label, bg, cor }) => (
            <div key={label} className="col-6 col-md-3">
              <div className="dash-card" style={{ textAlign: 'center', padding: '1.25rem' }}>
                <p style={{ fontSize: '1.8rem', fontWeight: 700, color: cor, margin: 0 }}>{numero}</p>
                <p style={{ fontSize: '0.8rem', color: cor, margin: 0, fontWeight: 500 }}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Formulário de novo pedido ── */}
      {mostrarForm && (
        <div className="dash-card mb-4">
          <h6 style={{ fontWeight: 600, marginBottom: '1rem' }}>Novo Pedido / Questão</h6>
          {erro && <div className="alert alert-danger">{erro}</div>}
          <form onSubmit={handleSubmeter}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label fw-semibold">Tipo de Pedido</label>
                <select className="form-select" value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                  {TIPOS_PEDIDO.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="col-md-9">
                <label className="form-label fw-semibold">Assunto *</label>
                <input required type="text" className="form-control"
                  value={form.assunto}
                  onChange={(e) => setForm({ ...form, assunto: e.target.value })}
                  placeholder="Resumo breve do pedido ou questão…" />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Descrição detalhada *</label>
                <textarea required rows={4} className="form-control"
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Descreve o pedido com o máximo de detalhe possível…" />
              </div>
            </div>
            <div className="d-flex gap-2 mt-3">
              <button type="submit" className="btn btn-primary" disabled={aEnviar}>
                {aEnviar ? 'A enviar…' : 'Submeter Pedido'}
              </button>
              <button type="button" className="btn btn-outline-secondary"
                onClick={() => setMostrarForm(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Erro geral ── */}
      {erro && !mostrarForm && <div className="alert alert-danger">{erro}</div>}

      {/* ── Lista de pedidos ── */}
      {carregando ? (
        <p style={{ color: '#94a3b8' }}>A carregar pedidos…</p>
      ) : pedidos.length === 0 ? (
        <div className="dash-card" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          Ainda não tens pedidos submetidos. Clica em &quot;+ Novo Pedido&quot; para começar.
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="dash-card"
              style={{ cursor: 'pointer', borderLeft: pedido.resposta ? '4px solid #22c55e' : '4px solid #e2e8f0' }}
              onClick={() => setPedidoAberto(pedidoAberto?.id === pedido.id ? null : pedido)}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div style={{ flex: 1 }}>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="badge bg-light text-dark border">{pedido.tipo}</span>
                    <span className={BADGE_ESTADO[pedido.estado] || 'badge bg-secondary'}>
                      {ICONE_ESTADO[pedido.estado]} {pedido.estado}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{pedido.assunto}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    {new Date(pedido.created_at).toLocaleDateString('pt-PT')}
                    {pedido.resposta && ' · Respondido pelo gestor ✓'}
                  </p>
                </div>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                  {pedidoAberto?.id === pedido.id ? '▲' : '▼'}
                </span>
              </div>

              {/* Detalhe expandido ao clicar */}
              {pedidoAberto?.id === pedido.id && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem', whiteSpace: 'pre-wrap' }}>
                    <strong>O meu pedido:</strong><br />{pedido.descricao}
                  </p>
                  {pedido.resposta ? (
                    <div style={{ padding: '0.75rem', borderRadius: 8, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: '#15803d' }}>
                        Resposta do gestor{pedido.respondedor && ` (${pedido.respondedor.nome})`}:
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>{pedido.resposta}</p>
                    </div>
                  ) : (
                    <div style={{ padding: '0.75rem', borderRadius: 8, backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#b45309' }}>⏳ A aguardar resposta do gestor…</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </AdminLayout>
  );
}

export default EmpresaPedidos;
