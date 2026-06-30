// ─────────────────────────────────────────────────────────────
//  Página: empresa/Ativos.jsx
//
//  Gestão do inventário de ativos tecnológicos da empresa.
//  Segue a estrutura do template CNCS/NIS2.
//
//  Funcionalidades:
//    - Listar todos os ativos em tabela
//    - Adicionar novo ativo (modal com campos CNCS)
//    - Editar ativo existente
//    - Eliminar ativo (com confirmação SweetAlert2)
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';
// SweetAlert2 — confirmações de eliminação (ensinado nas aulas)
import Swal from 'sweetalert2';

// Opções de criticidade baseadas no template CNCS
const OPCOES_CRITICIDADE = ['Residual', 'Baixa', 'Média', 'Alta', 'Crítica'];

// Tipos de equipamento baseados no template CNCS
const TIPOS_EQUIPAMENTO = [
  'Servidor', 'Postos', 'Storage', 'UPS', 'Switch',
  'Firewall', 'Disco Externo', 'NAS', 'Router', 'Outro',
];

// Cores dos badges de criticidade
const BADGE_CRITICIDADE = {
  Residual: 'badge bg-secondary',
  Baixa:    'badge bg-success',
  Média:    'badge bg-warning text-dark',
  Alta:     'badge bg-danger',
  Crítica:  'badge bg-dark',
};

// ── Formulário vazio — usado ao criar novo ativo
const FORM_VAZIO = {
  nome: '', tipo_equipamento: '', numero_inventario: '', tipologia: '',
  modelo: '', numero_serie: '', fabricante: '', localizacao: '',
  sistema_operativo: '', criticidade: 'Média', ip: '', mac: '',
  responsavel: '', contacto: '', unidade_organica: '', aplicacoes: '', observacoes: '',
};

