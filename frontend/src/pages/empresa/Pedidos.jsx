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

      {/* Cabeçalho */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Pedidos e Questões</h4>
          <p className="text-muted mb-0">
            {carregando ? 'A carregar…' : `${pedidos.length} pedidos · ${totalPendentes} pendentes`}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? 'Cancelar' : '+ Novo Pedido'}
        </button>
      </div>

      {/* Resumo de estados */}
      <div className="row g-3 mb-4">
        {[
          { numero: pedidos.length,   label: 'Total',      bg: 'bg-secondary' },
          { numero: totalPendentes,    label: 'Pendentes',  bg: 'bg-warning'   },
          { numero: pedidos.filter((p) => p.estado === 'Em Análise').length,
            label: 'Em Análise', bg: 'bg-primary' },
          { numero: totalResolvidos,   label: 'Resolvidos', bg: 'bg-success'   },
        ].map(({ numero, label, bg }) => (
          <div key={label} className="col-6 col-md-3">
            <div className={`card text-white ${bg}`}>
              <div className="card-body text-center py-3">
                <h3 className="fw-bold mb-1">{carregando ? '…' : numero}</h3>
                <p className="mb-0 small">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Formulário de novo pedido */}
      {mostrarForm && (
        <div className="card mb-4 border-primary">
          <div className="card-header bg-primary text-white fw-semibold">
            Novo Pedido / Questão
          </div>
          <div className="card-body">
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
                    placeholder="Descreve o pedido ou questão com o máximo de detalhe possível…" />
                </div>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-primary" disabled={aEnviar}>
                  {aEnviar ? 'A enviar…' : 'Submeter Pedido'}
                </button>
                <button type="button" className="btn btn-secondary"
                  onClick={() => setMostrarForm(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Erro geral */}
      {erro && !mostrarForm && <div className="alert alert-danger">{erro}</div>}

      {/* Lista de pedidos */}
      {carregando ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border mb-3" role="status"></div>
          <p>A carregar pedidos…</p>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5 text-muted">
            Ainda não tens pedidos submetidos. Clica em "+ Novo Pedido" para começar.
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="card"
              style={{ cursor: 'pointer', borderLeft: pedido.resposta ? '4px solid #22c55e' : '4px solid #e2e8f0' }}
              onClick={() => setPedidoAberto(pedidoAberto?.id === pedido.id ? null : pedido)}
            >
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="badge bg-light text-dark border">{pedido.tipo}</span>
                      <span className={BADGE_ESTADO[pedido.estado] || 'badge bg-secondary'}>
                        {ICONE_ESTADO[pedido.estado]} {pedido.estado}
                      </span>
                    </div>
                    <h6 className="fw-semibold mb-1">{pedido.assunto}</h6>
                    <p className="text-muted small mb-0">
                      {new Date(pedido.created_at).toLocaleDateString('pt-PT')}
                      {pedido.resposta && ' · Respondido pelo gestor ✓'}
                    </p>
                  </div>
                  <span className="text-muted small ms-2">
                    {pedidoAberto?.id === pedido.id ? '▲' : '▼'}
                  </span>
                </div>

                {/* Detalhe expandido ao clicar */}
                {pedidoAberto?.id === pedido.id && (
                  <div className="mt-3 border-top pt-3">
                    <p className="small mb-3" style={{ whiteSpace: 'pre-wrap' }}>
                      <strong>O meu pedido:</strong><br />{pedido.descricao}
                    </p>
                    {pedido.resposta ? (
                      <div className="p-3 rounded" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                        <p className="small mb-1">
                          <strong>Resposta do gestor</strong>
                          {pedido.respondedor && ` (${pedido.respondedor.nome})`}:
                        </p>
                        <p className="small mb-0" style={{ whiteSpace: 'pre-wrap' }}>{pedido.resposta}</p>
                      </div>
                    ) : (
                      <div className="p-3 rounded" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                        <p className="small mb-0 text-warning-emphasis">
                          ⏳ A aguardar resposta do gestor…
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </AdminLayout>
  );
}

export default EmpresaPedidos;
