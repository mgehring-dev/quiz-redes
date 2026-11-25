import { TrophyIcon } from "./Icons";
import { useGetProfile } from "../hooks/useQuiz";

interface IFinishedScreenProps {
  xp: number;
  hits: number;
  misses: number;
  bestStreak: number;
  total: number;
  onRestart: () => void;
  onChangeLevel: () => void;
}

export const FinishedScreen = ({ xp, hits, misses, bestStreak, total, onRestart, onChangeLevel }: IFinishedScreenProps) => {
  const { data: profile } = useGetProfile();
  const attempts = hits + misses;
  const accuracy = attempts ? Math.round((hits / attempts) * 100) : 0;

  return (
    <div className="app finished">
      <div className="trophy">
        <TrophyIcon />
      </div>
      <h1>Lição concluída!</h1>
      <p className="sub">Você acertou as {total} perguntas da Lista de Exercícios 2.</p>

      <div className="stats">
        <Stat label="XP da lição" value={xp} tone="xp" />
        <Stat label="Precisão" value={`${accuracy}%`} tone="ok" />
        <Stat label="Melhor sequência" value={bestStreak} tone="fire" />
      </div>

      {profile && <p className="total-xp">XP acumulado: {profile.xpTotal}</p>}

      <div className="finished-actions">
        <button className="cta" onClick={onRestart} autoFocus>
          Jogar de novo
        </button>
        <button className="link-btn" onClick={onChangeLevel}>
          Trocar de nível
        </button>
      </div>
    </div>
  );
};

const Stat = ({ label, value, tone }: { label: string; value: number | string; tone: string }) => (
  <div className={`stat ${tone}`}>
    <span className="stat-label">{label}</span>
    <span className="stat-value">{value}</span>
  </div>
);
