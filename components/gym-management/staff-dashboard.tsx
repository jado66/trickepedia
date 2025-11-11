import React, { useState, useEffect } from "react";
import {
  Clock,
  Users,
  Calendar,
  LogIn,
  LogOut,
  ChevronRight,
} from "lucide-react";

// Mock data - replace with actual data from your provider
const mockStaffMember = {
  id: "staff-1",
  name: "Sarah Johnson",
  role: "Gymnastics Coach",
  clockedIn: false,
  todayHours: 0,
  weekHours: 23.5,
  monthHours: 92,
};

const mockClasses = [
  {
    id: "class-1",
    name: "Beginner Gymnastics",
    time: "4:00 PM - 5:00 PM",
    day: "Today",
    location: "Main Gym",
    enrolled: 12,
    capacity: 15,
    students: [
      { id: "s1", name: "Emma Wilson", age: 7, status: "present" },
      { id: "s2", name: "Liam Chen", age: 8, status: "absent" },
      { id: "s3", name: "Olivia Brown", age: 6, status: "present" },
      { id: "s4", name: "Noah Martinez", age: 7, status: "present" },
      { id: "s5", name: "Ava Johnson", age: 8, status: "present" },
    ],
  },
  {
    id: "class-2",
    name: "Intermediate Tumbling",
    time: "5:30 PM - 6:30 PM",
    day: "Today",
    location: "Studio A",
    enrolled: 8,
    capacity: 12,
    students: [
      { id: "s6", name: "Mason Lee", age: 10, status: "present" },
      { id: "s7", name: "Isabella Davis", age: 11, status: "present" },
      { id: "s8", name: "Ethan Wilson", age: 9, status: "present" },
    ],
  },
  {
    id: "class-3",
    name: "Advanced Gymnastics",
    time: "4:00 PM - 5:30 PM",
    day: "Tomorrow",
    location: "Main Gym",
    enrolled: 6,
    capacity: 10,
    students: [],
  },
];

const mockTimeEntries = [
  { date: "Mon, Dec 2", clockIn: "3:45 PM", clockOut: "7:15 PM", hours: 3.5 },
  { date: "Sun, Dec 1", clockIn: "9:00 AM", clockOut: "2:30 PM", hours: 5.5 },
  { date: "Sat, Nov 30", clockIn: "8:30 AM", clockOut: "3:00 PM", hours: 6.5 },
];

export default function StaffPortal() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockedIn, setClockedIn] = useState(mockStaffMember.clockedIn);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedClass, setSelectedClass] = useState<
    (typeof mockClasses)[0] | null
  >(null);
  const [timeEntries, setTimeEntries] = useState(mockTimeEntries);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (clockedIn && clockInTime) {
        const elapsed = Math.floor(
          (new Date().getTime() - clockInTime.getTime()) / 1000
        );
        setElapsedTime(elapsed);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [clockedIn, clockInTime]);

  const handleClockToggle = () => {
    if (!clockedIn) {
      const now = new Date();
      setClockInTime(now);
      setClockedIn(true);
    } else {
      // Add entry to time log
      const entry = {
        date: new Date().toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        clockIn:
          clockInTime?.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }) || "",
        clockOut: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        hours: parseFloat((elapsedTime / 3600).toFixed(1)),
      };
      setTimeEntries([entry, ...timeEntries]);
      setClockedIn(false);
      setClockInTime(null);
      setElapsedTime(0);
    }
  };

  const formatElapsedTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const todaysClasses = mockClasses.filter((c) => c.day === "Today");
  const upcomingClasses = mockClasses.filter((c) => c.day !== "Today");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {mockStaffMember.name}
              </h1>
              <p className="text-gray-600">{mockStaffMember.role}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-2xl font-mono font-semibold">
                {currentTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clock In/Out Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Time Clock</h2>

              <button
                onClick={handleClockToggle}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-colors ${
                  clockedIn
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  {clockedIn ? <LogOut size={24} /> : <LogIn size={24} />}
                  <span className="text-xl">
                    {clockedIn ? "Clock Out" : "Clock In"}
                  </span>
                </div>
              </button>

              {clockedIn && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Current Session</p>
                  <p className="text-2xl font-mono font-bold text-green-600">
                    {formatElapsedTime(elapsedTime)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Started at{" "}
                    {clockInTime?.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}

              {/* Hours Summary */}
              <div className="mt-6 space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Today</span>
                  <span className="font-semibold">
                    {mockStaffMember.todayHours}h
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">This Week</span>
                  <span className="font-semibold">
                    {mockStaffMember.weekHours}h
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-semibold">
                    {mockStaffMember.monthHours}h
                  </span>
                </div>
              </div>

              {/* Recent Time Entries */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Recent Entries
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {timeEntries.map((entry, idx) => (
                    <div key={idx} className="text-sm bg-gray-50 rounded p-2">
                      <div className="font-medium">{entry.date}</div>
                      <div className="text-gray-600 text-xs">
                        {entry.clockIn} - {entry.clockOut} ({entry.hours}h)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Today's Classes */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold">Today&apos;s Classes</h2>
              </div>

              {todaysClasses.length > 0 ? (
                <div className="divide-y">
                  {todaysClasses.map((cls) => (
                    <div
                      key={cls.id}
                      className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedClass(cls)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{cls.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock size={16} />
                              {cls.time}
                            </span>
                            <span>{cls.location}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <div className="flex items-center gap-1 text-sm">
                              <Users size={16} className="text-gray-400" />
                              <span className="font-medium">
                                {cls.enrolled}/{cls.capacity}
                              </span>
                              <span className="text-gray-600">students</span>
                            </div>
                            {cls.enrolled >= cls.capacity && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                Full
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight
                          className="text-gray-400 mt-1"
                          size={20}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No classes scheduled for today
                </div>
              )}
            </div>

            {/* Upcoming Classes */}
            <div className="bg-white rounded-lg shadow mt-6">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold">Upcoming Classes</h2>
              </div>

              <div className="divide-y">
                {upcomingClasses.map((cls) => (
                  <div key={cls.id} className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{cls.name}</h4>
                        <div className="text-sm text-gray-600 mt-1">
                          {cls.day} · {cls.time} · {cls.location}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {cls.enrolled}/{cls.capacity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Class Details Modal */}
      {selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">
                    {selectedClass.name}
                  </h2>
                  <p className="text-gray-600">
                    {selectedClass.time} · {selectedClass.location}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedClass(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <h3 className="font-semibold mb-4">
                Students ({selectedClass.enrolled}/{selectedClass.capacity})
              </h3>

              {selectedClass.students.length > 0 ? (
                <div className="space-y-2">
                  {selectedClass.students.map((student) => (
                    <div
                      key={student.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <span className="font-medium">{student.name}</span>
                        <span className="text-sm text-gray-600 ml-2">
                          Age {student.age}
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          student.status === "present"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {student.status === "present" ? "Present" : "Absent"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No students enrolled yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
