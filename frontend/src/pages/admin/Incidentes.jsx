import Sidebar from '../../components/Sidebar';

function Incidentes() {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '2rem', background: '#0f172a', minHeight: '100vh', color: 'white' }}>
        <h2>Incidentes</h2>
      </div>
    </div>
  );
}

export default Incidentes;