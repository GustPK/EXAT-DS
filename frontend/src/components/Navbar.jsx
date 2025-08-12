import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const Navbar = () => {
  const token = localStorage.getItem('token');
  const isSignedIn = !!token;
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.ROLE || 'USER';
  const isManager = role === 'MANAGER';

  if (!isSignedIn || location.pathname === '/login') return null;

  return (
    <div className="flex items-center justify-end sm:justify-between py-4 font-medium">

      <Link to="/" className="hidden sm:block">
        <img src={assets.logo} className="w-50" alt="logo" />
      </Link>

      <ul className="hidden lg:flex gap-16 text-gray-700 mr-26">
        <NavLink to="/" className="flex flex-col items-center gap-1">
          <p className="transition-all duration-200 hover:scale-110">หน้าหลัก</p>
        </NavLink>

        <NavLink to="/worklog" className="flex flex-col items-center gap-1">
          <p className="transition-all duration-200 hover:scale-110">บันทึกการทำงาน</p>
        </NavLink>

        { isManager && (
          <NavLink to="/team" className="flex flex-col items-center gap-1">
            <p className="transition-all duration-200 hover:scale-110">พนักงาน</p>
          </NavLink>
        )}
      </ul>

      <div className="flex items-center gap-6">
        <Link to="/myprofile">
          <img
            className="w-5 cursor-pointer"
            src={assets.profile_icon}
            alt="profile"
          />
        </Link>
        <button
          onClick={() => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            navigate('/login');
          }}
          className="hidden lg:inline-flex text-red-700 hover:text-red-600 transition"
        >
          <LogOut />
        </button>


        <img
          onClick={() => setVisible(true)}
          src={assets.menu_icon}
          className="w-5 cursor-pointer lg:hidden"
          alt="menu"
        />
      </div>

      {/* Sidebar menu*/}
      <div
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out overflow-hidden ${visible ? 'h-screen' : 'h-0'
          }`}
      >
        <div className="flex flex-col h-full bg-gray-50/90 backdrop-blur text-gray-700 text-xl shadow-lg items-center text-center">
          <div
            onClick={() => setVisible(false)}
            className="flex items-center gap-4 p-4 pt-8 cursor-pointer mr-auto"
          >
            <img
              className="h-4 rotate-180"
              src={assets.dropdown_icon}
              alt="Back"
            />
            <p>Back</p>
          </div>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-4 w-full hover:bg-gray-100"
            to="/"
          >
            หน้าหลัก
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-4 w-full hover:bg-gray-100"
            to="/worklog"
          >
            บันทึกการทำงาน
          </NavLink>
          { isManager && (
            <NavLink
              onClick={() => setVisible(false)}
              className="py-4 w-full hover:bg-gray-100"
              to="/team"
            >
              พนักงาน
            </NavLink>
          )}
          <Link
            to="/login"
            onClick={() => {
              localStorage.removeItem('user');
              localStorage.removeItem('token');
            }}
            className="cursor-pointer text-[#ff5100] hover:text-white hover:bg-[#ff5100] font-medium py-2 px-4 rounded-lg transition-colors text-center bg-red-100 mt-10"
          >
            ออกจากระบบ
          </Link>
        </div>
      </div>

    </div>
  );
};

export default Navbar;