// ── Modal de criação/edição de ativo ──────────────────────────
function ModalAtivo({ ativo, onClose, onGuardar }) {
  const [form, setForm] = useState(ativo ? { ...FORM_VAZIO, ...ativo } : { ...FORM_VAZIO });
  const [aGuardar, setAGuardar] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAGuardar(true);
    await onGuardar(form);
    setAGuardar(false);
  };

  const campo = (label, key, tipo = 'text', req = false) => (
    <div className="mb-3">
      <label className="form-label fw-semibold">{label}{req && ' *'}</label>
      <input
        type={tipo} required={req}
        className="form-control"
        value={form[key] || ''}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="modal-dialog modal-xl modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{ativo?.id ? 'Editar Ativo' : 'Adicionar Ativo Tecnológico'}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">

              {/* Secção: Identificação */}
              <h6 className="text-muted text-uppercase small mb-3 border-bottom pb-1">Identificação</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  {campo('Nome do Ativo', 'nome', 'text', true)}
                </div>
                <div className="col-md-3">
                  {campo('Nº Inventário', 'numero_inventario')}
                </div>
                <div className="col-md-3">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Criticidade</label>
                    <select className="form-select" value={form.criticidade}
                      onChange={(e) => setForm({ ...form, criticidade: e.target.value })}>
                      {OPCOES_CRITICIDADE.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Tipo de Equipamento</label>
                    <select className="form-select" value={form.tipo_equipamento}
                      onChange={(e) => setForm({ ...form, tipo_equipamento: e.target.value })}>
                      <option value="">— Selecionar —</option>
                      {TIPOS_EQUIPAMENTO.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="col-md-4">{campo('Tipologia', 'tipologia')}</div>
                <div className="col-md-4">{campo('Modelo', 'modelo')}</div>
                <div className="col-md-4">{campo('Fabricante', 'fabricante')}</div>
                <div className="col-md-4">{campo('Nº de Série', 'numero_serie')}</div>
                <div className="col-md-4">{campo('Localização', 'localizacao')}</div>
              </div>

              {/* Secção: Rede */}
              <h6 className="text-muted text-uppercase small mb-3 border-bottom pb-1 mt-2">Rede</h6>
              <div className="row g-3">
                <div className="col-md-4">{campo('Sistema Operativo', 'sistema_operativo')}</div>
                <div className="col-md-4">{campo('Endereço IP', 'ip')}</div>
                <div className="col-md-4">{campo('Endereço MAC/HW', 'mac')}</div>
              </div>

              {/* Secção: Responsável */}
              <h6 className="text-muted text-uppercase small mb-3 border-bottom pb-1 mt-2">Responsável</h6>
              <div className="row g-3">
                <div className="col-md-4">{campo('Nome do Responsável', 'responsavel')}</div>
                <div className="col-md-4">{campo('Contacto', 'contacto')}</div>
                <div className="col-md-4">{campo('Unidade Orgânica', 'unidade_organica')}</div>
              </div>

              {/* Secção: Observações */}
              <h6 className="text-muted text-uppercase small mb-3 border-bottom pb-1 mt-2">Aplicações e Observações</h6>
              <div className="mb-3">
                <label className="form-label fw-semibold">Aplicações / Serviços</label>
                <textarea className="form-control" rows={2}
                  value={form.aplicacoes || ''}
                  onChange={(e) => setForm({ ...form, aplicacoes: e.target.value })}
                  placeholder="Lista de aplicações e serviços instalados…" />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Observações</label>
                <textarea className="form-control" rows={2}
                  value={form.observacoes || ''}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  placeholder="Notas adicionais sobre este ativo…" />
              </div>

            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={aGuardar}>
                {aGuardar ? 'A guardar…' : (ativo?.id ? 'Guardar Alterações' : 'Adicionar Ativo')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────
function EmpresaAtivos() {
  const [ativos,     setAtivos]     = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [pesquisa,   setPesquisa]   = useState('');
  const [modal,      setModal]      = useState(undefined); // undefined=fechado, null=novo, objeto=editar

  // Carregar ativos ao abrir a página
  useEffect(() => {
    api.get('/empresa/ativos')
      .then(({ data }) => setAtivos(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Erro ao carregar ativos:', err))
      .finally(() => setCarregando(false));
  }, []);

  // Filtrar por pesquisa
  const filtrados = ativos.filter((a) =>
    a.nome?.toLowerCase().includes(pesquisa.toLowerCase()) ||
    a.tipo_equipamento?.toLowerCase().includes(pesquisa.toLowerCase()) ||
    a.ip?.toLowerCase().includes(pesquisa.toLowerCase()) ||
    a.localizacao?.toLowerCase().includes(pesquisa.toLowerCase())
  );

  // Estatísticas rápidas
  const totalCriticos = ativos.filter((a) => a.criticidade === 'Crítica' || a.criticidade === 'Alta').length;

  // Criar ou editar ativo
  const handleGuardar = async (dados) => {
    try {
      if (modal?.id) {
        // Editar ativo existente
        const { data } = await api.put(`/empresa/ativos/${modal.id}`, dados);
        setAtivos((prev) => prev.map((a) => a.id === modal.id ? { ...a, ...data } : a));
        Swal.fire('Guardado!', 'O ativo foi atualizado com sucesso.', 'success');
      } else {
        // Criar novo ativo
        const { data } = await api.post('/empresa/ativos', dados);
        setAtivos((prev) => [data, ...prev]);
        Swal.fire('Adicionado!', 'O ativo foi adicionado ao inventário.', 'success');
      }
      setModal(undefined);
    } catch (err) {
      console.error('Erro ao guardar ativo:', err);
      Swal.fire('Erro!', 'Não foi possível guardar o ativo.', 'error');
    }
  };

  // Eliminar ativo com confirmação SweetAlert2
  const handleEliminar = (ativo) => {
    Swal.fire({
      title: 'Tens a certeza?',
      text: `Vais eliminar o ativo "${ativo.nome}". Esta ação não pode ser revertida!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, eliminar!',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/empresa/ativos/${ativo.id}`);
          setAtivos((prev) => prev.filter((a) => a.id !== ativo.id));
          Swal.fire('Eliminado!', 'O ativo foi removido do inventário.', 'success');
        } catch (err) {
          console.error('Erro ao eliminar ativo:', err);
          Swal.fire('Erro!', 'Não foi possível eliminar o ativo.', 'error');
        }
      }
    });
  };

  return (
    <AdminLayout>

      {/* ── Cabeçalho ── */}
      <div className="dash-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4>Ativos Tecnológicos</h4>
          <p>Inventário de ativos tecnológicos da empresa (template CNCS/NIS2).</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(null)}>
          + Adicionar Ativo
        </button>
      </div>

      {/* ── Estatísticas rápidas ── */}
      {!carregando && (
        <div className="row g-3 mb-4">
          {[
            { numero: ativos.length,    label: 'Total Ativos',      bg: '#eff6ff', cor: '#2563eb' },
            { numero: totalCriticos,     label: 'Alta/Crítica',      bg: '#fee2e2', cor: '#dc2626' },
            { numero: ativos.filter((a) => a.criticidade === 'Baixa' || a.criticidade === 'Residual').length,
              label: 'Baixo Risco',     bg: '#f0fdf4', cor: '#16a34a' },
            { numero: ativos.filter((a) => a.ip).length,
              label: 'Com IP',          bg: '#f5f3ff', cor: '#7c3aed' },
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

      {/* ── Pesquisa ── */}
      <div className="dash-card mb-4">
        <input type="text" className="form-control"
          placeholder="Pesquisar por nome, tipo, IP ou localização…"
          value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} />
      </div>

      {/* ── Tabela de ativos ── */}
      <div className="dash-card">
        {carregando ? (
          <p style={{ color: '#94a3b8' }}>A carregar inventário…</p>
        ) : filtrados.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>
            {ativos.length === 0
              ? 'Ainda não tens ativos registados. Clica em "+ Adicionar Ativo" para começar.'
              : 'Nenhum ativo encontrado para a pesquisa atual.'}
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Criticidade</th>
                  <th>IP</th>
                  <th>Sistema Operativo</th>
                  <th>Localização</th>
                  <th>Responsável</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((ativo) => (
                  <tr key={ativo.id}>
                    <td>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{ativo.nome}</p>
                      {ativo.numero_inventario && (
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                          #{ativo.numero_inventario}
                        </p>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{ativo.tipo_equipamento || '—'}</td>
                    <td>
                      <span className={BADGE_CRITICIDADE[ativo.criticidade] || 'badge bg-secondary'}>
                        {ativo.criticidade || '—'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{ativo.ip || '—'}</td>
                    <td style={{ fontSize: '0.85rem' }}>{ativo.sistema_operativo || '—'}</td>
                    <td style={{ fontSize: '0.85rem' }}>{ativo.localizacao || '—'}</td>
                    <td style={{ fontSize: '0.85rem' }}>{ativo.responsavel || '—'}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="btn btn-outline-secondary btn-sm"
                          onClick={() => setModal(ativo)}>Editar</button>
                        <button className="btn btn-outline-danger btn-sm"
                          onClick={() => handleEliminar(ativo)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de criação/edição */}
      {modal !== undefined && (
        <ModalAtivo
          ativo={modal}
          onClose={() => setModal(undefined)}
          onGuardar={handleGuardar}
        />
      )}

    </AdminLayout>
  );
}

export default EmpresaAtivos;
