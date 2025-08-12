import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Team = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // ดึง user ปัจจุบันจาก localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const departmentId = user?.DEPARTMENT_ID;
  const role = user?.ROLE;
  const token = localStorage.getItem('token');

  useEffect(() => {
    // ถ้าไม่ใช่ MANAGER ให้ redirect กลับหน้าแรก
    if (role !== 'MANAGER') {
      navigate('/', { replace: true });
      return;
    }
    const fetchTeam = async () => {
      setLoading(true);
      try {
        const res = await axios.post(
          'http://localhost:4000/v1/user/get',
          { DEPARTMENT_ID: departmentId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.data.success) {
          setTeam(res.data.data.filter(member => member.ROLE == "USER"));
        } else {
          setTeam([]);
        }
      } catch (err) {
        setTeam([]);
      }
      setLoading(false);
    };
    if (departmentId) fetchTeam();
  }, [departmentId, role, navigate]);

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <h2 className="text-2xl font-bold text-blue-900 mb-8 text-center tracking-wide">รายชื่อพนักงาน</h2>
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-500">กำลังโหลดข้อมูล...</div>
        ) : team.length === 0 ? (
          <div className="text-center text-gray-400">ไม่พบข้อมูลพนักงานในแผนกนี้</div>
        ) : (
          team.map((member, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow px-5 py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 border border-gray-200 hover:scale-101 cursor-pointer"
              onClick={() => navigate(`/user/${member.USER_ID}`, { state: { user: member } })}
            >
              <div className="flex-3 min-w-[120px]">
                <span className="block text-gray-500 text-sm">ชื่อ</span>
                <span className="font-semibold text-gray-800">{member.USER_NAME}</span>
              </div>
              <div className="flex-2 min-w-[120px]">
                <span className="block text-gray-500 text-sm">รหัสพนักงาน</span>
                <span className="font-semibold text-gray-800">{member.USER_ID}</span>
              </div>
              <div className="flex-3 min-w-[70px]">
                <span className="block text-gray-500 text-sm">ตำแหน่ง</span>
                <span className="font-semibold text-gray-800 block truncate max-w-full">{member.POSITION}</span>
              </div>
              <div className="flex-4 min-w-[70px]">
                <span className="block text-gray-500 text-sm">อีเมล</span>
                <span className="font-semibold text-gray-800 block truncate max-w-full" title={member.EMAIL}>{member.EMAIL}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>

  );
};

export default Team;
