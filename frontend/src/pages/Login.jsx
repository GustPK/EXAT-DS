import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [formData, setFormData] = useState({
    EMAIL: '',
    PASSWORD: '',
  });

  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    
    try {
      const response = await axios.post('http://localhost:4000/v1/user/login', {
        EMAIL: formData.EMAIL,
        PASSWORD: formData.PASSWORD
      });

      localStorage.setItem('user', JSON.stringify(response.data.data));
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      toast.success('เข้าสู่ระบบสำเร็จ');
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="container mx-auto px-4 min-h-screen">
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800 min-h-screen"
      >
        <div className="inline-flex items-center gap-2 mb-2 mt-24">
          <p className="prata-regular text-3xl font-semibold text-blue-900">Login</p>
        </div>
        <input
          type="email"
          className="w-full p-2 border-2 border-gray-300 rounded-md bg-gray-100"
          placeholder="อีเมล"
          required
          name="EMAIL"
          onChange={onChange}
        />
        <input
          type="password"
          className="w-full p-2 border-2 border-gray-300 rounded-md bg-gray-100"
          placeholder="รหัสผ่าน"
          required
          name="PASSWORD"
          onChange={onChange}
        />
        <div className="w-full flex justify-between text-sm">
          <p className="cursor-pointer" onClick={() => navigate('/signup')}>
            สร้างบัญชีใหม่
          </p>
        </div>
        <button className="mt-12 w-full py-3 bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white font-semibold rounded-xl">
          Sign In
        </button>
      </form>
    </div>
  );
};

export default Login;
