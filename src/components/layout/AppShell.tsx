import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useApp } from '../../context/AppContext';
import { CustomAlertModal } from '../common';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast, alertState, closeAlert, mobileOpen, setMobileOpen } = useApp();

  return (
    <div className="app-shell">
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <Sidebar />
      <main className="main-area">
        <Topbar />
        <div className="content">{children}</div>
      </main>

      {/* Global Custom Alert / Confirmation Dialog */}
      <CustomAlertModal alert={alertState} onClose={closeAlert} />

      {toast && (
        <div className="toast">
          <CheckCircle2 size={17} />
          {toast}
        </div>
      )}
    </div>
  );
};
