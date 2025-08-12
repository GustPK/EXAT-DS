import React, { useState, useEffect, useRef } from 'react';
import { SquarePen } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MyProfile = () => {
  const [editField, setEditField] = useState(null);
  const [fields, setFields] = useState({
    name: '',
    employeeId: '',
    position: '',
    department: '',
    email: '',
    phone: '',
  });

  const [originalFields, setOriginalFields] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [departmentList, setDepartmentList] = useState([]);

  const fieldRefs = {
    name: useRef(null),
    employeeId: useRef(null),
    position: useRef(null),
    department: useRef(null),
    email: useRef(null),
    phone: useRef(null),
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      const initial = {
        name: user.USER_NAME || '',
        employeeId: user.USER_ID || '',
        position: user.POSITION || '',
        department: user.DEPARTMENT_ID || '',
        email: user.EMAIL || '',
        phone: user.PHONENUMBER || '',
      };
      setFields(initial);
      setOriginalFields(initial);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchDepartments = async () => {
      try {
        const response = await fetch('http://localhost:4000/v1/department/get', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();
        if (result.success) {
          setDepartmentList(result.data);
        } else {
          console.error('โหลดข้อมูลแผนกล้มเหลว:', result.message);
        }
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดแผนก:', error);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    if (editField && fieldRefs[editField]?.current) {
      fieldRefs[editField].current.focus();
    }
  }, [editField]);

  const handleFieldChange = (key, value) => {
    const updatedFields = { ...fields, [key]: value };
    setFields(updatedFields);
    setIsModified(JSON.stringify(updatedFields) !== JSON.stringify(originalFields));
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');

    const payload = {
      USER_ID: fields.employeeId,
      USER_NAME: fields.name,
      POSITION: fields.position,
      DEPARTMENT_ID: fields.department,
      EMAIL: fields.email,
      PHONENUMBER: fields.phone,
    };

    try {
      const res = await fetch("http://localhost:4000/v1/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        toast.success("บันทึกข้อมูลแล้ว");
        setOriginalFields(fields);
        setIsModified(false);
        setEditField(null);
      } else {
        toast.error("บันทึกไม่สำเร็จ: " + result.message);
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  const renderInput = (key, label, type = 'text') => {
    if (key === 'department') {
      const currentDept = departmentList.find(dept => dept.DEPARTMENT_ID === fields[key]);

      return (
        <div className="relative">
          <label className="text-gray-500 text-sm mb-1 block pl-8">{label}</label>
          <div className="flex items-center justify-center pl-2">
            <select
              ref={fieldRefs[key]}
              className="max-w-[370px] p-3 border-2 border-gray-300 rounded-md bg-gray-100 text-lg font-semibold text-gray-800 pr-12 w-full"
              value={fields[key]}
              onChange={(e) => handleFieldChange(key, e.target.value)}
            >
              {!fields[key] && (
                <option value="" disabled>-- เลือกแผนก --</option>
              )}
              {fields[key] && !currentDept && (
                <option value={fields[key]} disabled>กำลังโหลดชื่อแผนก...</option>
              )}
              {fields[key] && currentDept && (
                <option value={fields[key]}>
                  {currentDept.DEPARTMENT_NAME}
                </option>
              )}
              {departmentList
                .filter(dept => dept.DEPARTMENT_ID !== fields[key])
                .map((dept) => (
                  <option key={dept.DEPARTMENT_ID} value={dept.DEPARTMENT_ID}>
                    {dept.DEPARTMENT_NAME}
                  </option>
                ))}
            </select>
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        <label className="text-gray-500 text-sm mb-1 block pl-8">{label}</label>
        <div className="flex items-center justify-center">
          <input
            ref={fieldRefs[key]}
            type={type}
            className="max-w-[370px] p-3 border-2 border-gray-300 rounded-md bg-gray-100 text-lg font-semibold text-gray-800 pr-12 w-full"
            placeholder={`กรอก${label}`}
            value={fields[key]}
            readOnly={key === 'email' || editField !== key}
            onChange={(e) => handleFieldChange(key, e.target.value)}
          />
          {key !== 'email' && (
            <button
              type="button"
              className="ml-[-44px] flex items-center justify-center w-9 h-9 text-xl text-gray-500 hover:text-blue-800 transition-colors cursor-pointer"
              tabIndex={-1}
              onClick={() => setEditField(editField === key ? null : key)}
              aria-label="แก้ไข"
            >
              <SquarePen className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-900 mb-8">ข้อมูลโปรไฟล์</h2>
      <form className="w-full flex flex-col gap-8" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
          {renderInput('name', 'ชื่อ-นามสกุล')}
          {renderInput('employeeId', 'รหัสพนักงาน')}
          {renderInput('position', 'ตำแหน่ง')}
          {renderInput('department', 'แผนก')}
          {renderInput('email', 'อีเมลล์', 'email')}
          {renderInput('phone', 'เบอร์โทรศัพท์', 'tel')}
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={!isModified}
            className={`px-8 py-2 text-white font-semibold rounded-xl shadow-md transition-all duration-200 text-md tracking-wide border-2 ${isModified
              ? 'bg-blue-800 hover:bg-blue-700 border-blue-800 hover:shadow-xl hover:scale-105 cursor-pointer'
              : 'bg-gray-300 border-gray-300 cursor-not-allowed'
              }`}
          >
            บันทึกข้อมูล
          </button>
          <button
            type="button"
            onClick={() => {
              setFields(originalFields);
              setIsModified(false);
              setEditField(null);
            }}
            disabled={!isModified}
            className={`px-8 py-2 font-semibold rounded-xl shadow-md transition-all duration-200 text-md tracking-wide border-2 ${isModified
              ? 'bg-white text-gray-700 hover:bg-gray-100 border-gray-400 hover:shadow-sm cursor-pointer'
              : 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
              }`}
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
};

export default MyProfile;
