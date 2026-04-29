import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from './components/layout/AuthLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Login } from './pages/Login';
import { ChangePassword } from './pages/ChangePassword';
import { Dashboard } from './pages/Dashboard';
import { StudentRecord } from './pages/StudentRecord';
import { CreateStudent } from './pages/CreateStudent';
import { EditStudent } from './pages/EditStudent';
import { ShowStudent } from './pages/ShowStudent';
import { SchoolsIndex } from './pages/SchoolsIndex';
import { CreateSchool } from './pages/CreateSchool';
import { EditSchool } from './pages/EditSchool';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>
        
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<StudentRecord />} />
          <Route path="students/:id" element={<ShowStudent />} />
          <Route path="students/create" element={<CreateStudent />} />
          <Route path="students/edit/:id" element={<EditStudent />} />
          <Route path="schools" element={<SchoolsIndex />} />
          <Route path="schools/create" element={<CreateSchool />} />
          <Route path="schools/edit/:id" element={<EditSchool />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
