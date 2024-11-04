import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProjectHomePage from './screens/ProjectHomeScreen';

Project.propTypes = {};

function Project(props) {
  return (
    <Routes>
      <Route path="/" element={<ProjectHomePage />} />
      {/* <Route path="home/*" element={<ProjectHomePage />} /> */}
    </Routes>
  );
}

export default Project;
