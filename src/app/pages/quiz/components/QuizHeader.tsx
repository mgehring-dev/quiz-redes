import { BoltIcon, FlameIcon, XIcon } from "./Icons";

interface IQuizHeaderProps {
  progress: number;
  streak: number;
  xp: number;
  /** muda a cada XP ganho, para disparar a animação "+10" */
  xpPopKey: number;
  xpPop: number;
  onRestart: () => void;
}

export const QuizHeader = ({ progress, streak, xp, xpPopKey, xpPop, onRestart }: IQuizHeaderProps) => (
  <header className="top">
    <button className="icon-btn" title="Recomeçar" aria-label="Recomeçar" onClick={onRestart}>
      <XIcon size={20} />
    </button>

    <div className="bar" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
      <div className="bar-fill" style={{ width: `${progress}%` }}>
        <span className="bar-shine" />
      </div>
    </div>

    <div className={`chip streak ${streak >= 2 ? "on" : ""}`} title="Sequência de acertos">
      <FlameIcon /> {streak}
    </div>

    <div className="chip xp" title="XP nesta lição">
      <BoltIcon /> {xp} XP
      {xpPopKey > 0 && (
        <span key={xpPopKey} className="xp-pop">
          +{xpPop}
        </span>
      )}
    </div>
  </header>
);
