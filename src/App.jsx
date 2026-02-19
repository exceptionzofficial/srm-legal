
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Employees from './pages/Employees';
import EmployeeForm from './pages/EmployeeForm';
import Salary from './pages/Salary';
import Requests from './pages/Requests';
import ChatGroups from './pages/ChatGroups';
import AttendanceReport from './pages/AttendanceReport';
import EmployeeRules from './pages/EmployeeRules';
import AttendanceView from './pages/AttendanceView';
import Documents from './pages/Documents';
import './components/Layout.css'; // Load global CSS

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Documents />} />
          <Route path="requests" element={<Requests />} />
          <Route path="chat" element={<ChatGroups />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
