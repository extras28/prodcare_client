import { Route, Routes } from 'react-router-dom';
import IssueDetailScreen from './screens/IssueDetailScreen';
import IssueHomePage from './screens/IssueHomeScreen';

Issue.propTypes = {};

function Issue(props) {
  return (
    <Routes>
      <Route path="/" element={<IssueHomePage />} />
      <Route path="/detail/:issueId" element={<IssueDetailScreen />} />
    </Routes>
  );
}

export default Issue;
