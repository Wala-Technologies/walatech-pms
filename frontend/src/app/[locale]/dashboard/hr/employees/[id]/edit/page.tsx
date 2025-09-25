'use client';

import { useState, useEffect } from 'react';
import { Alert, Spin } from 'antd';
import { useParams } from 'next/navigation';
import { hrApi, Employee } from '../../../../../../../lib/hr-api';
import EmployeeForm from '../../components/EmployeeForm';

export default function EditEmployeePage() {
  const params = useParams();
  const employeeId = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await hrApi.getEmployee(employeeId);
      if (response.data) {
        setEmployee(response.data);
      } else {
        setError('Employee not found');
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
      setError('Failed to load employee details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Error"
          description={error || 'Employee not found'}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return <EmployeeForm employee={employee} isEdit={true} />;
}