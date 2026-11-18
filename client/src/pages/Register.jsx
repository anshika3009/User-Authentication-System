import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { s } from '../styles.js';

const STEPS = ['Account', 'Personal', 'About you', 'Review'];
const OCC = [
  { value: 'student', label: '🎓 Student', orgLabel: 'College / University' },
  { value: 'working', label: '💼 Working', orgLabel: 'Company' },
  { value: 'other', label: '✨ Other', orgLabel: 'Organization (optional)' },
];
const STRENGTH = [
  { t: 'Too weak', c: '#dc2626' }, { t: 'Weak', c: '#dc2626' }, { t: 'Okay', c: '#f59e0b' },
  { t: 'Good', c: '#16a34a' }, { t: 'Strong', c: '#15803d' },
];

// Password strength score from 0 to 4
function strength(p) {
  let n = 0;
  if (p.length >= 8) n++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) n++;
  if (/\d/.test(p)) n++;
  if (/[^A-Za-z0-9]/.test(p)) n++;
  return n;
}

function ageOf(dob) {
  const d = new Date(dob), t = new Date();
  let a = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a--;
  return a;
}

// Validates only the fields that belong to the current step
function validate(step, f) {
  const e = {};
  if (step === 0) {
    if (!f.name.trim()) e.name = 'Name is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter a valid email.';
    if (f.password.length < 8) e.password = 'At least 8 characters.';
    if (f.confirm !== f.password) e.confirm = 'Passwords do not match.';
  }
  if (step === 1) {
    if (!/^[6-9]\d{9}$/.test(f.phone)) e.phone = 'Enter a valid 10-digit mobile number.';
    if (!f.date_of_birth) e.date_of_birth = 'Date of birth is required.';
    else if (ageOf(f.date_of_birth) < 13 || ageOf(f.date_of_birth) > 120)
      e.date_of_birth = 'Enter a valid date of birth.';
    if (!f.city.trim()) e.city = 'City is required.';
  }
  if (step === 2) {
    if (!f.occupation) e.occupation = 'Please choose one.';
    if (f.bio.length > 300) e.bio = 'Max 300 characters.';
  }
  return e;
}

