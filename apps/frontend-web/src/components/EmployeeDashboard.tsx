import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../services/api-client';
import { translations, Language } from '../services/translations';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1').replace('/api/v1', '');

function getProfilePicUrl(url: string | null | undefined) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
}

interface EmployeeDashboardProps {
  user: {
    id: string;
    email: string;
    roles: string[];
    profilePictureUrl?: string | null;
    isFirstLogin?: boolean;
    isHRManager?: boolean;
  };
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  colorTheme: string;
  setColorTheme: (c: string) => void;
  lang: Language;
  setLang: (l: Language) => void;
}

const COLORS = [
  { id: 'blue', hex: '#2563eb' },
  { id: 'green', hex: '#0d9488' },
  { id: 'purple', hex: '#8b5cf6' },
  { id: 'orange', hex: '#ea580c' },
  { id: 'red', hex: '#e11d48' },
  { id: 'pink', hex: '#db2777' },
  { id: 'teal', hex: '#0891b2' },
];

export function EmployeeDashboard({
  user,
  onLogout,
  theme,
  toggleTheme,
  colorTheme,
  setColorTheme,
  lang,
  setLang,
}: EmployeeDashboardProps) {
  const isRtl = lang === 'ar';
  const t = translations[lang];

  const [activeSection, setActiveSection] = useState(user.isHRManager ? 'employees-management' : 'overview');
  const [showSettings, setShowSettings] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showFarewell, setShowFarewell] = useState(false);

  // Profile
  const [empProfile, setEmpProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [picUrl, setPicUrl] = useState<string | null>(getProfilePicUrl(user.profilePictureUrl));
  const [displayName, setDisplayName] = useState(user.email);
  const [settingUsername, setSettingUsername] = useState(user.email);
  const [settingNewPass, setSettingNewPass] = useState('');
  const [settingConfirmPass, setSettingConfirmPass] = useState('');
  const [showSNP, setShowSNP] = useState(false);
  const [showSCP, setShowSCP] = useState(false);
  const [settingMsg, setSettingMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const picRef = useRef<HTMLInputElement>(null);

  // First login
  const [showFirstLogin, setShowFirstLogin] = useState(false);
  const [fl_pass, setFl_pass] = useState('');
  const [fl_confirm, setFl_confirm] = useState('');
  const [fl_showPass, setFl_showPass] = useState(false);
  const [fl_showConfirm, setFl_showConfirm] = useState(false);
  const [fl_error, setFl_error] = useState('');
  const [fl_submitting, setFl_submitting] = useState(false);
  const [fl_done, setFl_done] = useState(false);

  // Messaging
  const [thread, setThread] = useState<any>(null);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // HR Manager: Employees
  const [employees, setEmployees] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [isLoadingEmps, setIsLoadingEmps] = useState(false);
  const [empFormMode, setEmpFormMode] = useState<'ADD' | 'EDIT' | null>(null);
  const [editingEmp, setEditingEmp] = useState<any>(null);
  const [isSavingEmp, setIsSavingEmp] = useState(false);
  const [empLightbox, setEmpLightbox] = useState<string | null>(null);
  const [empForm, setEmpForm] = useState<Record<string, any>>({});

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Load profile
  useEffect(() => {
    (async () => {
      setIsLoadingProfile(true);
      try {
        const res = await apiClient.get('/auth/me');
        const d = res.data;
        setEmpProfile(d);
        setDisplayName(d.username || user.email);
        setSettingUsername(d.username || user.email);
        setPicUrl(getProfilePicUrl(d.employee_picture_url) || getProfilePicUrl(user.profilePictureUrl));
        if (d.isFirstLogin) setTimeout(() => setShowFirstLogin(true), 2500);
        if (d.has_employee_unread) setHasUnread(true);
      } catch (e) { console.error(e); }
      finally { setIsLoadingProfile(false); }
    })();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  // Fetch thread
  const fetchThread = async (silent = false) => {
    if (!silent) setIsLoadingThread(true);
    try {
      const res = await apiClient.get('/messages/active');
      setThread(res.data);
      if (res.data?.has_employee_unread) setHasUnread(true);
    } catch { setThread(null); }
    finally { if (!silent) setIsLoadingThread(false); }
  };

  useEffect(() => {
    fetchThread();
    const iv = setInterval(() => fetchThread(true), 4000);
    return () => clearInterval(iv);
  }, []);

  // Fetch employees for HR manager
  const fetchEmployees = async () => {
    setIsLoadingEmps(true);
    try {
      const [er, dr] = await Promise.all([apiClient.get('/employees'), apiClient.get('/departments')]);
      setEmployees(er.data);
      setDepts(dr.data);
    } catch { triggerToast(lang === 'ar' ? 'فشل تحميل الموظفين' : 'Failed to load employees.'); }
    finally { setIsLoadingEmps(false); }
  };

  useEffect(() => { if (user.isHRManager) fetchEmployees(); }, [user.isHRManager]);

  // First login submit
  const handleFirstLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFl_error('');
    if (fl_pass.length < 6) { setFl_error(lang === 'ar' ? 'كلمة المرور 6 أحرف على الأقل' : 'Password must be at least 6 characters.'); return; }
    if (fl_pass !== fl_confirm) { setFl_error(lang === 'ar' ? 'كلمتا المرور لا تتطابقان' : 'Passwords do not match.'); return; }
    setFl_submitting(true);
    try {
      await apiClient.post('/auth/profile', { username: displayName, password: fl_pass });
      setFl_done(true);
      setTimeout(() => { setShowFarewell(true); setTimeout(onLogout, 3000); }, 2000);
    } catch (err: any) {
      setFl_error(err?.response?.data?.message || (lang === 'ar' ? 'فشل تغيير كلمة المرور' : 'Failed to change password.'));
    } finally { setFl_submitting(false); }
  };

  // Messaging
  const handleRequestMsg = async () => {
    try {
      const res = await apiClient.post('/messages/request');
      setThread(res.data);
      triggerToast(lang === 'ar' ? 'تم إرسال الطلب' : 'Request sent to admin.');
    } catch { triggerToast(lang === 'ar' ? 'فشل إرسال الطلب' : 'Failed.'); }
  };

  const handleSendMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim() || !thread) return;
    setIsSendingMsg(true);
    try {
      const res = await apiClient.post('/messages/employee/send', { threadId: thread.id, text: msgText });
      setThread(res.data);
      setMsgText('');
    } catch { triggerToast(lang === 'ar' ? 'فشل الإرسال' : 'Failed to send.'); }
    finally { setIsSendingMsg(false); }
  };

  const markRead = async () => {
    if (!thread) return;
    try {
      await apiClient.post(`/messages/employee/mark-read/${thread.id}`);
      setHasUnread(false);
      setThread((p: any) => p ? { ...p, has_employee_unread: false } : p);
    } catch {}
  };

  // Settings
  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingMsg(null);
    if (settingNewPass && settingNewPass !== settingConfirmPass) {
      setSettingMsg({ type: 'error', text: lang === 'ar' ? 'كلمتا المرور لا تتطابقان' : 'Passwords do not match.' });
      return;
    }
    try {
      await apiClient.post('/auth/profile', { username: settingUsername, ...(settingNewPass ? { password: settingNewPass } : {}) });
      setDisplayName(settingUsername);
      setSettingNewPass(''); setSettingConfirmPass('');
      setSettingMsg({ type: 'success', text: lang === 'ar' ? 'تم التحديث بنجاح' : 'Profile updated successfully.' });
    } catch (err: any) {
      setSettingMsg({ type: 'error', text: err?.response?.data?.message || 'Failed.' });
    }
  };

  const handlePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setIsUploading(true);
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await apiClient.post('/storage/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = res.data.url || res.data.path;
      setPicUrl(getProfilePicUrl(url) || url);
      await apiClient.post('/auth/profile', { username: displayName, profilePictureUrl: url });
      triggerToast(lang === 'ar' ? 'تم تحديث الصورة' : 'Photo updated.');
    } catch { triggerToast(lang === 'ar' ? 'فشل رفع الصورة' : 'Upload failed.'); }
    finally { setIsUploading(false); }
  };

  // HR Manager employee form
  const openAdd = () => {
    setEmpForm({ english_first_name: '', english_last_name: '', arabic_first_name: '', arabic_last_name: '', english_middle_name: '', arabic_middle_name: '', email: '', phone_number: '', gender: 'Male', date_of_birth: '', employment_type: 'Doctor', salary: '', department_id: '', username: '', password: '' });
    setEditingEmp(null); setEmpFormMode('ADD');
  };

  const openEdit = (emp: any) => {
    setEmpForm({ english_first_name: emp.english_first_name || '', english_middle_name: emp.english_middle_name || '', english_last_name: emp.english_last_name || '', arabic_first_name: emp.arabic_first_name || '', arabic_middle_name: emp.arabic_middle_name || '', arabic_last_name: emp.arabic_last_name || '', email: emp.email || '', phone_number: emp.phone_number || '', gender: emp.gender || 'Male', date_of_birth: emp.date_of_birth ? String(emp.date_of_birth).split('T')[0] : '', employment_type: emp.employment_type || 'Doctor', salary: emp.salary || '', department_id: emp.department_id || '', username: emp.username || '', password: '' });
    setEditingEmp(emp); setEmpFormMode('EDIT');
  };

  const handleSaveEmp = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSavingEmp(true);
    try {
      const payload: any = { ...empForm };
      if (payload.salary) payload.salary = parseFloat(payload.salary);
      if (payload.department_id) payload.department_id = parseInt(payload.department_id, 10);
      if (!payload.password) delete payload.password;
      if (empFormMode === 'ADD') { await apiClient.post('/employees', payload); triggerToast(lang === 'ar' ? 'تمت الإضافة' : 'Employee added.'); }
      else { await apiClient.patch(`/employees/${editingEmp.employee_id}`, payload); triggerToast(lang === 'ar' ? 'تم التحديث' : 'Employee updated.'); }
      setEmpFormMode(null); setEditingEmp(null); fetchEmployees();
    } catch (err: any) { triggerToast(err?.response?.data?.message || 'Failed.'); }
    finally { setIsSavingEmp(false); }
  };

  const handleLogout = () => { setShowFarewell(true); setTimeout(onLogout, 2800); };

  const navItems = [
    ...(user.isHRManager ? [{ id: 'employees-management', label: lang === 'ar' ? '👥 إدارة الموظفين' : '👥 Employees Management', desc: lang === 'ar' ? 'إضافة وتحرير الموظفين' : 'Add and edit employees' }] : []),
    { id: 'overview', label: lang === 'ar' ? '🏥 نظرة عامة' : '🏥 Overview', desc: lang === 'ar' ? 'لوحة التحكم' : 'Your dashboard' },
    { id: 'salary', label: lang === 'ar' ? '💰 الراتب' : '💰 Salary', desc: lang === 'ar' ? 'راتبك الحالي' : 'Your current salary' },
    { id: 'schedule', label: lang === 'ar' ? '📅 الجدول' : '📅 Schedule', desc: lang === 'ar' ? 'جدول العمل' : 'Work schedule' },
    { id: 'messages', label: lang === 'ar' ? '💬 الرسائل' : '💬 Messages', desc: lang === 'ar' ? 'التواصل مع المدير' : 'Contact admin', badge: hasUnread },
    { id: 'coming-soon', label: lang === 'ar' ? '🚀 قريباً' : '🚀 Coming Soon', desc: lang === 'ar' ? 'ميزات قادمة' : 'Future features' },
  ];

  const fmtSalary = (n: number) => Number(n).toLocaleString('en-US', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 });

  const threadMessages = thread ? JSON.parse(thread.messages || '[]') : [];
  const threadStatus = thread?.status;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', direction: isRtl ? 'rtl' : 'ltr', position: 'relative' }}>

      {/* Toast */}
      {toastMsg && (
        <div style={{ position: 'fixed', bottom: '28px', [isRtl ? 'left' : 'right']: '28px', background: 'hsl(var(--accent-blue))', color: '#fff', padding: '12px 22px', borderRadius: '12px', fontWeight: 600, fontSize: '0.9rem', zIndex: 9999, boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
          {toastMsg}
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div onClick={() => setLightboxUrl(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={lightboxUrl} alt="preview" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '12px' }} />
        </div>
      )}
      {empLightbox && (
        <div onClick={() => setEmpLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={empLightbox} alt="emp" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '12px' }} />
        </div>
      )}

      {/* Welcome */}
      {showWelcome && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'hsl(var(--bg-primary))', animation: 'fadeOut 0.6s ease 1.8s forwards' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '16px' }}>👋</span>
            <h1 className="text-gradient" style={{ fontSize: '2.4rem', fontWeight: 800 }}>
              {lang === 'ar' ? `مرحباً، ${empProfile?.english_first_name || ''}` : `Welcome, ${empProfile?.english_first_name || user.email}`}
            </h1>
            <p style={{ color: 'hsl(var(--text-secondary))' }}>{lang === 'ar' ? 'جارٍ تحميل لوحة التحكم...' : 'Loading your dashboard...'}</p>
          </div>
        </div>
      )}

      {/* Farewell */}
      {showFarewell && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'hsl(var(--bg-primary))' }}>
          <div className="glass-panel" style={{ textAlign: 'center', padding: '50px', maxWidth: '480px', borderRadius: '20px' }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '16px' }}>👋</span>
            <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>{lang === 'ar' ? 'وداعاً!' : 'Goodbye!'}</h1>
            <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '8px' }}>{lang === 'ar' ? `إلى اللقاء، ${displayName}` : `See you soon, ${displayName}`}</p>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem' }}>{lang === 'ar' ? 'جارٍ إعادة التوجيه...' : 'Redirecting to login...'}</p>
            <div style={{ margin: '26px auto 0', width: '26px', height: '26px', border: '3px solid hsla(var(--accent-blue), 0.1)', borderTopColor: 'hsl(var(--accent-blue))', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        </div>
      )}

      {/* First-Login Overlay */}
      {showFirstLogin && !fl_done && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9500, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '40px', borderRadius: '20px', border: '1px solid hsla(var(--accent-blue), 0.3)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>🔐</span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px' }}>{lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Your Password'}</h2>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>
                {lang === 'ar' ? 'هذا أول تسجيل دخول. يرجى تعيين كلمة مرور جديدة.' : 'This is your first login. Please set a new password to continue.'}
              </p>
            </div>
            <form onSubmit={handleFirstLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'hsl(var(--text-secondary))' }}>{lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}</label>
                <div style={{ position: 'relative' }}>
                  <input type={fl_showPass ? 'text' : 'password'} className="form-input" placeholder={lang === 'ar' ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'} value={fl_pass} onChange={e => setFl_pass(e.target.value)} autoFocus style={{ paddingRight: isRtl ? '14px' : '46px', paddingLeft: isRtl ? '46px' : '14px' }} />
                  <button type="button" onClick={() => setFl_showPass(p => !p)} style={{ position: 'absolute', right: isRtl ? 'auto' : '14px', left: isRtl ? '14px' : 'auto', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-muted))', fontSize: '1rem' }}>
                    {fl_showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'hsl(var(--text-secondary))' }}>{lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
                <div style={{ position: 'relative' }}>
                  <input type={fl_showConfirm ? 'text' : 'password'} className="form-input" placeholder={lang === 'ar' ? 'أعد إدخال كلمة المرور' : 'Confirm password'} value={fl_confirm} onChange={e => setFl_confirm(e.target.value)} style={{ paddingRight: isRtl ? '14px' : '46px', paddingLeft: isRtl ? '46px' : '14px' }} />
                  <button type="button" onClick={() => setFl_showConfirm(p => !p)} style={{ position: 'absolute', right: isRtl ? 'auto' : '14px', left: isRtl ? '14px' : 'auto', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-muted))', fontSize: '1rem' }}>
                    {fl_showConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              {fl_error && <div style={{ padding: '10px 14px', background: 'hsla(var(--danger), 0.1)', border: '1px solid hsla(var(--danger), 0.3)', borderRadius: '8px', color: 'hsl(var(--danger))', fontSize: '0.85rem' }}>{fl_error}</div>}
              <button type="submit" className="btn-primary" disabled={fl_submitting} style={{ padding: '14px', fontWeight: 700 }}>
                {fl_submitting ? (lang === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (lang === 'ar' ? 'تعيين كلمة المرور والمتابعة' : 'Set Password & Continue')}
              </button>
            </form>
          </div>
        </div>
      )}

      {fl_done && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9500, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ textAlign: 'center', padding: '50px', maxWidth: '420px', borderRadius: '20px' }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '16px' }}>✅</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '10px' }}>{lang === 'ar' ? 'تم تغيير كلمة المرور!' : 'Password Changed!'}</h2>
            <p style={{ color: 'hsl(var(--text-secondary))' }}>{lang === 'ar' ? 'يرجى تسجيل الدخول مجدداً.' : 'Please log in again with your new password.'}</p>
            <div style={{ margin: '24px auto 0', width: '26px', height: '26px', border: '3px solid hsla(var(--success), 0.1)', borderTopColor: 'hsl(var(--success))', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="glass-panel" style={{ width: '300px', borderRadius: '0', borderLeft: isRtl ? '1px solid hsl(var(--border-color))' : 'none', borderRight: isRtl ? 'none' : '1px solid hsl(var(--border-color))', borderTop: 'none', borderBottom: 'none', padding: '28px 18px', display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 10, height: '100vh', position: 'sticky', top: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'linear-gradient(135deg, hsla(var(--accent-blue), 0.08), hsla(var(--accent-teal), 0.08))', border: '1px solid hsla(var(--accent-blue), 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '1.4rem' }}>🏥</span>
          </div>
          <div>
            <h2 className="text-gradient" style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t.brandName}</h2>
            <p style={{ fontSize: '0.68rem', color: 'hsl(var(--accent-blue))', fontWeight: 600, letterSpacing: '0.05em' }}>{lang === 'ar' ? 'بوابة الموظف' : 'EMPLOYEE PORTAL'}</p>
          </div>
        </div>
        <div style={{ borderBottom: '1px solid hsl(var(--border-color))' }} />
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, overflowY: 'auto' }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveSection(item.id); setShowSettings(false); }} className="sidebar-nav-btn" style={{ width: '100%', padding: '11px 13px', textAlign: isRtl ? 'right' : 'left', background: activeSection === item.id && !showSettings ? 'hsla(var(--accent-blue), 0.08)' : 'transparent', border: '1px solid', borderColor: activeSection === item.id && !showSettings ? 'hsla(var(--accent-blue), 0.2)' : 'transparent', borderRadius: '10px', color: activeSection === item.id && !showSettings ? 'hsl(var(--accent-blue))' : 'hsl(var(--text-secondary))', cursor: 'pointer', transition: 'var(--transition-smooth)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>{item.label}</div>
                {item.badge && <span style={{ backgroundColor: 'hsl(var(--danger))', color: 'white', borderRadius: '10px', padding: '1px 6px', fontSize: '0.65rem', fontWeight: 700 }}>!</span>}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>{item.desc}</div>
            </button>
          ))}
        </nav>
        <div className="glass-panel" style={{ padding: '14px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'hsla(var(--accent-blue), 0.1)', border: '1px solid hsla(var(--accent-blue), 0.25)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {picUrl ? <img src={picUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>👤</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0, textAlign: isRtl ? 'right' : 'left' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'hsl(var(--accent-blue))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
              <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))' }}>{user.isHRManager ? (lang === 'ar' ? 'مدير الموارد البشرية' : 'HR Manager') : (lang === 'ar' ? 'موظف' : 'Employee')}</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
            {COLORS.map(c => <button key={c.id} onClick={() => setColorTheme(c.id)} style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: c.hex, border: colorTheme === c.id ? '2.5px solid hsl(var(--text-primary))' : '1.5px solid transparent', cursor: 'pointer', padding: 0, transform: colorTheme === c.id ? 'scale(1.25)' : 'none', transition: 'transform 0.2s' }} title={c.id} />)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button className="btn-secondary" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} style={{ padding: '7px', fontSize: '0.78rem', fontWeight: 600 }}>{lang === 'en' ? '🌐 العربية' : '🌐 English'}</button>
            <button className="btn-secondary" onClick={toggleTheme} style={{ padding: '7px', fontSize: '0.78rem', fontWeight: 600 }}>{theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}</button>
            <button className="btn-secondary" onClick={() => { setShowSettings(true); setActiveSection(''); }} style={{ padding: '7px', fontSize: '0.78rem', fontWeight: 600 }}>⚙️ {lang === 'ar' ? 'الإعدادات' : 'Settings'}</button>
            <button className="btn-secondary" onClick={handleLogout} style={{ padding: '7px', fontSize: '0.78rem', fontWeight: 600, color: 'hsl(var(--danger))' }}>🚪 {lang === 'ar' ? 'خروج' : 'Sign Out'}</button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        {/* Top Nav */}
        <header className="glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: isRtl ? 'row-reverse' : 'row', position: 'sticky', top: 0, zIndex: 9 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'hsl(var(--success))' }} />
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>
              {empProfile ? `${empProfile.english_first_name || ''} ${empProfile.english_last_name || ''}`.trim() || user.email : user.email}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
            <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: 600 }}>{lang === 'en' ? '🌐 AR' : '🌐 EN'}</button>
            <button onClick={toggleTheme} className="btn-secondary" style={{ padding: '6px 10px' }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
            <button onClick={() => { setShowSettings(true); setActiveSection(''); }} className="btn-secondary" style={{ padding: '6px 10px' }}>⚙️</button>
            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem', color: 'hsl(var(--danger))' }}>{lang === 'ar' ? 'خروج' : 'Sign Out'}</button>
          </div>
        </header>

        <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>

          {/* Settings */}
          {showSettings && (
            <div style={{ maxWidth: '540px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                <h2 className="text-gradient" style={{ fontSize: '1.8rem' }}>{lang === 'ar' ? 'إعدادات الملف الشخصي' : 'Profile Settings'}</h2>
                <button onClick={() => setShowSettings(false)} className="btn-secondary" style={{ padding: '8px 16px' }}>{lang === 'ar' ? '✕ إغلاق' : '✕ Close'}</button>
              </div>
              <div className="glass-panel" style={{ padding: '28px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                <div onClick={() => picUrl && setLightboxUrl(picUrl)} style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'hsla(var(--accent-blue), 0.1)', border: '2px solid hsla(var(--accent-blue), 0.3)', overflow: 'hidden', cursor: picUrl ? 'pointer' : 'default', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {picUrl ? <img src={picUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '2.2rem' }}>👤</span>}
                </div>
                <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>{displayName}</div>
                  <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-muted))', marginBottom: '12px' }}>{user.isHRManager ? 'HR Manager' : 'Employee'}</div>
                  <button onClick={() => picRef.current?.click()} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} disabled={isUploading}>{isUploading ? '...' : (lang === 'ar' ? 'تغيير الصورة' : 'Change Photo')}</button>
                  <input ref={picRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePicUpload} />
                </div>
              </div>
              <div className="glass-panel" style={{ padding: '28px' }}>
                <form onSubmit={handleSettingsSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'hsl(var(--text-secondary))' }}>{lang === 'ar' ? 'اسم المستخدم' : 'Username'}</label>
                    <input type="text" className="form-input" value={settingUsername} onChange={e => setSettingUsername(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'hsl(var(--text-secondary))' }}>{lang === 'ar' ? 'كلمة مرور جديدة' : 'New Password (blank to keep current)'}</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showSNP ? 'text' : 'password'} className="form-input" value={settingNewPass} onChange={e => setSettingNewPass(e.target.value)} placeholder="••••••••" style={{ paddingRight: isRtl ? '14px' : '46px', paddingLeft: isRtl ? '46px' : '14px' }} />
                      <button type="button" onClick={() => setShowSNP(p => !p)} style={{ position: 'absolute', right: isRtl ? 'auto' : '14px', left: isRtl ? '14px' : 'auto', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-muted))' }}>{showSNP ? '🙈' : '👁️'}</button>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'hsl(var(--text-secondary))' }}>{lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showSCP ? 'text' : 'password'} className="form-input" value={settingConfirmPass} onChange={e => setSettingConfirmPass(e.target.value)} placeholder="••••••••" style={{ paddingRight: isRtl ? '14px' : '46px', paddingLeft: isRtl ? '46px' : '14px' }} />
                      <button type="button" onClick={() => setShowSCP(p => !p)} style={{ position: 'absolute', right: isRtl ? 'auto' : '14px', left: isRtl ? '14px' : 'auto', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-muted))' }}>{showSCP ? '🙈' : '👁️'}</button>
                    </div>
                  </div>
                  {settingMsg && <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', background: `hsla(var(--${settingMsg.type === 'success' ? 'success' : 'danger'}), 0.1)`, border: `1px solid hsla(var(--${settingMsg.type === 'success' ? 'success' : 'danger'}), 0.3)`, color: `hsl(var(--${settingMsg.type === 'success' ? 'success' : 'danger'}))` }}>{settingMsg.text}</div>}
                  <button type="submit" className="btn-primary" style={{ padding: '12px', fontWeight: 700 }}>{lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}</button>
                </form>
              </div>
            </div>
          )}

          {/* Overview */}
          {activeSection === 'overview' && !showSettings && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div>
                <h2 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '6px' }}>
                  {lang === 'ar' ? `مرحباً، ${empProfile?.arabic_first_name || empProfile?.english_first_name || ''}!` : `Welcome, ${empProfile?.english_first_name || user.email}!`}
                </h2>
                <p style={{ color: 'hsl(var(--text-secondary))' }}>{lang === 'ar' ? 'هذه لوحة تحكم الموظف.' : 'This is your employee dashboard.'}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                {[
                  { label: lang === 'ar' ? 'الوظيفة' : 'Position', val: empProfile?.employment_type },
                  { label: lang === 'ar' ? 'اللقب' : 'Title', val: empProfile?.title || (lang === 'ar' ? 'لا يوجد' : 'None') },
                  { label: lang === 'ar' ? 'حالة الحساب' : 'Status', val: lang === 'ar' ? '● نشط' : '● Active', color: 'hsl(var(--success))' },
                ].map((c, i) => (
                  <div key={i} className="glass-panel" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{c.label}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: c.color || 'hsl(var(--accent-blue))' }}>{isLoadingProfile ? '...' : (c.val || '—')}</div>
                  </div>
                ))}
              </div>
              {empProfile && (
                <div className="glass-panel" style={{ padding: '28px' }}>
                  <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>{lang === 'ar' ? 'معلوماتي' : 'My Information'}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {[
                      { label: lang === 'ar' ? 'الاسم الإنجليزي' : 'English Name', val: `${empProfile.english_first_name || ''} ${empProfile.english_last_name || ''}`.trim() },
                      { label: lang === 'ar' ? 'الاسم العربي' : 'Arabic Name', val: `${empProfile.arabic_first_name || ''} ${empProfile.arabic_last_name || ''}`.trim() },
                      { label: lang === 'ar' ? 'البريد الإلكتروني' : 'Email', val: empProfile.email },
                      { label: lang === 'ar' ? 'رقم الهاتف' : 'Phone', val: empProfile.phone_number || '—' },
                      { label: lang === 'ar' ? 'الجنس' : 'Gender', val: empProfile.gender || '—' },
                    ].map((r, i) => (
                      <div key={i}>
                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginBottom: '3px' }}>{r.label}</div>
                        <div style={{ fontWeight: 600, color: 'hsl(var(--accent-blue))' }}>{r.val || '—'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Salary */}
          {activeSection === 'salary' && !showSettings && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '600px' }}>
              <div>
                <h2 className="text-gradient" style={{ fontSize: '1.8rem', marginBottom: '6px' }}>{lang === 'ar' ? 'الراتب الحالي' : 'My Salary'}</h2>
                <p style={{ color: 'hsl(var(--text-secondary))' }}>{lang === 'ar' ? 'عرض بيانات راتبك.' : 'View your current salary information.'}</p>
              </div>
              <div className="glass-panel" style={{ padding: '44px', textAlign: 'center', background: 'linear-gradient(135deg, hsla(var(--accent-blue), 0.06), hsla(var(--accent-teal), 0.06))', border: '1px solid hsla(var(--accent-blue), 0.2)' }}>
                <div style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{lang === 'ar' ? 'الراتب الشهري' : 'Monthly Salary'}</div>
                {isLoadingProfile ? (
                  <div style={{ width: '32px', height: '32px', border: '3px solid hsla(var(--accent-blue), 0.1)', borderTopColor: 'hsl(var(--accent-blue))', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                ) : (
                  <div className="text-gradient" style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                    {empProfile?.salary != null ? fmtSalary(empProfile.salary) : '—'}
                  </div>
                )}
                <div style={{ marginTop: '14px', fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>{lang === 'ar' ? 'ريال سعودي' : 'Saudi Riyal (SAR)'}</div>
              </div>
              {empProfile && (
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h4 style={{ marginBottom: '16px', fontWeight: 700 }}>{lang === 'ar' ? 'تفاصيل' : 'Details'}</h4>
                  {[
                    { label: lang === 'ar' ? 'الراتب الأساسي' : 'Base Salary', val: empProfile.salary != null ? fmtSalary(empProfile.salary) : '—' },
                    { label: lang === 'ar' ? 'نوع التوظيف' : 'Employment Type', val: empProfile.employment_type || '—' },
                    { label: lang === 'ar' ? 'المسمى الوظيفي' : 'Title', val: empProfile.title || (lang === 'ar' ? 'لا يوجد' : 'None') },
                  ].map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid hsl(var(--border-color))', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                      <span style={{ color: 'hsl(var(--text-secondary))' }}>{r.label}</span>
                      <span style={{ fontWeight: 700, color: 'hsl(var(--accent-blue))' }}>{r.val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Schedule - Coming Soon */}
          {activeSection === 'schedule' && !showSettings && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '20px' }}>
              <span style={{ fontSize: '5rem' }}>📅</span>
              <h2 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 800 }}>{lang === 'ar' ? 'قريباً' : 'Coming Soon'}</h2>
              <p style={{ color: 'hsl(var(--text-secondary))', textAlign: 'center', maxWidth: '380px' }}>
                {lang === 'ar' ? 'ميزة الجدول الزمني قيد التطوير.' : 'The schedule feature is under development and will be available soon.'}
              </p>
            </div>
          )}

          {/* Messages */}
          {activeSection === 'messages' && !showSettings && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: 'calc(100vh - 160px)' }}>
              <div>
                <h2 className="text-gradient" style={{ fontSize: '1.8rem', marginBottom: '6px' }}>{lang === 'ar' ? 'الرسائل' : 'Messages'}</h2>
                <p style={{ color: 'hsl(var(--text-secondary))' }}>{lang === 'ar' ? 'تواصل مع المدير.' : 'Communicate with the admin.'}</p>
              </div>
              {isLoadingThread ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                  <div style={{ width: '30px', height: '30px', border: '3px solid hsla(var(--accent-blue), 0.1)', borderTopColor: 'hsl(var(--accent-blue))', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : !thread ? (
                <div className="glass-panel" style={{ padding: '50px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', flex: 1, justifyContent: 'center' }}>
                  <span style={{ fontSize: '4rem' }}>💬</span>
                  <h3 style={{ fontWeight: 700, fontSize: '1.3rem' }}>{lang === 'ar' ? 'لا توجد محادثة نشطة' : 'No Active Conversation'}</h3>
                  <p style={{ color: 'hsl(var(--text-secondary))', maxWidth: '360px' }}>{lang === 'ar' ? 'أرسل طلبًا للمدير لبدء محادثة.' : 'Send a request to the admin to start a conversation.'}</p>
                  <button className="btn-primary" onClick={handleRequestMsg} style={{ padding: '12px 28px', fontWeight: 700 }}>📨 {lang === 'ar' ? 'إرسال طلب مراسلة' : 'Request to Message Admin'}</button>
                </div>
              ) : (
                <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0, borderRadius: '16px' }}>
                  {/* Header */}
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid hsl(var(--border-color))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'hsl(var(--bg-secondary))', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                      <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                      <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
                        <div style={{ fontWeight: 700 }}>{lang === 'ar' ? 'المدير' : 'Admin'}</div>
                        <div style={{ fontSize: '0.75rem', color: threadStatus === 'PENDING' ? 'hsl(var(--warning))' : threadStatus === 'ACCEPTED' ? 'hsl(var(--success))' : threadStatus === 'DENIED' ? 'hsl(var(--danger))' : 'hsl(var(--text-muted))' }}>
                          {threadStatus === 'PENDING' ? (lang === 'ar' ? 'في انتظار الرد' : 'Awaiting response') : threadStatus === 'ACCEPTED' ? (lang === 'ar' ? 'محادثة نشطة' : 'Active conversation') : threadStatus === 'DENIED' ? (lang === 'ar' ? 'تم رفض الطلب' : 'Request denied') : (lang === 'ar' ? 'محادثة مغلقة' : 'Closed')}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Messages */}
                  <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }} onClick={markRead} onFocus={markRead}>
                    {threadStatus === 'PENDING' && threadMessages.length === 0 && (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '40px 20px' }}>
                        <span style={{ fontSize: '2.5rem' }}>⏳</span>
                        <p style={{ textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>{lang === 'ar' ? 'تم إرسال طلبك. انتظر رد المدير.' : 'Your request has been sent. Waiting for the admin to respond.'}</p>
                      </div>
                    )}
                    {threadMessages.map((msg: any, idx: number) => {
                      if (msg.isSystem) return <div key={idx} style={{ textAlign: 'center', fontStyle: 'italic', fontSize: '0.75rem', color: 'hsl(var(--text-muted))', margin: '8px 0' }}>{msg.text}</div>;
                      const isMyMsg = msg.sender === 'employee';
                      return (
                        <div key={idx} style={{ display: 'flex', justifyContent: isMyMsg ? 'flex-end' : 'flex-start' }}>
                          <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: isMyMsg ? (isRtl ? '16px 2px 16px 16px' : '2px 16px 16px 16px') : (isRtl ? '2px 16px 16px 16px' : '16px 2px 16px 16px'), backgroundColor: isMyMsg ? 'hsl(var(--accent-blue))' : 'hsla(var(--bg-tertiary), 0.6)', color: isMyMsg ? '#fff' : 'hsl(var(--text-primary))', border: isMyMsg ? 'none' : '1px solid hsla(var(--border-color), 0.5)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                            <div>{msg.text}</div>
                            <div style={{ fontSize: '0.65rem', textAlign: isMyMsg ? 'right' : 'left', color: isMyMsg ? 'rgba(255,255,255,0.7)' : 'hsl(var(--text-muted))', marginTop: '4px' }}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Input */}
                  {threadStatus === 'ACCEPTED' && (
                    <form onSubmit={handleSendMsg} style={{ padding: '14px 16px', borderTop: '1px solid hsl(var(--border-color))', display: 'flex', gap: '10px', backgroundColor: 'hsl(var(--bg-secondary))', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                      <input type="text" className="form-input" placeholder={lang === 'ar' ? 'اكتب رسالة...' : 'Type a message...'} value={msgText} onChange={e => setMsgText(e.target.value)} disabled={isSendingMsg} style={{ flex: 1 }} />
                      <button type="submit" className="btn-primary" disabled={isSendingMsg || !msgText.trim()} style={{ padding: '10px 20px' }}>{lang === 'ar' ? 'إرسال' : 'Send'}</button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Coming Soon */}
          {activeSection === 'coming-soon' && !showSettings && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '20px' }}>
              <span style={{ fontSize: '5rem' }}>🚀</span>
              <h2 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 800 }}>{lang === 'ar' ? 'قريباً' : 'Coming Soon'}</h2>
              <p style={{ color: 'hsl(var(--text-secondary))', textAlign: 'center', maxWidth: '380px' }}>{lang === 'ar' ? 'هذه الميزة قيد التطوير.' : 'This feature is under development. Stay tuned!'}</p>
            </div>
          )}

          {/* HR Manager: Employees Management */}
          {activeSection === 'employees-management' && !showSettings && user.isHRManager && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 className="text-gradient" style={{ fontSize: '1.8rem', marginBottom: '6px' }}>{lang === 'ar' ? 'إدارة الموظفين' : 'Employees Management'}</h2>
                <p style={{ color: 'hsl(var(--text-secondary))' }}>{lang === 'ar' ? 'إضافة وتحرير بيانات الموظفين.' : 'Add and edit employee profiles.'}</p>
              </div>
              <div>
                <button onClick={empFormMode === null ? openAdd : () => { setEmpFormMode(null); setEditingEmp(null); }} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  {empFormMode !== null ? (<><span>✕</span> {lang === 'ar' ? 'إلغاء' : 'CANCEL'}</>) : (<><span>+</span> {lang === 'ar' ? 'إضافة موظف' : 'ADD EMPLOYEE'}</>)}
                </button>
              </div>
              {empFormMode !== null && (
                <div className="glass-panel" style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: 700 }}>{empFormMode === 'ADD' ? (lang === 'ar' ? 'إضافة موظف جديد' : 'Add New Employee') : (lang === 'ar' ? 'تعديل الموظف' : 'Edit Employee')}</h3>
                  <form onSubmit={handleSaveEmp}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                      {[
                        { field: 'english_first_name', label: lang === 'ar' ? 'الاسم الأول (إنجليزي)' : 'First Name (EN)', required: true },
                        { field: 'english_middle_name', label: lang === 'ar' ? 'الاسم الأوسط (إنجليزي)' : 'Middle Name (EN)' },
                        { field: 'english_last_name', label: lang === 'ar' ? 'اسم العائلة (إنجليزي)' : 'Last Name (EN)', required: true },
                        { field: 'arabic_first_name', label: lang === 'ar' ? 'الاسم الأول (عربي)' : 'First Name (AR)', required: true },
                        { field: 'arabic_middle_name', label: lang === 'ar' ? 'الاسم الأوسط (عربي)' : 'Middle Name (AR)' },
                        { field: 'arabic_last_name', label: lang === 'ar' ? 'اسم العائلة (عربي)' : 'Last Name (AR)', required: true },
                        { field: 'email', label: lang === 'ar' ? 'البريد الإلكتروني' : 'Email', type: 'email', required: true },
                        { field: 'phone_number', label: lang === 'ar' ? 'رقم الهاتف' : 'Phone' },
                        { field: 'date_of_birth', label: lang === 'ar' ? 'تاريخ الميلاد' : 'Date of Birth', type: 'date', required: true },
                        { field: 'salary', label: lang === 'ar' ? 'الراتب' : 'Salary', type: 'number' },
                        { field: 'username', label: lang === 'ar' ? 'اسم المستخدم' : 'Username', required: empFormMode === 'ADD' },
                        { field: 'password', label: empFormMode === 'ADD' ? (lang === 'ar' ? 'كلمة المرور' : 'Password') : (lang === 'ar' ? 'كلمة مرور جديدة' : 'New Password'), type: 'password', required: empFormMode === 'ADD' },
                      ].map(f => (
                        <div key={f.field}>
                          <label style={{ display: 'block', fontSize: '0.82rem', color: 'hsl(var(--text-secondary))', marginBottom: '5px', fontWeight: 600 }}>{f.label}{f.required ? ' *' : ''}</label>
                          <input type={(f as any).type || 'text'} className="form-input" required={f.required} value={empForm[f.field] ?? ''} onChange={e => setEmpForm((p: any) => ({ ...p, [f.field]: e.target.value }))} />
                        </div>
                      ))}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', color: 'hsl(var(--text-secondary))', marginBottom: '5px', fontWeight: 600 }}>{lang === 'ar' ? 'الجنس' : 'Gender'} *</label>
                        <select className="form-input" value={empForm.gender || 'Male'} onChange={e => setEmpForm((p: any) => ({ ...p, gender: e.target.value }))}>
                          <option value="Male">{lang === 'ar' ? 'ذكر' : 'Male'}</option>
                          <option value="Female">{lang === 'ar' ? 'أنثى' : 'Female'}</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', color: 'hsl(var(--text-secondary))', marginBottom: '5px', fontWeight: 600 }}>{lang === 'ar' ? 'نوع الوظيفة' : 'Employment Type'} *</label>
                        <select className="form-input" value={empForm.employment_type || 'Doctor'} onChange={e => setEmpForm((p: any) => ({ ...p, employment_type: e.target.value }))}>
                          {['Doctor', 'Staff', 'Nurse', 'Pharmacist', 'Technician', 'Admin'].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', color: 'hsl(var(--text-secondary))', marginBottom: '5px', fontWeight: 600 }}>{lang === 'ar' ? 'القسم' : 'Department'}</label>
                        <select className="form-input" value={empForm.department_id || ''} onChange={e => setEmpForm((p: any) => ({ ...p, department_id: e.target.value }))}>
                          <option value="">{lang === 'ar' ? 'بدون قسم' : 'No Department'}</option>
                          {depts.map((d: any) => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => { setEmpFormMode(null); setEditingEmp(null); }} className="btn-secondary" style={{ padding: '10px 24px' }}>{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                      <button type="submit" className="btn-primary" disabled={isSavingEmp} style={{ padding: '10px 28px', fontWeight: 700 }}>{isSavingEmp ? '...' : (empFormMode === 'ADD' ? (lang === 'ar' ? 'إضافة' : 'Add') : (lang === 'ar' ? 'حفظ' : 'Save'))}</button>
                    </div>
                  </form>
                </div>
              )}
              <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                {isLoadingEmps ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <div style={{ width: '30px', height: '30px', border: '3px solid hsla(var(--accent-blue), 0.1)', borderTopColor: 'hsl(var(--accent-blue))', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : employees.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--text-muted))' }}>{lang === 'ar' ? 'لا يوجد موظفون' : 'No employees found.'}</div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left' }}>
                      <thead>
                        <tr style={{ background: 'hsla(var(--bg-tertiary), 0.5)', borderBottom: '1px solid hsl(var(--border-color))' }}>
                          {[lang === 'ar' ? 'الاسم' : 'Name', lang === 'ar' ? 'البريد' : 'Email', lang === 'ar' ? 'الوظيفة' : 'Type', lang === 'ar' ? 'اللقب' : 'Title', lang === 'ar' ? 'الراتب' : 'Salary', lang === 'ar' ? 'الإجراءات' : 'Actions'].map((h, i) => (
                            <th key={i} style={{ padding: '14px 16px', fontSize: '0.78rem', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {employees.map((emp: any) => (
                          <tr key={emp.employee_id} style={{ borderBottom: '1px solid hsla(var(--border-color), 0.5)' }}>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                                <div onClick={() => { const u = getProfilePicUrl(emp.employee_picture_url); if (u) setEmpLightbox(u); }} style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'hsla(var(--accent-blue), 0.1)', border: '1px solid hsla(var(--accent-blue), 0.2)', overflow: 'hidden', cursor: emp.employee_picture_url ? 'pointer' : 'default', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {emp.employee_picture_url ? <img src={getProfilePicUrl(emp.employee_picture_url) || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                                </div>
                                <span style={{ fontWeight: 600, color: 'hsl(var(--accent-blue))' }}>{emp.english_first_name} {emp.english_last_name}</span>
                              </div>
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'hsl(var(--accent-blue))' }}>{emp.email}</td>
                            <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'hsl(var(--accent-blue))' }}>{emp.employment_type}</td>
                            <td style={{ padding: '14px 16px', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--accent-blue))' }}>{emp.title || (lang === 'ar' ? 'لا يوجد' : 'none')}</td>
                            <td style={{ padding: '14px 16px', fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 600, color: 'hsl(var(--accent-blue))' }}>{emp.salary != null ? Number(emp.salary).toLocaleString('en-US') : '—'}</td>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', gap: '6px', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                                <button onClick={() => openEdit(emp)} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.78rem', fontWeight: 600, color: 'hsl(var(--accent-blue))', borderColor: 'hsla(var(--accent-blue), 0.3)' }}>{lang === 'ar' ? 'تعديل' : 'Edit'}</button>
                                <button onClick={() => alert(lang === 'ar' ? 'هذه الوظيفة للمدير فقط' : 'This functionality is admin only')} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.78rem', fontWeight: 600, color: 'hsl(var(--danger))', borderColor: 'hsla(var(--danger), 0.3)' }}>{lang === 'ar' ? 'حذف' : 'Delete'}</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
