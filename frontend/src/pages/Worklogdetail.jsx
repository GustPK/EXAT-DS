import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const WorklogDetail = () => {
  const { worklogId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [worklog, setWorklog] = useState(null);
  const [loading, setLoading] = useState(true);

  // แปลงวันที่เป็น DD-MM-YYYY
  const formatDateToDDMMYYYY = (isoDate) => {
    if (!isoDate) return '';
    const [yyyy, mm, dd] = isoDate.slice(0, 10).split('-');
    return `${dd}-${mm}-${yyyy}`;
  };

  useEffect(() => {
    if (location.state && location.state.worklog) {
      setWorklog(location.state.worklog);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const worklogs = JSON.parse(localStorage.getItem('worklogs')) || [];
      const found = worklogs.find(w => w.WORKLOG_ID === worklogId);
      setWorklog(found || null);
    } catch {
      setWorklog(null);
    }
    setLoading(false);
  }, [worklogId, location.state]);

  const handleDelete = async () => {
    if (!window.confirm('คุณต้องการลบงานนี้จริงหรือไม่?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/v1/worklog/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: worklog.WORKLOG_ID }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('ลบงานสำเร็จ');
        navigate('/worklog', { state: { dateList: location.state?.dateList ?? true } });
      } else {
        toast.error('ลบงานไม่สำเร็จ');
      }
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการลบงาน');
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-500">กำลังโหลด...</div>;
  if (!worklog) return <div className="text-center py-10 text-red-500">ไม่พบข้อมูล Worklog</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        <button
          className="px-3 h-9 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-xl"
          onClick={() => navigate('/worklog', { state: { dateList: location.state?.dateList ?? true } })}

        >
          &larr; กลับ
        </button>

        <h2 className="text-2xl font-bold text-blue-900 text-center sm:text-left lg:text-2xl lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2">
          รายละเอียด
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 w-full sm:w-auto">
          <button
            className="px-3 h-8 bg-orange-100 hover:bg-[#ffde9e] text-orange-500 rounded-xl"
            onClick={() => navigate(`/editworklog/${worklog.WORKLOG_ID}`, { state: { worklog, dateList: location.state?.dateList ?? true } })}
          >
            แก้ไข
          </button>
          <button
            className="px-3 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl"
            onClick={handleDelete}
          >
            ลบงาน
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-4 border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[140px]">
            <span className="block text-gray-600 text-sm mb-1">วันที่</span>
            <span className="font-semibold text-blue-900">{formatDateToDDMMYYYY(worklog.WORK_DATE)}</span>
          </div>
          <div className="flex-1 min-w-[140px]">
            <span className="block text-gray-600 text-sm mb-1">ช่วงเวลา</span>
            <span className="font-semibold text-blue-900">{worklog.TIME_START?.slice(11, 16)} - {worklog.TIME_END?.slice(11, 16)}</span>
          </div>
          <div className="flex-1 min-w-[140px]">
            <span className="block text-gray-600 text-sm mb-1">หมายเลขงาน</span>
            <span className="font-semibold text-blue-900">{worklog.JOB_CODE}</span>
          </div>
          <div className="flex-1 min-w-[140px]">
            <span className="block text-gray-600 text-sm mb-1">สถานที่</span>
            <span className="font-semibold text-blue-900">{worklog.LOCATION_NAME}</span>
          </div>
        </div>
        <div className='mb-8'>
          <span className="block text-gray-600 text-sm mb-1">รายละเอียดงาน</span>
          <span className="font-medium text-gray-800">{worklog.TASK_DETAIL}</span>
        </div>
        <div className='mb-8'>
          <span className="block text-gray-600 text-sm mb-1">การดำเนินการ</span>
          <span className="font-medium text-gray-800">{worklog.ACTION_TAKEN}</span>
        </div>
        <div className='mb-8'>
          <span className="block text-gray-600 text-sm mb-1">ปัญหา/อุปสรรค</span>
          <span className="font-medium text-gray-800">{worklog.PROBLEM}</span>
        </div>
        <div className="flex flex-col sm:flex-row">
          <div className="flex-1 min-w-[140px]">
            <span className="block text-gray-600 text-sm">ประเภทงาน</span>
            <span className="font-medium text-gray-800">{worklog.WORKTYPE_NAME}</span>
          </div>
          <div className="flex-1 min-w-[140px]">
            <span className="block text-gray-600 text-sm">ผู้รับผิดชอบ</span>
            <span className="font-medium text-gray-800">{worklog.USER_NAME}</span>
          </div>
          <div className="flex-1 min-w-[140px]">
            <span className="block text-gray-600 text-sm">ผู้ประสานงาน</span>
            <span className="font-medium text-gray-800">{worklog.COORDINATOR}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorklogDetail;
