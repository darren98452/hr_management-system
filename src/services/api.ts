import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Employee, Department, Attendance, LeaveRequest } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Employees
export const getEmployees = async () => {
  try {
    const snap = await getDocs(collection(db, 'employees'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Employee[];
  } catch (e) { handleFirestoreError(e, OperationType.LIST, 'employees'); }
};

export const addEmployee = async (data: Omit<Employee, 'id'>) => {
  try {
    const ref = await addDoc(collection(db, 'employees'), data);
    return { id: ref.id, ...data };
  } catch (e) { handleFirestoreError(e, OperationType.CREATE, 'employees'); }
};

export const updateEmployee = async (id: string, data: Partial<Employee>) => {
  try {
    await updateDoc(doc(db, 'employees', id), data);
  } catch (e) { handleFirestoreError(e, OperationType.UPDATE, `employees/${id}`); }
};

export const deleteEmployee = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'employees', id));
  } catch (e) { handleFirestoreError(e, OperationType.DELETE, `employees/${id}`); }
};

// Departments
export const getDepartments = async () => {
  try {
    const snap = await getDocs(collection(db, 'departments'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Department[];
  } catch (e) { handleFirestoreError(e, OperationType.LIST, 'departments'); }
};

export const addDepartment = async (data: Omit<Department, 'id'>) => {
  try {
    const ref = await addDoc(collection(db, 'departments'), data);
    return { id: ref.id, ...data };
  } catch (e) { handleFirestoreError(e, OperationType.CREATE, 'departments'); }
};

// Leaves
export const getLeaveRequests = async () => {
  try {
    const snap = await getDocs(query(collection(db, 'leave_requests'), orderBy('appliedAt', 'desc')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as LeaveRequest[];
  } catch (e) { handleFirestoreError(e, OperationType.LIST, 'leave_requests'); }
};

export const updateLeaveStatus = async (id: string, status: string) => {
  try {
    await updateDoc(doc(db, 'leave_requests', id), { status });
  } catch (e) { handleFirestoreError(e, OperationType.UPDATE, `leave_requests/${id}`); }
};

// Attendance
export const markAttendance = async (data: Omit<Attendance, 'id'>) => {
  try {
    await addDoc(collection(db, 'attendance'), data);
  } catch (e) { handleFirestoreError(e, OperationType.CREATE, 'attendance'); }
};
