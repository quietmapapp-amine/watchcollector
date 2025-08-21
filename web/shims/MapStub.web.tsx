export default function MapStub(props: any) {
  return (
    <div style={{
      height: props?.style?.height || 300,
      background: '#0b1220',
      color: '#bfc7d5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px dashed #2a3550',
      borderRadius: '8px'
    }}>
      🗺️ Map (web stub)
    </div>
  );
}
