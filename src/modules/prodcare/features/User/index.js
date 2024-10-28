import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, Route, Routes } from 'react-router-dom';
import UserHomePage from './screens/UserHomeScreen';

User.propTypes = {};

function User(props) {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="home" />} />
      <Route path="home/*" element={<UserHomePage />} />
    </Routes>
  );
}

export default User;