function Field({ label, error, children }) {
  return (
    <div>
      <label style={s.label}>{label}</label>
      {children}
      {error && <div style={{ ...s.err, fontSize: 13, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    name: '', email: '', password: '', confirm: '',
    phone: '', date_of_birth: '', city: '',
    occupation: '', organization: '', bio: '',
  });

  const set = (k, v) => { setF({ ...f, [k]: v }); setErrors({ ...errors, [k]: undefined }); };
  const occ = OCC.find((o) => o.value === f.occupation);
  const sc = strength(f.password);
  const today = new Date().toISOString().split('T')[0];

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Steps 1-3: validate and move to the next step
    if (step < 3) {
      const errs = validate(step, f);
      setErrors(errs);
      if (Object.keys(errs).length === 0) setStep(step + 1);
      return;
    }

    // Final step: send everything to the server
    setBusy(true);
    try {
      const { confirm, ...payload } = f;
      await api('/auth/register', 'POST', payload);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setServerError(err.message);
      if (err.message.toLowerCase().includes('email')) setStep(0); // e.g. "Email already registered"
    } finally {
      setBusy(false);
    }
  };

  const review = [
    ['Name', f.name], ['Email', f.email], ['Mobile', f.phone], ['Date of birth', f.date_of_birth],
    ['City', f.city], ['I am', occ?.label], [occ?.orgLabel || 'Organization', f.organization || '-'],
    ['Bio', f.bio || '-'],
  ];

  return (
    <div style={{ ...s.card, maxWidth: 480 }}>
      <h2 style={{ marginTop: 0 }}>Create your account</h2>

      {/* Progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        {STEPS.map((label, i) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 14, color: '#fff', margin: '0 auto',
                background: i <= step ? '#6366f1' : '#d1d5db',
              }}>{i < step ? '✓' : i + 1}</div>
              <div style={{ fontSize: 11, marginTop: 4, color: i === step ? '#111' : '#6b7280' }}>{label}</div>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, margin: '0 6px 16px', background: i < step ? '#6366f1' : '#d1d5db' }} />
            )}
          </div>
        ))}
      </div>

      {serverError && <p style={s.err}>{serverError}</p>}

      <form onSubmit={submit}>
        {/* Step 1: Account */}
        {step === 0 && (
          <>
            <Field label="Full name" error={errors.name}>
              <input style={s.input} value={f.name} onChange={(e) => set('name', e.target.value)} autoFocus />
            </Field>
            <Field label="Email" error={errors.email}>
              <input style={s.input} type="email" value={f.email} onChange={(e) => set('email', e.target.value)} />
            </Field>
            <Field label="Password" error={errors.password}>
              <input style={s.input} type={showPass ? 'text' : 'password'} value={f.password}
                onChange={(e) => set('password', e.target.value)} />
            </Field>
            {f.password && (
              <div style={{ marginTop: 6 }}>
                <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3 }}>
                  <div style={{
                    height: 6, borderRadius: 3, width: `${(sc / 4) * 100}%`,
                    background: STRENGTH[sc].c, transition: 'width .2s',
                  }} />
                </div>
                <span style={{ fontSize: 12, color: STRENGTH[sc].c }}>{STRENGTH[sc].t}</span>
              </div>
            )}
            <Field label="Confirm password" error={errors.confirm}>
              <input style={s.input} type={showPass ? 'text' : 'password'} value={f.confirm}
                onChange={(e) => set('confirm', e.target.value)} />
            </Field>
            <label style={{ fontSize: 13, display: 'block', marginTop: 10 }}>
              <input type="checkbox" checked={showPass} onChange={(e) => setShowPass(e.target.checked)} /> Show password
            </label>
          </>
        )}

        {/* Step 2: Personal details */}
        {step === 1 && (
          <>
            <Field label="Mobile number" error={errors.phone}>
              <input style={s.input} inputMode="numeric" maxLength={10} placeholder="10-digit number"
                value={f.phone} onChange={(e) => set('phone', e.target.value.replace(/\D/g, ''))} autoFocus />
            </Field>
            <Field label="Date of birth" error={errors.date_of_birth}>
              <input style={s.input} type="date" max={today} value={f.date_of_birth}
                onChange={(e) => set('date_of_birth', e.target.value)} />
            </Field>
            <Field label="City" error={errors.city}>
              <input style={s.input} value={f.city} onChange={(e) => set('city', e.target.value)} />
            </Field>
          </>
        )}

        {/* Step 3: About you */}
        {step === 2 && (
          <>
            <Field label="What do you do?" error={errors.occupation}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {OCC.map((o) => (
                  <button type="button" key={o.value} onClick={() => set('occupation', o.value)} style={{
                    flex: 1, minWidth: 110, padding: '12px 8px', borderRadius: 8, cursor: 'pointer', fontSize: 14,
                    border: f.occupation === o.value ? '2px solid #6366f1' : '1px solid #d1d5db',
                    background: f.occupation === o.value ? '#eef2ff' : '#fff',
                  }}>{o.label}</button>
                ))}
              </div>
            </Field>
            {occ && (
              <Field label={occ.orgLabel}>
                <input style={s.input} value={f.organization} onChange={(e) => set('organization', e.target.value)} />
              </Field>
            )}
            <Field label="Short bio (optional)" error={errors.bio}>
              <textarea style={{ ...s.input, minHeight: 80, resize: 'vertical', fontFamily: 'inherit' }}
                value={f.bio} onChange={(e) => set('bio', e.target.value)}
                placeholder="Tell us a bit about yourself" />
              <div style={{ ...s.muted, textAlign: 'right' }}>{f.bio.length}/300</div>
            </Field>
          </>
        )}

        {/* Step 4: Review */}
        {step === 3 && (
          <div>
            <p style={s.muted}>Please review your details before creating the account.</p>
            {review.map(([k, v]) => (
              <div key={k} style={{
                display: 'flex', justifyContent: 'space-between', gap: 12,
                padding: '8px 0', borderBottom: '1px solid #e5e7eb', fontSize: 14,
              }}>
                <span style={{ color: '#6b7280' }}>{k}</span>
                <span style={{ textAlign: 'right', wordBreak: 'break-word' }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          {step > 0 ? (
            <button type="button" style={{ ...s.btn, background: '#6b7280' }} onClick={() => setStep(step - 1)}>
              Back
            </button>
          ) : <span />}
          <button style={{ ...s.btn, opacity: busy ? 0.6 : 1 }} disabled={busy}>
            {step < 3 ? 'Next' : busy ? 'Creating...' : 'Create account'}
          </button>
        </div>
      </form>
    </div>
  );
}