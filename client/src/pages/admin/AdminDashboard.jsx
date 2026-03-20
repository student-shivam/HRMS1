import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import api from '../../utils/api';
import './Admin.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/admin');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="spinner"></div>;

  // Prepare Chart.js Data
  const employeeGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Employee Growth',
        data: [10, 25, 40, 52, 60, stats?.totalEmployees || 75],
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const leaveStatsData = {
    labels: stats?.chartData?.leaveData?.map(d => d.name) || ['Pending', 'Approved', 'Rejected'],
    datasets: [
      {
        label: 'Leave Requests',
        data: stats?.chartData?.leaveData?.map(d => d.value) || [stats?.pendingLeaves || 5, 20, 2],
        backgroundColor: ['#F59E0B', '#10B981', '#E11D48'],
        borderWidth: 0,
        hoverOffset: 4
      },
    ],
  };

  const attendanceData = {
    labels: stats?.chartData?.attendanceData?.map(d => d.name) || ['Present', 'Absent', 'On Leave'],
    datasets: [
      {
        label: 'Attendance',
        data: stats?.chartData?.attendanceData?.map(d => d.value) || [80, 5, 15],
        backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
        borderWidth: 0,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#fff',
          font: {
            family: "'Inter', sans-serif"
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#94A3B8' },
        grid: { color: 'rgba(255,255,255,0.05)' }
      },
      y: {
        ticks: { color: '#94A3B8' },
        grid: { color: 'rgba(255,255,255,0.05)' }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#fff', font: { family: "'Inter', sans-serif" } } }
    },
    cutout: '70%'
  };

  return (
    <div className="admin-dashboard-container animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard Overview</h1>
          <p className="dashboard-subtitle">Welcome back, here's what's happening today.</p>
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-primary shadow-hover">Generate Report</button>
        </div>
      </div>

      <div className="metric-cards-grid">
        <div className="metric-card glass-panel">
          <div className="metric-icon bg-primary-glow">
            <i className="fas fa-users"></i>
          </div>
          <div className="metric-content">
            <p className="metric-label">Total Employees</p>
            <h2 className="metric-value">{stats?.totalEmployees || 0}</h2>
            <span className="metric-trend positive">↑ +12% this month</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon bg-success-glow">
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="metric-content">
            <p className="metric-label">Total Leaves</p>
            <h2 className="metric-value">{stats?.totalLeaves || 0}</h2>
            <span className="metric-trend">Current Month</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon bg-warning-glow">
            <i className="fas fa-clock"></i>
          </div>
          <div className="metric-content">
            <p className="metric-label">Pending Requests</p>
            <h2 className="metric-value">{stats?.pendingLeaves || 0}</h2>
            <span className="metric-trend warning">Needs attention</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon bg-secondary-glow">
            <i className="fas fa-user-check"></i>
          </div>
          <div className="metric-content">
            <p className="metric-label">Attendance Summary</p>
            <h2 className="metric-value">94%</h2>
            <span className="metric-trend positive">↑ +2.5% today</span>
          </div>
        </div>
      </div>

      <div className="charts-main-grid">
        <div className="chart-container glass-panel">
          <h3>Employee Growth</h3>
          <div className="chart-wrapper">
            <Line data={employeeGrowthData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-container glass-panel">
          <h3>Leave Statistics</h3>
          <div className="chart-wrapper">
            <Doughnut data={leaveStatsData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      <div className="dashboard-bottom-grid">
        <div className="recent-activity-panel glass-panel">
          <div className="panel-header">
            <h3>Recent Activity</h3>
            <button className="btn-link">View All</button>
          </div>
          <ul className="activity-list">
            <li className="activity-item">
              <div className="activity-indicator bg-primary"></div>
              <div className="activity-details">
                <p className="activity-text"><strong>John Doe</strong> applied for Sick Leave</p>
                <span className="activity-time">10 mins ago</span>
              </div>
            </li>
            <li className="activity-item">
              <div className="activity-indicator bg-success"></div>
              <div className="activity-details">
                <p className="activity-text"><strong>Jane Smith</strong> checked in at 09:02 AM</p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </li>
            <li className="activity-item">
              <div className="activity-indicator bg-warning"></div>
              <div className="activity-details">
                <p className="activity-text">Document uploaded by <strong>Admin</strong></p>
                <span className="activity-time">Yesterday</span>
              </div>
            </li>
            <li className="activity-item">
              <div className="activity-indicator bg-secondary"></div>
              <div className="activity-details">
                <p className="activity-text">New employee onboarding task completed.</p>
                <span className="activity-time">Yesterday</span>
              </div>
            </li>
          </ul>
        </div>

        <div className="chart-container glass-panel">
          <h3>Today's Attendance</h3>
          <div className="chart-wrapper">
            <Bar
              data={attendanceData}
              options={{
                ...chartOptions,
                plugins: { legend: { display: false } },
                scales: {
                  ...chartOptions.scales,
                  x: { ...chartOptions.scales.x, grid: { display: false } }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
