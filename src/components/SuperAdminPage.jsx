// src/config/permissions.js — add superadmin everywhere
// src/components/SuperAdminPage.jsx

export default function SuperAdminPage({ supabase }) {
  const [orgs, setOrgs] = useState([]);

  useEffect(() => {
    supabase.from('organizations')
      .select('id, name, niche, plan, trial_ends, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => setOrgs(data || []));
  }, []);

  const upgradePlan = async (orgId, newPlan) => {
    await supabase.from('organizations')
      .update({ plan: newPlan, trial_ends: null })
      .eq('id', orgId);
    // refresh
    setOrgs(orgs.map(o => o.id === orgId ? { ...o, plan: newPlan } : o));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2 style={{ color: '#F0F6FF', fontSize: 16, fontWeight: 800 }}>
        All Organizations ({orgs.length})
      </h2>
      {orgs.map(org => (
        <div key={org.id} style={{
          background: '#101828', border: '1px solid #1C2B42',
          borderRadius: 12, padding: '14px 16px',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 10,
        }}>
          <div>
            <p style={{ color: '#F0F6FF', fontSize: 13, fontWeight: 700, margin: '0 0 3px' }}>
              {org.name}
            </p>
            <p style={{ color: '#7B9EC4', fontSize: 11, margin: 0 }}>
              {org.niche} · {org.plan}
              {org.trial_ends && ` · expires ${new Date(org.trial_ends).toLocaleDateString()}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['trial','standard','premium','enterprise'].map(p => (
              <button key={p} onClick={() => upgradePlan(org.id, p)} style={{
                background: org.plan === p ? '#818CF8' : 'transparent',
                color: org.plan === p ? '#000' : '#7B9EC4',
                border: '1px solid #1C2B42',
                borderRadius: 7, padding: '5px 10px',
                fontSize: 10, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
                textTransform: 'capitalize',
              }}>{p}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}