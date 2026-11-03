import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { PageHeading, Button, Toggle } from '../../components/common';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storage.service';

export const SettingsScreen: React.FC = () => {
  const { notify, showConfirm, refreshData, theme, toggleTheme } = useApp();
  const [tab, setTab] = useState('General');
  const [settings, setSettings] = useState(() => storageService.getSettings());

  const handleSave = () => {
    storageService.saveSettings(settings);
    notify('School workspace settings saved successfully.');
  };

  const handleResetData = () => {
    showConfirm({
      title: 'Reset Application Data',
      message: 'Are you sure you want to reset all data to initial defaults? This will restore original examinations, student accounts, and assessment submissions.',
      type: 'danger',
      confirmText: 'Reset to Defaults',
      onConfirm: () => {
        storageService.resetToDefault();
        refreshData();
        notify('Demo data reset to defaults.');
      }
    });
  };

  return (
    <>
      <PageHeading
        title="Settings"
        desc="Manage school preferences, account security, and examination defaults."
        action={
          <Button kind="outline" onClick={handleResetData}>
            Reset Demo Data
          </Button>
        }
      />

      <div className="settings-grid">
        <div className="panel settings-menu">
          <b>SETTINGS</b>
          {['General', 'Examination defaults', 'Security', 'Notifications', 'Appearance'].map(
            t => (
              <button
                key={t}
                className={tab === t ? 'chosen' : ''}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            )
          )}
        </div>

        <div className="panel form-panel">
          <h3>{tab}</h3>
          <p className="muted">
            Configure {tab.toLowerCase()} preferences for your school workspace.
          </p>

          {tab === 'General' ? (
            <>
              <label>School name</label>
              <input
                className="field"
                value={settings.schoolName || 'Example Secondary School'}
                onChange={e => setSettings({ ...settings, schoolName: e.target.value })}
              />

              <div style={{ margin: '14px 0 16px', padding: '14px 16px', borderRadius: '8px', background: 'var(--bg-secondary, rgba(255,255,255,0.04))', border: '1px solid var(--border-color, rgba(255,255,255,0.08))' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ margin: 0, fontWeight: 700 }}>Academic Year Session</label>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#34d399', fontWeight: 600 }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }} />
                    Active Academic Session
                  </span>
                </div>
                <select
                  className="field"
                  value={settings.academicYear || '2026/2027'}
                  onChange={e => setSettings({ ...settings, academicYear: e.target.value })}
                >
                  <option value="2026/2027">2026/27 Academic Year</option>
                  <option value="2025/2026">2025/26 Academic Year</option>
                  <option value="2027/2028">2027/28 Academic Year</option>
                </select>
              </div>

              <label>Default language</label>
              <select
                className="field"
                value={settings.language || 'English'}
                onChange={e => setSettings({ ...settings, language: e.target.value })}
              >
                <option>English</option>
                <option>Amharic</option>
              </select>
            </>
          ) : tab === 'Examination defaults' ? (
            <>
              <label>Default examination duration</label>
              <input
                className="field"
                value={settings.defaultDuration || '60 minutes'}
                onChange={e => setSettings({ ...settings, defaultDuration: e.target.value })}
              />
              <Toggle
                label="Automatically submit when time expires"
                checked={settings.autoSubmit}
                onChange={v => setSettings({ ...settings, autoSubmit: v })}
              />
              <Toggle
                label="Release results only after teacher approval"
                checked={settings.requireApproval}
                onChange={v => setSettings({ ...settings, requireApproval: v })}
              />
            </>
          ) : tab === 'Security' ? (
            <>
              <Toggle
                label="Require strong passwords"
                checked={settings.strongPasswords}
                onChange={v => setSettings({ ...settings, strongPasswords: v })}
              />
              <Toggle
                label="Enable account session timeout"
                checked={settings.sessionTimeout}
                onChange={v => setSettings({ ...settings, sessionTimeout: v })}
              />
              <Toggle
                label="Record administrative activity"
                checked={settings.auditActivity}
                onChange={v => setSettings({ ...settings, auditActivity: v })}
              />
            </>
          ) : tab === 'Notifications' ? (
            <>
              <Toggle
                label="Notify teachers when students submit"
                checked={settings.notifyOnSubmit}
                onChange={v => setSettings({ ...settings, notifyOnSubmit: v })}
              />
              <Toggle
                label="Notify about disconnected students"
                checked={settings.notifyDisconnected}
                onChange={v => setSettings({ ...settings, notifyDisconnected: v })}
              />
              <Toggle
                label="Send examination reminders"
                checked={settings.examReminders}
                onChange={v => setSettings({ ...settings, examReminders: v })}
              />
            </>
          ) : (
            <>
              <div style={{ marginBottom: '18px', padding: '16px', borderRadius: '8px', background: 'var(--bg-secondary, rgba(255,255,255,0.04))', border: '1px solid var(--border-color, rgba(255,255,255,0.08))' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: theme === 'dark' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(234, 179, 8, 0.15)', color: theme === 'dark' ? '#818cf8' : '#eab308', display: 'grid', placeItems: 'center' }}>
                      {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                    </div>
                    <div>
                      <b style={{ display: 'block', fontSize: '14px', color: 'var(--text-primary, #fff)' }}>Interface Color Theme</b>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>
                        Currently active: <b>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</b>
                      </span>
                    </div>
                  </div>
                  <Button
                    kind="outline"
                    icon={theme === 'dark' ? Sun : Moon}
                    onClick={() => {
                      toggleTheme();
                      notify(`Switched to ${theme === 'dark' ? 'Light' : 'Dark'} mode.`);
                    }}
                  >
                    Switch to {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                  </Button>
                </div>
              </div>

              <Toggle
                label="Use compact tables"
                checked={settings.compactTables}
                onChange={v => setSettings({ ...settings, compactTables: v })}
              />
              <Toggle
                label="Reduce visual motion"
                checked={settings.reduceMotion}
                onChange={v => setSettings({ ...settings, reduceMotion: v })}
              />
              <label>Accent color</label>
              <select
                className="field"
                value={settings.accentColor || 'Blue / Purple'}
                onChange={e => setSettings({ ...settings, accentColor: e.target.value })}
              >
                <option>Blue / Purple</option>
                <option>Teal</option>
              </select>
            </>
          )}

          <div className="form-footer">
            <Button onClick={handleSave}>Save changes</Button>
          </div>
        </div>
      </div>
    </>
  );
};
