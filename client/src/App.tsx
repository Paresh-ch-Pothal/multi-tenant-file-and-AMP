import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoutes';
import { AppShell } from './components/layout/AppShell';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { FileBrowser } from './pages/files/FileBrowser';
import { RolesPage } from './pages/roles/RolePage';
import { UsersPage } from './pages/users/UserPage';
import { AuditLogPage } from './pages/audit/Auditpage';
import { SettingsPage } from './pages/settings/SettingPage';



function Files() { return <div>File browser (next step)</div>; }

function AppShellLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShellLayout />}>
          <Route path="/files" element={<FileBrowser />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/audit-logs" element={<AuditLogPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/files" replace />} />
    </Routes>
  );
}