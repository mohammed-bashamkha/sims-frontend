import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from './components/layout/AuthLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute, GuestRoute } from './routes/ProtectedRoute';
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
import { ShowUser } from './pages/ShowUser';
import { EditUser } from './pages/EditUser';
import { ShowRole } from './pages/ShowRole';
import { EditRole } from './pages/EditRole';
import { TransfersIndex } from './pages/TransfersIndex';
import { TemporaryAdmissions } from './pages/TemporaryAdmissions';

// Academic Affairs
import { AcademicLayout } from './pages/academic/AcademicLayout';
import { AcademicHome } from './pages/academic/AcademicHome';
import { AcademicYears } from './pages/academic/AcademicYears';
import { SchoolClasses } from './pages/academic/SchoolClasses';
import { Subjects } from './pages/academic/Subjects';
import { StudentGrades } from './pages/academic/StudentGrades';
import { Replacements } from './pages/academic/Replacements';
import { StudentDataErrors } from './pages/academic/StudentDataErrors';
import { SuspendedStudents } from './pages/academic/SuspendedStudents';
import { ImportStudents } from './pages/academic/ImportStudents';
import { ImportFinalResults } from './pages/academic/ImportFinalResults';
import { ExportStudents } from './pages/academic/ExportStudents';
import { Unauthorized } from './pages/Unauthorized';
import { Toaster } from './components/ui/Toaster';

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        {/* ─── Auth Routes (guests only) ─── */}
        <Route element={<GuestRoute />}>
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
          </Route>
        </Route>

        {/* ─── Change Password (requires token, but not protected from must_change) ─── */}
        <Route path="/auth/change-password" element={<AuthLayout />}>
          <Route index element={<ChangePassword />} />
        </Route>

        {/* ─── Protected Routes (requires authentication) ─── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* ── Unauthorized (Modal Style) ── */}
            <Route path="unauthorized" element={<Unauthorized />} />

            {/* ── Students ── */}
            <Route path="students" element={<StudentRecord />} />
            <Route path="students/:id" element={<ShowStudent />} />
            {/* إنشاء طالب: يتطلب صلاحية */}
            <Route element={<ProtectedRoute allowedPermission="الطلاب.اضافة" />}>
              <Route path="students/create" element={<CreateStudent />} />
            </Route>
            {/* تعديل طالب: يتطلب صلاحية */}
            <Route element={<ProtectedRoute allowedPermission="الطلاب.تعديل" />}>
              <Route path="students/edit/:id" element={<EditStudent />} />
            </Route>
            {/* استيراد بيانات الطلاب */}
            <Route element={<ProtectedRoute allowedPermission="الطلاب.اضافة" />}>
              <Route path="students/import" element={<ImportStudents />} />
            </Route>

            {/* ── Schools ── */}
            <Route path="schools" element={<SchoolsIndex />} />
            <Route element={<ProtectedRoute allowedPermission="المدارس.اضافة" />}>
              <Route path="schools/create" element={<CreateSchool />} />
            </Route>
            <Route element={<ProtectedRoute allowedPermission="المدارس.تعديل" />}>
              <Route path="schools/edit/:id" element={<EditSchool />} />
            </Route>

            {/* ── Transfers & Admissions ── */}
            <Route path="transfers" element={<TransfersIndex />} />
            <Route path="temporary-admission" element={<TemporaryAdmissions />} />

            {/* ── Academic Affairs ── */}
            <Route path="academic" element={<AcademicLayout />}>
              <Route index element={<AcademicHome />} />
              
              <Route element={<ProtectedRoute allowedPermission="السنوات_الدراسية.عرض" />}>
                <Route path="years" element={<AcademicYears />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermission="الصفوف.عرض" />}>
                <Route path="classes" element={<SchoolClasses />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermission="المواد.عرض" />}>
                <Route path="subjects" element={<Subjects />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermission="الدرجات.عرض" />}>
                <Route path="grades" element={<StudentGrades />} />
              </Route>

              <Route path="replacements" element={<Replacements />} />
              <Route path="data-errors" element={<StudentDataErrors />} />
              <Route path="suspended" element={<SuspendedStudents />} />
              
              <Route element={<ProtectedRoute allowedPermission="النتائج.استيراد" />}>
                <Route path="import-final-results" element={<ImportFinalResults />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermission="الطلاب.اضافة" />}>
                <Route path="export-students" element={<ExportStudents />} />
              </Route>
            </Route>

            {/* ── Settings (System Admin only) ── */}
            <Route path="profile" element={<Profile />} />
            <Route element={<ProtectedRoute allowedPermission="المستخدمين.ادارة" />}>
              <Route path="settings" element={<SettingsLayout />} />
              <Route path="settings/users/:id" element={<ShowUser />} />
              <Route path="settings/users/edit/:id" element={<EditUser />} />
              <Route path="settings/roles/:id" element={<ShowRole />} />
              <Route path="settings/roles/edit/:id" element={<EditRole />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
