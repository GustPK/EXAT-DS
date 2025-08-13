import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CalendarEditWorklog = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [worklog, setWorklog] = useState(null);
    const [loading, setLoading] = useState(false);
    const [locationList, setLocationList] = useState([]);
    const [worktypeList, setWorktypeList] = useState([]);
    const token = localStorage.getItem('token');

    const formatTime = (datetimeStr) => {
        if (!datetimeStr) return '';
        return datetimeStr.slice(11, 16); // แสดง HH:mm ไม่แปลง timezone
    };

    const updateTime = (timeType, timeStr) => {
        if (!worklog?.WORK_DATE) return;
        const datePart = worklog.WORK_DATE.slice(0, 10);
        const newTime = `${datePart}T${timeStr}:00+07:00`; // ใส่ offset เวลาไทย
        setWorklog({ ...worklog, [timeType]: newTime });
    };

    useEffect(() => {
        if (location.state && location.state.worklog) {
            setWorklog(location.state.worklog);
        } else {
            navigate('/'); 
        }
    }, [location.state, navigate]);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await fetch('http://localhost:4000/v1/location/get', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                const result = await response.json();
                if (result.success) {
                    setLocationList(result.data);
                } else {
                    console.error('ไม่สามารถโหลดสถานที่ได้:', result.message);
                }
            } catch (error) {
                console.error('เกิดข้อผิดพลาดในการดึงข้อมูลสถานที่:', error);
            }
        };
        const fetchWorktypes = async () => {
            try {
                const response = await fetch('http://localhost:4000/v1/worktype/get', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                const result = await response.json();
                if (result.success) {
                    setWorktypeList(result.data);
                } else {
                    console.error('ไม่สามารถโหลดประเภทงานได้:', result.message);
                }
            } catch (error) {
                console.error('เกิดข้อผิดพลาดในการดึงข้อมูลประเภทงาน:', error);
            }
        };

        fetchLocations();
        fetchWorktypes();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const safe = (value) => (value && value.trim() !== "" ? value : "-----");

        // Ensure TIME_START and TIME_END are sent as 'HH:mm' only
        const getTimeHHmm = (datetimeStr) => {
            if (!datetimeStr) return '';
            // If already in HH:mm, return as is
            if (/^\d{2}:\d{2}$/.test(datetimeStr)) return datetimeStr;
            // If ISO or datetime, extract HH:mm
            return datetimeStr.slice(11, 16);
        };

        const payload = {
            WORKLOG_ID: worklog?.WORKLOG_ID,
            USER_ID: worklog?.USER_ID || '',
            WORK_DATE: worklog?.WORK_DATE,
            TIME_START: getTimeHHmm(worklog?.TIME_START),
            TIME_END: getTimeHHmm(worklog?.TIME_END),
            TASK_DETAIL: safe(worklog?.TASK_DETAIL),
            LOCATION_ID: safe(worklog?.LOCATION_ID),
            WORKTYPE_ID: safe(worklog?.WORKTYPE_ID),
            JOB_CODE: safe(worklog?.JOB_CODE),
            COORDINATOR: safe(worklog?.COORDINATOR),
            ACTION_TAKEN: safe(worklog?.ACTION_TAKEN),
            PROBLEM: safe(worklog?.PROBLEM),
            CREATED_BY: worklog?.USER_ID || '',
        };

        try {
            const response = await fetch('http://localhost:4000/v1/worklog/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (result.success) {
                toast.success('แก้ไขข้อมูลสำเร็จ');
                navigate('/');
            } else {
                toast.error('เกิดข้อผิดพลาด: ' + result.message);
            }
        } catch (err) {
            console.error('Submit error:', err);
            toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
        }

        setLoading(false);
    };

    if (!worklog) return <div>กำลังโหลดข้อมูล...</div>;

    return (
        <div className="container mx-auto px-4">
            <div className="bg-white px-6 py-5 max-w-5xl mx-auto">
                <div className="mb-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <button
                        className="px-3 h-9 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-xl"
                        onClick={() => navigate(-1)}
                    >
                        &larr; กลับ
                    </button>
                    <h2 className="text-2xl font-bold text-blue-900 text-center sm:text-left lg:text-2xl sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2">
                        แก้ไขบันทึก
                    </h2>
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 items-end">
                            <div className="flex flex-col">
                                <p className="mb-2 text-lg font-semibold">วันที่</p>
                                <input
                                    type="date"
                                    className="p-2 border-2 border-gray-300 rounded-md bg-gray-100 w-full focus:border-blue-500 focus:bg-white transition"
                                    value={worklog.WORK_DATE?.slice(0, 10)}
                                    onChange={(e) => setWorklog({ ...worklog, WORK_DATE: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex flex-col">
                                <p className="mb-2 text-lg font-semibold">ช่วงเวลา</p>
                                <div className="flex flex-col sm:flex-row">
                                    <input
                                        type="time"
                                        className="p-2 border-2 border-gray-300 rounded-md bg-gray-100 w-full focus:border-blue-500 focus:bg-white transition"
                                        value={formatTime(worklog.TIME_START)}
                                        onChange={(e) => updateTime('TIME_START', e.target.value)}
                                        required
                                    />
                                    <span className="flex justify-center items-center sm:mx-2">-</span>
                                    <input
                                        type="time"
                                        className="p-2 border-2 border-gray-300 rounded-md bg-gray-100 w-full focus:border-blue-500 focus:bg-white transition"
                                        value={formatTime(worklog.TIME_END)}
                                        onChange={(e) => updateTime('TIME_END', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <p className="mb-2 text-lg font-semibold">สถานที่</p>
                                <select
                                    className="p-2 border-2 border-gray-300 rounded-md bg-gray-100 w-full focus:border-blue-500 focus:bg-white transition h-11"
                                    value={worklog.LOCATION_ID}
                                    onChange={(e) => setWorklog({ ...worklog, LOCATION_ID: e.target.value })}
                                    required
                                >
                                    <option value="">เลือกสถานที่</option>
                                    {locationList.map((loc) => (
                                        <option key={loc.LOCATION_ID} value={loc.LOCATION_ID}>
                                            {loc.LOCATION_NAME}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col">
                                <p className="mb-2 text-lg font-semibold">ประเภทงาน</p>
                                <select
                                    className="p-2 border-2 border-gray-300 rounded-md bg-gray-100 w-full focus:border-blue-500 focus:bg-white transition h-11"
                                    value={worklog.WORKTYPE_ID}
                                    onChange={(e) => setWorklog({ ...worklog, WORKTYPE_ID: e.target.value })}
                                    required
                                >
                                    <option value="">เลือกประเภทงาน</option>
                                    {worktypeList.map((loc) => (
                                        <option key={loc.WORKTYPE_ID} value={loc.WORKTYPE_ID}>
                                            {loc.WORKTYPE_NAME}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="sm:col-span-2 flex flex-col sm:flex-row gap-6">
                        <div className="flex-1 flex flex-col">
                            <p className="mb-2 text-lg font-semibold">รายละเอียดงาน</p>
                            <textarea
                                className="w-full h-35 p-3 border-2 border-gray-300 rounded-md bg-gray-100 resize-none focus:border-blue-500 focus:bg-white transition"
                                value={worklog.TASK_DETAIL}
                                onChange={(e) => setWorklog({ ...worklog, TASK_DETAIL: e.target.value })}
                                placeholder="รายละเอียดงาน"
                                required
                            />
                        </div>
                        <div className="w-full sm:w-62 flex flex-col justify-between">
                            <div>
                                <p className="mb-2 text-lg font-semibold">ผู้ประสานงาน (ถ้ามี)</p>
                                <input
                                    type="text"
                                    className="w-full p-2 border-2 border-gray-300 rounded-md bg-gray-100 focus:border-blue-500 focus:bg-white transition"
                                    value={worklog.COORDINATOR}
                                    onChange={(e) => setWorklog({ ...worklog, COORDINATOR: e.target.value })}
                                    placeholder="ชื่อผู้ประสานงาน (ถ้ามี)"
                                />
                            </div>
                            <div className="mt-4">
                                <p className="mb-2 text-lg font-semibold">หมายเลขงาน (ถ้ามี)</p>
                                <input
                                    type="text"
                                    className="w-full p-2 border-2 border-gray-300 rounded-md bg-gray-100 focus:border-blue-500 focus:bg-white transition"
                                    value={worklog.JOB_CODE}
                                    onChange={(e) => setWorklog({ ...worklog, JOB_CODE: e.target.value })}
                                    placeholder="หมายเลขงาน (ถ้ามี)"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-lg font-semibold">การดำเนินการ</p>
                        <textarea
                            className="w-full h-28 p-3 border-2 border-gray-300 rounded-md bg-gray-100 resize-none focus:border-blue-500 focus:bg-white transition"
                            value={worklog.ACTION_TAKEN}
                            onChange={(e) => setWorklog({ ...worklog, ACTION_TAKEN: e.target.value })}
                            placeholder="รายละเอียดการดำเนินการ"
                            required
                        />
                    </div>

                    <div>
                        <p className="mb-2 text-lg font-semibold">ปัญหา (ถ้ามี)</p>
                        <textarea
                            className="w-full h-28 p-3 border-2 border-gray-300 rounded-md bg-gray-100 resize-none focus:border-blue-500 focus:bg-white transition"
                            value={worklog.PROBLEM}
                            onChange={(e) => setWorklog({ ...worklog, PROBLEM: e.target.value })}
                            placeholder="ปัญหาที่พบ (ถ้ามี)"
                        />
                    </div>

                    <div className="sm:col-span-2 flex justify-center">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-38 h-11 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 text-lg cursor-pointer tracking-wide ${loading
                                ? 'bg-black cursor-not-allowed border-gray-500'
                                : 'bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] hover:scale-102'
                                }`}
                        >
                            {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CalendarEditWorklog;
