import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Worklog from './pages/Worklog';
import AddWorklog from './pages/AddWorklog';
import Login from './pages/Login';
import MyProfile from './pages/MyProfile';
import Team from './pages/Team';
import WorklogDetail from './pages/Worklogdetail';
import TeamWorklogDetail from './pages/TeamWorklogdetial';
import Userdetail from './pages/Userdetail';
import Assign from './pages/Assign';
import SignUp from './pages/Signup';
import EditWorklog from './pages/EditWorklog';
import TeamEditWorklog from './pages/TeamEditWorklog';

// PrivateRoute: redirect ไป /login ถ้าไม่มี token
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

const App = () => {
  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] overflow-x-hidden">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover={false}
      />
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/addworklog" element={<PrivateRoute><AddWorklog /></PrivateRoute>} />
        <Route path="/worklog" element={<PrivateRoute><Worklog /></PrivateRoute>} />
        <Route path="/myprofile" element={<PrivateRoute><MyProfile /></PrivateRoute>} />
        <Route path="/team" element={<PrivateRoute><Team /></PrivateRoute>} />
        <Route path="/worklog/:worklogId" element={<PrivateRoute><WorklogDetail /></PrivateRoute>} />
        <Route path="/team/worklog/:worklogId" element={<PrivateRoute><TeamWorklogDetail /></PrivateRoute>} />
        <Route path="/editworklog/:worklogId" element={<PrivateRoute><EditWorklog /></PrivateRoute>} />
        <Route path="/team/editworklog/:worklogId" element={<PrivateRoute><TeamEditWorklog /></PrivateRoute>} />
        <Route path="/user/:userId" element={<PrivateRoute><Userdetail /></PrivateRoute>} />
        <Route path="/assign/:userId" element={<PrivateRoute><Assign /></PrivateRoute>} />
      </Routes>
    </div>
  );
};

export default App;
