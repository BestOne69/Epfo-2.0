export function SaathiCharacter({ state = 'idle' }: { state?: 'idle' | 'listening' | 'speaking' }) {
  return (
    <div className={`saathi-character ${state}`} aria-label={`PF Saathi is ${state}`} role="img">
      <div className="saathi-aura" aria-hidden="true" />
      <div className="saathi-dupatta" aria-hidden="true" />
      <div className="saathi-body" aria-hidden="true">
        <span className="saathi-badge">PF</span>
        <span className="saathi-arm saathi-arm-left" />
        <span className="saathi-arm saathi-arm-right" />
      </div>
      <div className="saathi-head" aria-hidden="true">
        <span className="saathi-hair saathi-hair-back" />
        <span className="saathi-face">
          <i className="saathi-eye left" />
          <i className="saathi-eye right" />
          <i className="saathi-bindi" />
          <i className="saathi-nose" />
          <b className="saathi-mouth" />
          <span className="saathi-earring left" />
          <span className="saathi-earring right" />
        </span>
        <span className="saathi-hair saathi-hair-front" />
      </div>
    </div>
  );
}
