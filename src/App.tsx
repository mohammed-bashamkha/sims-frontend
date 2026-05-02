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
import { Profile } from './pages/Profile';
import { SettingsLayout } from './pages/SettingsLayout';
import { TransfersIndex } from './pages/TransfersIndex';
import { TemporaryAdmissions } from './pages/TemporaryAdmissions';

// Academic Affairs
import { AcademicLayout } from './pages/academic/AcademicLayout';
import { AcademicYears } from './pages/academic/AcademicYears';
import { SchoolClasses } from './pages/academic/SchoolClasses';
import { Subjects } from './pages/academic/Subjects';
import { StudentGrades } from './pages/academic/StudentGrades';
import { Replacements } from './pages/academic/Replacements';
import { StudentDataErrors } from './pages/academic/StudentDataErrors';
import { SuspendedStudents } from './pages/academic/SuspendedStudents';

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
          
          <Route path="transfers" element={<TransfersIndex />} />
          <Route path="temporary-admission" element={<TemporaryAdmissions />} />
          
          <Route path="academic" element={<AcademicLayout />}>
            <Route index element={<Navigate to="years" replace />} />
            <Route path="years" element={<AcademicYears />} />
            <Route path="classes" element={<SchoolClasses />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="grades" element={<StudentGrades />} />
            <Route path="replacements" element={<Replacements />} />
            <Route path="data-errors" element={<StudentDataErrors />} />
            <Route path="suspended" element={<SuspendedStudents />} />
          </Route>

          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<SettingsLayout />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
