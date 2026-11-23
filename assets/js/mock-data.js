"use strict";

const mockData = {
  classes: [
    { id: "3A1", name: "3A1", location: "Khu A · Tầng 2" },
    { id: "3A2", name: "3A2", location: "Khu A · Tầng 2" },
    { id: "4A1", name: "4A1", location: "Khu B · Tầng 1" }
  ],
  students: [
    { id: "HS001", name: "Nguyễn Minh Anh", classId: "3A1", active: true },
    { id: "HS002", name: "Nguyễn Gia Bảo", classId: "3A2", active: true },
    { id: "HS003", name: "Trần Khánh Linh", classId: "4A1", active: true },
    { id: "HS004", name: "Lê Đức Phúc", classId: "3A1", active: true }
  ],
  parents: [
    { id: "PH001", name: "Nguyễn Thu Trang", email: "trang@example.test", studentIds: ["HS001", "HS002"] },
    { id: "PH002", name: "Trần Hoàng Nam", email: "nam@example.test", studentIds: ["HS003"] },
    { id: "PH003", name: "Lê Thanh Hà", email: "ha@example.test", studentIds: ["HS001", "HS004"] }
  ],
  cameras: [
    { id: "cam-3a1", name: "Camera lớp 3A1", location: "Khu A · Phòng 201", online: true, image: "classroom.jpg", classIds: ["3A1"] },
    { id: "cam-3a2", name: "Camera lớp 3A2", location: "Khu A · Phòng 202", online: true, image: "classroom-3a2.jpg", classIds: ["3A2"] },
    { id: "cam-hanh-lang", name: "Hành lang khu A", location: "Khu A · Tầng 2", online: true, image: "hallway.jpg", classIds: ["3A1", "3A2"] },
    { id: "cam-san-truong", name: "Sân sinh hoạt khu B", location: "Khu B · Tầng trệt", online: false, image: "courtyard.jpg", classIds: ["4A1"] }
  ],
  activity: []
};

const mockSchoolRoster = [
  { studentId: "HS001", classId: "3A2", status: "active" },
  { studentId: "HS003", classId: null, status: "inactive" }
];
