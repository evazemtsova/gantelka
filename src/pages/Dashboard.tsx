import { Button } from '../components/ui/Button';

interface Props {
  onGoToDevScreen?: () => void;
}

export default function Dashboard({ onGoToDevScreen }: Props) {
  return (
    <main style={{ padding: '36px 24px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h2 style={{ fontFamily: 'Anonymous Pro, monospace', fontSize: 40, textTransform: 'uppercase', fontWeight: 400 }}>
        профиль
      </h2>
      {onGoToDevScreen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Button variant="outlined" fullWidth onClick={onGoToDevScreen}>
            dev режим
          </Button>
          <p style={{ fontSize: 13, color: '#c6c6c6', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            временная кнопка для тестирования
          </p>
        </div>
      )}
    </main>
  );
}
