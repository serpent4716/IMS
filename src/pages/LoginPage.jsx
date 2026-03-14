import React, { useState, useRef, useEffect } from 'react';

const TABS = ['Sign In', 'Sign Up', 'Reset Password'];

const DEMO_USERS_INIT = [];

export default function LoginPage({ onLogin }) {
  const [tab, setTab] = useState(0);
  const [panelHeight, setPanelHeight] = useState('auto');
  const [users, setUsers] = useState(DEMO_USERS_INIT);
  const panelRefs = [useRef(null), useRef(null), useRef(null)];

  // Sign In state
  const [liEmail, setLiEmail] = useState('');
  const [liPass, setLiPass] = useState('');
  const [liMsg, setLiMsg] = useState({ text: '', type: '' });

  // Sign Up state
  const [suRole, setSuRole] = useState('');
  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPass, setSuPass] = useState('');
  const [suMsg, setSuMsg] = useState({ text: '', type: '' });

  // Reset Password state
  const [rpStep, setRpStep] = useState(1);
  const [rpEmail, setRpEmail] = useState('');
  const [rpOtp, setRpOtp] = useState('');
  const [rpErr, setRpErr] = useState('');
  const [rpOtpMsg, setRpOtpMsg] = useState({ text: '', type: '' });

  function updateHeight(i) {
    const el = panelRefs[i]?.current;
    if (el) setPanelHeight(el.offsetHeight);
  }

  useEffect(() => { updateHeight(0); }, []);
  useEffect(() => { updateHeight(tab); }, [tab]);
  useEffect(() => { if (tab === 2) updateHeight(2); }, [rpStep]);

  function switchTab(i) {
    setTab(i);
  }

  function doLogin(e) {
    e.preventDefault();
    setLiMsg({ text: '', type: '' });
    if (!liEmail || !liPass) {
      setLiMsg({ text: 'Please fill in all fields.', type: 'err' });
      return;
    }
    const u = users.find(u => u.email === liEmail && u.pass === liPass);
    if (u) {
      setLiMsg({ text: `✓ Signed in as ${u.name} (${u.role})`, type: 'suc' });
      if (onLogin) onLogin(u);
    } else {
      setLiMsg({ text: 'No account found. Please sign up first or check your credentials.', type: 'err' });
    }
  }

  function doSignup(e) {
    e.preventDefault();
    setSuMsg({ text: '', type: '' });
    if (!suRole) { setSuMsg({ text: 'Please select a role above.', type: 'err' }); return; }
    if (!suName || !suEmail || !suPass) { setSuMsg({ text: 'Please fill in all fields.', type: 'err' }); return; }
    if (suPass.length < 8) { setSuMsg({ text: 'Password must be at least 8 characters.', type: 'err' }); return; }
    if (users.find(u => u.email === suEmail)) { setSuMsg({ text: 'An account with this email already exists.', type: 'err' }); return; }
    const roleLabel = suRole === 'staff' ? 'Warehouse Staff' : 'Inventory Manager';
    const newUser = { email: suEmail, pass: suPass, name: suName, role: roleLabel };
    setUsers(prev => [...prev, newUser]);
    setSuMsg({ text: '✓ Account created! Redirecting to sign in…', type: 'suc' });
    setTimeout(() => {
      setLiEmail(suEmail);
      setLiPass(suPass);
      setSuMsg({ text: '', type: '' });
      setSuName(''); setSuEmail(''); setSuPass(''); setSuRole('');
      switchTab(0);
    }, 1200);
  }

  function sendOtp(e) {
    e.preventDefault();
    setRpErr('');
    if (!rpEmail) { setRpErr('Please enter your email address.'); return; }
    setRpStep(2);
  }

  function verifyOtp(e) {
    e.preventDefault();
    setRpOtpMsg({ text: '', type: '' });
    if (rpOtp === '123456') {
      setRpOtpMsg({ text: '✓ OTP verified! Redirecting to sign in…', type: 'suc' });
      setTimeout(() => {
        switchTab(0);
        setRpStep(1); setRpEmail(''); setRpOtp('');
        setRpOtpMsg({ text: '', type: '' });
      }, 1500);
    } else {
      setRpOtpMsg({ text: 'Invalid OTP. Use 123456 for demo.', type: 'err' });
    }
  }

  function resetRp() {
    setRpStep(1);
    setRpOtp('');
    setRpErr('');
    setRpOtpMsg({ text: '', type: '' });
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid #e5e7eb', borderRadius: 10,
    fontSize: 14, outline: 'none', background: '#f9fafb',
    transition: 'all 0.2s', boxSizing: 'border-box', fontFamily: 'inherit',
  };

  const focusStyle = (e) => {
    e.target.style.borderColor = '#2563EB';
    e.target.style.background = '#fff';
    e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
  };

  const blurStyle = (e) => {
    e.target.style.borderColor = '#e5e7eb';
    e.target.style.background = '#f9fafb';
    e.target.style.boxShadow = 'none';
  };

  const msgBox = (msg) => msg.text ? (
    <div style={{
      padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 12,
      background: msg.type === 'suc' ? '#f0fdf4' : '#fef2f2',
      border: `1px solid ${msg.type === 'suc' ? '#bbf7d0' : '#fecaca'}`,
      color: msg.type === 'suc' ? '#16a34a' : '#dc2626',
    }}>{msg.text}</div>
  ) : null;

  const roleBtn = (id, icon, name, desc, selected, onClick) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1, padding: '10px 8px',
        border: `1.5px solid ${selected ? '#2563EB' : '#e5e7eb'}`,
        borderRadius: 10,
        background: selected ? '#eff6ff' : '#f9fafb',
        cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
      }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.background = '#eff6ff'; } }}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#f9fafb'; } }}
    >
      <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#111827' }}>{name}</div>
      <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{desc}</div>
    </button>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 50%, #F0FDF4 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: 'inherit',
    }}>
      {/* Background circles */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(37,99,235,0.07) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(124,58,237,0.07) 0%, transparent 50%)`,
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 10px', fontSize: 22, boxShadow: '0 6px 18px rgba(37,99,235,0.25)',
          }}>📦</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>CoreInventory</h1>
          <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Warehouse Management Portal</p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: 20,
          boxShadow: '0 8px 40px rgba(15,23,41,0.12)',
          border: '1px solid #e5e7eb', overflow: 'hidden',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', padding: '20px 32px 0', borderBottom: '1.5px solid #f0f0f0' }}>
            {TABS.map((label, i) => (
              <button
                key={i}
                onClick={() => switchTab(i)}
                style={{
                  flex: 1, padding: '8px 0', fontSize: 13, fontWeight: 600,
                  color: tab === i ? '#2563EB' : '#9ca3af',
                  background: 'none', border: 'none',
                  borderBottom: tab === i ? '2px solid #2563EB' : '2px solid transparent',
                  cursor: 'pointer', transition: 'all 0.2s', marginBottom: -1.5,
                }}
              >{label}</button>
            ))}
          </div>

          {/* Sliding panels */}
          <div style={{
            height: panelHeight,
            transition: 'height 0.35s cubic-bezier(0.4,0,0.2,1)',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <div style={{
              display: 'flex',
              transform: `translateX(-${tab * 100}%)`,
              transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
              alignItems: 'flex-start',
            }}>

              {/* ── SIGN IN ── */}
              <div ref={panelRefs[0]} style={{ minWidth: '100%', padding: '24px 32px 28px', flexShrink: 0, boxSizing: 'border-box' }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Welcome back</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Sign in to your account.</div>
                <form onSubmit={doLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Email Address</label>
                    <input
                      type="email" required value={liEmail} onChange={e => setLiEmail(e.target.value)}
                      placeholder="you@example.com" style={inputStyle}
                      onFocus={focusStyle} onBlur={blurStyle}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>Password</label>
                      <button type="button" onClick={() => switchTab(2)} style={{ background: 'none', border: 'none', fontSize: 12, color: '#2563EB', cursor: 'pointer', fontWeight: 600 }}>
                        Forgot password?
                      </button>
                    </div>
                    <input
                      type="password" required value={liPass} onChange={e => setLiPass(e.target.value)}
                      placeholder="••••••••" style={inputStyle}
                      onFocus={focusStyle} onBlur={blurStyle}
                    />
                  </div>
                  {msgBox(liMsg)}
                  <button type="submit" style={{
                    width: '100%', padding: 12, background: '#2563EB', color: '#fff',
                    border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
                    cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                  }}>Sign In</button>
                </form>
              </div>

              {/* ── SIGN UP ── */}
              <div ref={panelRefs[1]} style={{ minWidth: '100%', padding: '24px 32px 28px', flexShrink: 0, boxSizing: 'border-box' }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Create account</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Choose your role and register.</div>
                <form onSubmit={doSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Role buttons */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {roleBtn('staff', '🏗️', 'Warehouse Staff', 'Manage stock & shipments', suRole === 'staff', () => setSuRole('staff'))}
                    {roleBtn('manager', '📋', 'Inventory Manager', 'Oversee & report', suRole === 'manager', () => setSuRole('manager'))}
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Full Name</label>
                    <input
                      type="text" required value={suName} onChange={e => setSuName(e.target.value)}
                      placeholder="John Doe" style={inputStyle}
                      onFocus={focusStyle} onBlur={blurStyle}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Email Address</label>
                    <input
                      type="email" required value={suEmail} onChange={e => setSuEmail(e.target.value)}
                      placeholder="you@example.com" style={inputStyle}
                      onFocus={focusStyle} onBlur={blurStyle}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Password</label>
                    <input
                      type="password" required value={suPass} onChange={e => setSuPass(e.target.value)}
                      placeholder="Min. 8 characters" style={inputStyle}
                      onFocus={focusStyle} onBlur={blurStyle}
                    />
                  </div>
                  {msgBox(suMsg)}
                  <button type="submit" style={{
                    width: '100%', padding: 12, background: '#2563EB', color: '#fff',
                    border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
                    cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                  }}>Create Account</button>
                </form>
              </div>

              {/* ── RESET PASSWORD ── */}
              <div ref={panelRefs[2]} style={{ minWidth: '100%', padding: '24px 32px 28px', flexShrink: 0, boxSizing: 'border-box' }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Reset password</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
                  {rpStep === 1 ? 'Enter your registered email address.' : `OTP sent to ${rpEmail}`}
                </div>

                {rpStep === 1 ? (
                  <form onSubmit={sendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Email Address</label>
                      <input
                        type="email" required value={rpEmail} onChange={e => setRpEmail(e.target.value)}
                        placeholder="you@example.com" style={inputStyle}
                        onFocus={focusStyle} onBlur={blurStyle}
                      />
                    </div>
                    {rpErr && (
                      <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>{rpErr}</div>
                    )}
                    <button type="submit" style={{
                      width: '100%', padding: 12, background: '#2563EB', color: '#fff',
                      border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
                      cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                    }}>Send OTP</button>
                  </form>
                ) : (
                  <form onSubmit={verifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ textAlign: 'center' }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 10, textAlign: 'center' }}>
                        Enter OTP &nbsp;<span style={{ color: '#2563EB' }}>(Demo: 123456)</span>
                      </label>
                      <input
                        type="text" maxLength={6} required value={rpOtp} onChange={e => setRpOtp(e.target.value)}
                        placeholder="——————"
                        style={{
                          width: '100%', padding: '12px 14px', textAlign: 'center',
                          border: '2px solid #e5e7eb', borderRadius: 10,
                          fontSize: 22, fontFamily: 'monospace', fontWeight: 700,
                          outline: 'none', letterSpacing: '0.2em', boxSizing: 'border-box',
                        }}
                        onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                        onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                    {msgBox(rpOtpMsg)}
                    <button type="submit" style={{
                      width: '100%', padding: 12, background: '#2563EB', color: '#fff',
                      border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
                      cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                    }}>Verify OTP</button>
                    <button type="button" onClick={resetRp} style={{
                      background: 'none', border: 'none', fontSize: 12, color: '#2563EB',
                      cursor: 'pointer', fontWeight: 600, textAlign: 'center',
                    }}>← Use a different email</button>
                  </form>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}