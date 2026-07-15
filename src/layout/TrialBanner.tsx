
interface TrialBannerProps {
  plan: string;
  trialEnds: string | null;
}

const TrialBanner: React.FC<TrialBannerProps> = ({ plan, trialEnds }) => {
  const trialDaysLeft = (() => {
    if (plan !== 'trial' || !trialEnds) return null;
    const diff = new Date(trialEnds).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  })();

  if (plan !== 'trial' || trialDaysLeft === null) return null;

  return (
    <div style={{
      background: trialDaysLeft <= 2 ? '#F8717118' : '#FBBF2418',
      border: `1px solid ${trialDaysLeft <= 2 ? '#F87171' : '#FBBF24'}33`,
      padding: '10px 16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
    }}>
      <span style={{
        color: trialDaysLeft <= 2 ? '#F87171' : '#FBBF24',
        fontSize: 12,
        fontWeight: 700,
      }}>
        {trialDaysLeft === 0
          ? '⚠ Your trial has expired — upgrade to continue'
          : `⏳ ${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} left in your free trial`}
      </span>
      <button
        onClick={() => window.open('https://wa.me/917089072459?text=I want to upgrade my gargi.ai plan', '_blank')}
        style={{
          background: '#818CF8',
          color: '#000',
          border: 'none',
          borderRadius: 8,
          padding: '6px 14px',
          fontSize: 11,
          fontWeight: 800,
          cursor: 'pointer',
          fontFamily: 'inherit',
          whiteSpace: 'nowrap',
        }}
      >
        Upgrade Now →
      </button>
    </div>
  );
};

export default TrialBanner;