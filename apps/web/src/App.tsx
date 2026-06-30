import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Layout from './Layout'
import Home from './pages/Home'
import Report from './pages/Report'
import ReportSuccess from './pages/ReportSuccess'
import Projects from './pages/Projects'
import Login from './pages/Login'
import AdminLayout from './AdminLayout'
import AdminDashboard from './pages/AdminDashboard'
import AdminTickets from './pages/AdminTickets'
import AdminTicketDetail from './pages/AdminTicketDetail'
import AdminCategories from './pages/AdminCategories'
import AdminUsers from './pages/AdminUsers'
import AdminReports from './pages/AdminReports'

import AuthGuard from './components/AuthGuard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="report" element={<Report />} />
          <Route path="report/success" element={<ReportSuccess />} />
          <Route path="projects" element={<Projects />} />
          <Route path="login" element={<Login />} />
        </Route>

        <Route
          path="/admin"
          element={
            <AuthGuard>
              <AdminLayout />
            </AuthGuard>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="tickets" element={<AdminTickets />} />
          <Route path="tickets/:id" element={<AdminTicketDetail />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
