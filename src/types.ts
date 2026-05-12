export enum UserRole {
  ADMIN = 'admin',
  EMPLOYEE = 'employee',
}

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on-leave',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  HALF_DAY = 'half-day',
}

export enum LeaveType {
  SICK = 'sick',
  VACATION = 'vacation',
  EMERGENCY = 'emergency',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  departmentId: string;
  role: string;
  status: EmployeeStatus;
  joiningDate: string;
  phoneNumber?: string;
  profileImage?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  headId?: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  status: LeaveStatus;
  reason: string;
  appliedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
}
