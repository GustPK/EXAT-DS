import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const generateTimeSlots = () => {
    const slots = [];
    let hour = 8, minute = 30;
    while (hour < 17 || (hour === 17 && minute === 0)) {
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        minute += 10;
        if (minute === 60) {
            hour += 1;
            minute = 0;
        }
    }
    return slots;
};

const TIME_SLOTS = generateTimeSlots(); // 10-minute intervals

// ปัดเวลา
const roundDownToSlot = (timeStr) => {
    const [hour, minute] = timeStr.split(':').map(Number);
    const roundedMinute = Math.floor(minute / 10) * 10;
    return `${hour.toString().padStart(2, '0')}:${roundedMinute.toString().padStart(2, '0')}`;
};

const formatDate = (isoDate) => {
    const [y, m, d] = isoDate.split('-');
    return `${d}-${m}-${y}`;
};

const roundUpToSlot = (timeStr) => {
    let [hour, minute] = timeStr.split(':').map(Number);
    let roundedMinute = Math.ceil(minute / 10) * 10;
    if (roundedMinute === 60) {
        hour += 1;
        roundedMinute = 0;
    }
    return `${hour.toString().padStart(2, '0')}:${roundedMinute.toString().padStart(2, '0')}`;
};

const getSpan = (startStr, endStr) => {
    const startTime = new Date(`1970-01-01T${roundDownToSlot(startStr)}:00`);
    const endTime = new Date(`1970-01-01T${roundUpToSlot(endStr)}:00`);
    return Math.round((endTime - startTime) / (1000 * 60 * 10));
};

const Calendar = () => {
    const [worklogs, setWorklogs] = useState([]);
    const [dates, setDates] = useState([]);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    const userId = user?.USER_ID;

    useEffect(() => {
        const fetchWorklogs = async () => {
            try {
                const res = await axios.post(
                    'http://localhost:4000/v1/worklog/get',
                    { USER_ID: userId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (res.data.success) {
                    const sorted = [...res.data.data].sort((a, b) =>
                        a.WORK_DATE.localeCompare(b.WORK_DATE)
                    );
                    setWorklogs(sorted);

                    const getNextFiveWeekdays = () => {
                        const weekdays = [];
                        let date = new Date();
                        while (weekdays.length < 5) {
                            const day = date.getDay();
                            if (day !== 0 && day !== 6) {
                                weekdays.push(date.toISOString().slice(0, 10));
                            }
                            date.setDate(date.getDate() + 1);
                        }
                        return weekdays;
                    };

                    setDates(getNextFiveWeekdays());
                }
            } catch (err) {
                console.error('Failed to fetch worklogs:', err);
            }
        };

        if (userId && token) fetchWorklogs();
    }, [userId, token]);

    const findWorklogAt = (date, time) => {
        return worklogs.find(w => {
            const d = w.WORK_DATE.slice(0, 10);
            const start = roundDownToSlot(w.TIME_START?.slice(11, 16));
            const end = roundUpToSlot(w.TIME_END?.slice(11, 16));
            return d === date && time >= start && time < end;
        });
    };

    const isStartTime = (worklog, time) => {
        const start = roundDownToSlot(worklog.TIME_START?.slice(11, 16));
        return time === start;
    };

    return (
        <div>
            <h2 className="text-2xl font-bold ml-6 text-blue-900">ตารางงาน</h2>
            <div className="overflow-x-auto max-w-7xl mx-auto p-6">
                <table className="w-full border-t border-b border-blue-900 text-sm">
                    <thead>
                        <tr className="bg-blue-50 text-blue-900">
                            <th className="border px-2 py-2 text-left">วันที่</th>
                            {TIME_SLOTS.map((time, index) =>
                                index % 3 === 0 ? (
                                    <th
                                        key={time}
                                        className={`border px-2 py-2 text-center ${index + 3 >= TIME_SLOTS.length ? 'border-r border-blue-900' : ''}`}
                                        colSpan={3}
                                    >
                                        {time}
                                    </th>
                                ) : null
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {dates.map(date => (
                            <tr key={date}>
                                <td className="border px-2 py-4 min-h-[80px] font-semibold text-blue-900">
                                    {formatDate(date)}
                                </td>
                                {(() => {
                                    const cells = [];
                                    for (let i = 0; i < TIME_SLOTS.length; i++) {
                                        const time = TIME_SLOTS[i];
                                        const log = findWorklogAt(date, time);
                                        const isStart = log && isStartTime(log, time);

                                        if (log && isStart) {
                                            const span = getSpan(log.TIME_START.slice(11, 16), log.TIME_END.slice(11, 16));

                                            cells.push(
                                                <td
                                                    key={time}
                                                    colSpan={span}
                                                    className="border-t border-b border-l border-r border-blue-900 px-1 py-3 min-h-[80px] text-center bg-blue-100 text-blue-900 font-medium hover:bg-blue-200 cursor-pointer"
                                                    onClick={() =>
                                                        navigate(`/calendar/worklog/${log.WORKLOG_ID}`, { state: { worklog: log } })
                                                    }
                                                >
                                                    <div className="text-xs">{log.JOB_CODE}</div>
                                                    <div className="text-[10px] truncate">{log.LOCATION_NAME}</div>
                                                </td>
                                            );

                                            i += span - 1;
                                        } else if (!log) {
                                            const isLast = i === TIME_SLOTS.length - 1;
                                            cells.push(
                                                <td
                                                    key={time}
                                                    className={`border-t border-b ${isLast ? 'border-r' : ''} border-blue-900 px-1 py-3 min-h-[80px]`}
                                                ></td>
                                            );
                                        }
                                    }
                                    return cells;
                                })()}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Calendar;
