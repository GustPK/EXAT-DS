import { ArrowUpDown, CircleChevronRight, FileTextIcon, List, MoveDown, MoveUp, Rows3 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Userdetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [worklogs, setWorklogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDate, setOpenDate] = useState(null);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterJobCode, setFilterJobCode] = useState('');
  const [dateList, setDateList] = useState(true);

  // รับค่า dateList จาก state ถ้ามี (เช่น กลับมาจาก TeamWorklogDetail)
  useEffect(() => {
    if (state?.dateList !== undefined) {
      setDateList(state.dateList);
    }
  }, [state]);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const updateDateList = () => setDateList(prev => !prev);

  useEffect(() => {
    if (state && state.user) {
      setUser(state.user);
    }
  }, [state]);

  useEffect(() => {
    const fetchWorklogs = async () => {
      if (!user?.USER_ID) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:4000/v1/worklog/get', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ USER_ID: user.USER_ID }),
        });
        const result = await res.json();
        setWorklogs(result.success ? result.data : []);
      } catch {
        setWorklogs([]);
      }
      setLoading(false);
    };
    if (user?.USER_ID) fetchWorklogs();
  }, [user]);

  // Filter worklogs
  const filteredWorklogs = worklogs.filter(item => {
    let passDate = true;
    const workDate = item.WORK_DATE?.slice(0, 10);
    if (filterStartDate) {
      passDate = workDate >= filterStartDate;
    }
    if (passDate && filterEndDate) {
      passDate = workDate <= filterEndDate;
    }
    let passJob = true;
    if (filterJobCode) {
      passJob = item.JOB_CODE?.toLowerCase().includes(filterJobCode.toLowerCase());
    }
    return passDate && passJob;
  });

  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.slice(0, 10).split('-');
    return `${day}-${month}-${year}`;
  };

  // Group filtered worklogs by date
  const grouped = filteredWorklogs.reduce((acc, item) => {
    const date = item.WORK_DATE?.slice(0, 10);
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
  const flatList = Object.values(grouped).flat();

  const sortedFlatList = useMemo(() => {
    if (!sortConfig.key) return flatList;
    const sorted = [...flatList].sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';
      if (sortConfig.key === 'WORK_DATE') {
        return (new Date(aVal) - new Date(bVal)) * (sortConfig.direction === 'asc' ? 1 : -1);
      }
      return aVal.localeCompare(bVal) * (sortConfig.direction === 'asc' ? 1 : -1);
    });
    return sorted;
  }, [flatList, sortConfig]);

  const requestSort = (key) => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
  };

  const handleExportReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:4000/v1/reportjob/record',
        {
          from: filterStartDate || "2025-01-01",
          to: filterEndDate || "2100-01-01",
          USER_ID: user.USER_ID,
          JOB_CODE: filterJobCode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success && res.data.data?.ref) {
        const refcode = res.data.data.ref;
        const reportUrl = `http://localhost:8080/Reporting/genreport?Refcode=${refcode}`;
        window.open(reportUrl, '_blank');
      } else {
        toast.error('ไม่สามารถสร้างรายงานได้: ' + res.data.message);
      }
    } catch (error) {
      console.error('Report creation failed:', error);
      toast.error('เกิดข้อผิดพลาดขณะสร้างรายงาน');
    }
  };

  if (!user) return <div className="text-center py-10 text-red-500">ไม่พบข้อมูลผู้ใช้งาน</div>;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <button
        className="px-3 h-9 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-xl"
        onClick={() => navigate('/team')}
      >
        &larr; กลับ
      </button>
      <h2 className="text-2xl font-bold text-blue-900 mb-4 text-center">รายละเอียดผู้ใช้</h2>
      <div className="rounded-xl shadow p-6 space-y-4 border border-gray-200 mb-14">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[140px]">
            <span className="block text-gray-500 text-sm">ชื่อ</span>
            <span className="font-semibold text-gray-800 block truncate overflow-hidden whitespace-nowrap">{user.USER_NAME}</span>
          </div>
          <div className="flex-1 min-w-[140px]">
            <span className="block text-gray-500 text-sm">รหัสพนักงาน</span>
            <span className="font-semibold text-gray-800 block truncate overflow-hidden whitespace-nowrap">{user.USER_ID}</span>
          </div>
          <div className="flex-1 min-w-[140px]">
            <span className="block text-gray-500 text-sm">ตำแหน่ง</span>
            <span className="font-semibold text-gray-800 block truncate overflow-hidden whitespace-nowrap">{user.POSITION}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[140px]">
            <span className="block text-gray-500 text-sm">อีเมล</span>
            <span className="font-semibold text-gray-800 block truncate overflow-hidden whitespace-nowrap" title={user.EMAIL}>
              {user.EMAIL}
            </span>
          </div>

          <div className="flex-1 min-w-[140px]">
            <span className="block text-gray-500 text-sm">เบอร์โทรศัพท์</span>
            <span className="font-semibold text-gray-800 block truncate overflow-hidden whitespace-nowrap">{user.PHONENUMBER}</span>
          </div>
          <div className="flex-1"></div>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-blue-900 mb-4 text-center">งานที่ดำเนินการ</h3>

      {/* Filter Bar */}
      <div className="flex flex-wrap justify-between gap-4 mb-6 items-end">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-600 mb-1 ">วันที่เริ่มต้น</label>
            <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="border-2 border-gray-300 rounded-md px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">วันที่สิ้นสุด</label>
            <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="border-2 border-gray-300 rounded-md px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">หมายเลขงาน</label>
            <input type="text" value={filterJobCode} onChange={e => setFilterJobCode(e.target.value)} className="w-35 border-2 border-gray-300 rounded-md px-2 py-1" placeholder="ค้นหา..." />
          </div>
          <button
            className="px-4 h-9 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-xl cursor-pointer"
            onClick={() => { setFilterStartDate(''); setFilterEndDate(''); setFilterJobCode(''); }}
          >
            ล้างตัวกรอง
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="w-13 h-9 bg-gray-100 hover:bg-gray-200 font-semibold rounded-xl flex items-center justify-center" onClick={updateDateList}>
            {dateList === true ? <Rows3 className='w-4.5 h-4.5 text-blue-900' /> : <List className='w-4.5 h-4.5 text-blue-900' />}
          </button>
          <button
            className="w-13 h-9 bg-blue-100 hover:bg-blue-200 text-2xl text-blue-900 font-regular rounded-xl"
            onClick={() => {
              navigate(`/assign/${user.USER_ID}`, { state: { userId: user.USER_ID } });
              window.scrollTo(0, 0);
            }}>
            +
          </button>

          <button
            className="w-13 h-9 bg-blue-100 hover:bg-blue-200 font-semibold rounded-xl flex items-center justify-center"
            onClick={handleExportReport}
          >
            <FileTextIcon className='w-4.5 h-4.5 text-blue-900' />
          </button>
        </div>
      </div>


      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-500">กำลังโหลดข้อมูล...</div>
        ) : sortedDates.length === 0 ? (
          <div className="text-center text-gray-400">ไม่พบข้อมูลงาน</div>
        ) : dateList === false ? (
          <div>
            {/* Header Row */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8 border-y border-gray-300 bg-gray-100 py-4 pl-3 text-sm md:text-base font-semibold text-gray-700">
              <div className="shrink-0 w-[120px] lg:w-[140px] cursor-pointer flex items-center gap-1" onClick={() => requestSort('WORK_DATE')}>
                วันที่ {sortConfig.key === 'WORK_DATE' ? (sortConfig.direction === 'asc' ? <MoveDown className='w-4 h-4' /> : <MoveUp className='w-4 h-4' />) : <ArrowUpDown className="w-4 h-4" />}
              </div>
              <div className="shrink-0 w-[120px] lg:w-[140px]">ช่วงเวลา</div>
              <div className="flex-[2] min-w-0 cursor-pointer flex items-center gap-1 truncate" onClick={() => requestSort('TASK_DETAIL')}>
                รายละเอียดงาน {sortConfig.key === 'TASK_DETAIL' ? (sortConfig.direction === 'asc' ? <MoveDown className='w-4 h-4' /> : <MoveUp className='w-4 h-4' />) : <ArrowUpDown className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0 cursor-pointer flex items-center gap-1 truncate" onClick={() => requestSort('LOCATION_NAME')}>
                สถานที่ {sortConfig.key === 'LOCATION_NAME' ? (sortConfig.direction === 'asc' ? <MoveDown className='w- h-4' /> : <MoveUp className='w-4 h-4' />) : <ArrowUpDown className="w-4 h-4" />}
              </div>
              <div className="shrink-0 w-[120px] lg:w-[140px] cursor-pointer flex items-center gap-1" onClick={() => requestSort('JOB_CODE')}>
                หมายเลขงาน {sortConfig.key === 'JOB_CODE' ? (sortConfig.direction === 'asc' ? <MoveDown className='w-4 h-4' /> : <MoveUp className='w-4 h-4' />) : <ArrowUpDown className="w-4 h-4" />}
              </div>
            </div>

            {/* Data Rows */}
            {sortedFlatList.map((item, idx) => (
              <div key={idx} className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 lg:gap-8 border-y border-gray-200 py-4 pl-3 last:border-b-0 cursor-pointer overflow-hidden"
                onClick={() => navigate(`/team/worklog/${item.WORKLOG_ID}`, { state: { worklog: item, dateList, member: user } })}>
                <div className="shrink-0 w-full md:w-[120px] lg:w-[140px]">
                  <span className="block text-gray-600 text-xs md:hidden mb-1">วันที่</span>
                  <span className="font-semibold text-blue-900 whitespace-nowrap text-sm md:text-base">{formatDate(item.WORK_DATE?.slice(0, 10))}</span>
                </div>
                <div className="shrink-0 w-full md:w-[120px] lg:w-[140px]">
                  <span className="block text-gray-600 text-xs md:hidden mb-1">ช่วงเวลา</span>
                  <span className="font-semibold text-blue-900 whitespace-nowrap text-sm md:text-base">{item.TIME_START?.slice(11, 16)} - {item.TIME_END?.slice(11, 16)}</span>
                </div>
                <div className="flex-[2] basis-0 min-w-0">
                  <span className="block text-gray-600 text-xs md:hidden mb-1">รายละเอียดงาน</span>
                  <span className="block font-medium text-gray-800 text-sm md:text-base line-clamp-2 md:line-clamp-1" title={item.TASK_DETAIL}>{item.TASK_DETAIL}</span>
                </div>
                <div className="flex-1 basis-0 min-w-0">
                  <span className="block text-gray-600 text-xs md:hidden mb-1">สถานที่</span>
                  <span className="block font-medium text-blue-900 text-sm md:text-base truncate">{item.LOCATION_NAME}</span>
                </div>
                <div className="flex-1 min-w-[120px]">
                  <span className="block text-gray-600 text-xs md:hidden mb-1">หมายเลขงาน</span>
                  <span className="font-semibold text-blue-900 whitespace-nowrap text-sm md:text-base">{item.JOB_CODE}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(date => (
              <div key={date} className="rounded-xl border border-gray-200 bg-white shadow-md">
                <div className="bg-blue-50 px-5 py-3 rounded-t-xl border-b border-blue-200">
                  <h3 className="text-blue-900 text-base font-semibold tracking-wide">
                    {formatDate(date)}
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {grouped[date].map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 px-5 py-4 transition cursor-pointer"
                      onClick={() => navigate(`/team/worklog/${item.WORKLOG_ID}`, { state: { worklog: item, dateList, member: user } })}>
                      <div className="flex-1 min-w-[120px]">
                        <span className="block text-gray-500 text-xs mb-1">ช่วงเวลา</span>
                        <span className="font-semibold text-blue-900 text-md">{item.TIME_START?.slice(11, 16)} - {item.TIME_END?.slice(11, 16)}</span>
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <span className="block text-gray-500 text-xs mb-1">หมายเลขงาน</span>
                        <span className="font-semibold text-blue-900 text-md">{item.JOB_CODE}</span>
                      </div>
                      <div className="flex-[2] basis-0 min-w-0">
                        <span className="block text-gray-500 text-xs mb-1">รายละเอียดงาน</span>
                        <span className="block font-medium text-gray-800 text-md truncate" title={item.TASK_DETAIL}>{item.TASK_DETAIL}</span>
                      </div>
                      <div className="flex-1 basis-0 min-w-0">
                        <span className="block text-gray-500 text-xs mb-1">สถานที่</span>
                        <span className="block font-semibold text-blue-900 text-md truncate">{item.LOCATION_NAME}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Userdetail;
