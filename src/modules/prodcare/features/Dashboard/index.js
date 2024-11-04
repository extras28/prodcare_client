import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardHomeScreen from './screens/DashboardHomeScreen';

Dashboard.propTypes = {};

function Dashboard(props) {
  return (
    <Routes>
      <Route path="/" element={<DashboardHomeScreen />} />
      <Route path="home/*" element={<DashboardHomeScreen />} />
    </Routes>
  );
}

export default Dashboard;
