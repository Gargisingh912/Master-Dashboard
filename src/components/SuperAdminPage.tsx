import { useEffect, useState } from "react";
import { supabase } from "../config/supabase"; // adjust to your actual client import
import type { Plan } from "../config/permission";

interface Org {
  id: string;
  name: string;
  type: string;
  plan: Plan;
  trial_ends: string | null;
  created_at: string;
}

const PLAN_OPTIONS: Plan[] = ['trial', 'standard', 'premium', 'enterprise'];

const SuperAdminPage: React.FC = () => {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('organizations')
      .select('id, name, type, plan, trial_ends, created_at')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('Failed to load orgs:', error);
        setOrgs(data || []);
        setLoading(false);
      });
  }, []);

  const upgradePlan = async (orgId: string, newPlan: Plan) => {
    const { error } = await supabase
      .from('organizations')
      .update({ plan: newPlan, trial_ends: null })
      .eq('id', orgId);

    if (error) {
      console.error('Upgrade failed:', error);
      return;
    }

    setOrgs(prev =>
      prev.map(o => (o.id === orgId ? { ...o, plan: newPlan, trial_ends: null } : o))
    );
  };

  if (loading) return <p style={{ color: '#7B9EC4' }}>Loading organizations…</p>;

  return (
    <div style={{ minHeight: '100vh', background: '#0B1220', padding: '32px 24px' }}>
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ color: '#F0F6FF', fontSize: 20, fontWeight: 800 }}>gargi.ai — Admin</h1>
        <button
          onClick={() => window.location.href = '/login'}
          style={{ background: 'transparent', color: '#7B9EC4', border: '1px solid #1C2B42', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}
        >
          ← Back to login
        </button>
      </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2 style={{ color: '#F0F6FF', fontSize: 16, fontWeight: 800 }}>
        All Organizations ({orgs.length})
      </h2>
      {orgs.map(org => (
        <div
          key={org.id}
          style={{
            background: '#101828',
            border: '1px solid #1C2B42',
            borderRadius: 12,
            padding: '14px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div>
            <p style={{ color: '#F0F6FF', fontSize: 13, fontWeight: 700, margin: '0 0 3px' }}>
              {org.name}
            </p>
            <p style={{ color: '#7B9EC4', fontSize: 11, margin: 0 }}>
              {org.type} · {org.plan}
              {org.trial_ends && ` · expires ${new Date(org.trial_ends).toLocaleDateString()}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {PLAN_OPTIONS.map(p => (
              <button
                key={p}
                onClick={() => upgradePlan(org.id, p)}
                style={{
                  background: org.plan === p ? '#818CF8' : 'transparent',
                  color: org.plan === p ? '#000' : '#7B9EC4',
                  border: '1px solid #1C2B42',
                  borderRadius: 7,
                  padding: '5px 10px',
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textTransform: 'capitalize',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
    </div>
  </div>
  );
};

export default SuperAdminPage;