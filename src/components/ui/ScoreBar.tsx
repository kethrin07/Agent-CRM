export function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 font-mono font-medium">{score}</span>
      <div className="h-1.5 flex-grow rounded-[3px] bg-track">
        <div
          className="h-1.5 rounded-[3px]"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  );
}
