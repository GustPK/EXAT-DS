import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    USER_ID: '',
    USER_NAME: '',
    EMAIL: '',
    PASSWORD: '',
    CONFIRM_PASSWORD: '',
    PHONENUMBER: '',
    POSITION: '',
    DEPARTMENT_ID: '',
  });

  const [departmentList, setDepartmentList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.post('http://localhost:4000/v1/department/get', {}, {
    })
    .then((res) => {
      if (res.data.success) {
        setDepartmentList(res.data.data);
      } else {
        toast.error("ไม่สามารถโหลดรายชื่อแผนกได้");
      }
    })
    .catch((err) => {
      console.error("เกิดข้อผิดพลาดในการโหลดแผนก:", err);
    });
  }, []);

  const onChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (formData.PASSWORD !== formData.CONFIRM_PASSWORD) {
      toast.error('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    if (!formData.DEPARTMENT_ID) {
      toast.error('กรุณาเลือกแผนก');
      return;
    }

    const dataToSend = {
      USER_ID: formData.USER_ID,
      USER_NAME: formData.USER_NAME,
      EMAIL: formData.EMAIL,
      PASSWORD: formData.PASSWORD,
      PHONENUMBER: formData.PHONENUMBER,
      POSITION: formData.POSITION,
      ROLE: 'USER',
      DEPARTMENT_ID: formData.DEPARTMENT_ID,
    };

    try {
      const response = await axios.post('http://localhost:4000/v1/user/signup', dataToSend);
      toast.success('สมัครสมาชิกสำเร็จ');
      navigate('/login');
    } catch (error) {
      console.error(error);
      toast.error('เกิดข้อผิดพลาดในการสมัครสมาชิก');
    }
  };

  return (
    <div className="container mx-auto px-4 min-h-screen">
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col items-center w-[90%] sm:max-w-2xl m-auto mt-10 gap-4 text-gray-800 min-h-screen"
      >
        <div className="inline-flex items-center gap-2 mb-2 mt-16">
          <p className="prata-regular text-3xl font-semibold text-blue-900">Sign Up</p>
        </div>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              name="USER_NAME"
              placeholder="ชื่อ-นามสกุล"
              required
              onChange={onChange}
              className="p-2 border-2 border-gray-300 rounded-md bg-gray-100"
            />
            <input
              type="text"
              name="POSITION"
              placeholder="ตำแหน่ง"
              required
              onChange={onChange}
              className="p-2 border-2 border-gray-300 rounded-md bg-gray-100"
            />
            <input
              type="email"
              name="EMAIL"
              placeholder="อีเมล"
              required
              onChange={onChange}
              className="p-2 border-2 border-gray-300 rounded-md bg-gray-100"
            />
            <input
              type="password"
              name="PASSWORD"
              placeholder="รหัสผ่าน"
              required
              onChange={onChange}
              className="p-2 border-2 border-gray-300 rounded-md bg-gray-100"
            />
          </div>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              name="USER_ID"
              placeholder="รหัสพนักงาน"
              required
              onChange={onChange}
              className="p-2 border-2 border-gray-300 rounded-md bg-gray-100"
            />
            <select
              name="DEPARTMENT_ID"
              required
              onChange={onChange}
              className="p-2 border-2 border-gray-300 rounded-md bg-gray-100"
              defaultValue=""
            >
              <option value="" disabled>เลือกแผนก</option>
              {departmentList.map((dept) => (
                <option key={dept.DEPARTMENT_ID} value={dept.DEPARTMENT_ID}>
                  {dept.DEPARTMENT_NAME}
                </option>
              ))}
            </select>
            <input
              type="tel"
              name="PHONENUMBER"
              placeholder="เบอร์โทรศัพท์"
              required
              onChange={onChange}
              className="p-2 border-2 border-gray-300 rounded-md bg-gray-100"
            />
            <input
              type="password"
              name="CONFIRM_PASSWORD"
              placeholder="ยืนยันรหัสผ่าน"
              required
              onChange={onChange}
              className="p-2 border-2 border-gray-300 rounded-md bg-gray-100"
            />
          </div>
        </div>
        <div className="w-full flex justify-between text-sm">
          <p className="cursor-pointer" onClick={() => navigate('/login')}>มีบัญชีอยู่แล้ว</p>
        </div>
        <button className="mt-12 w-full py-3 bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white font-semibold rounded-xl">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignUp;
