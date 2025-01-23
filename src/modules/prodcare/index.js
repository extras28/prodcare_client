import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router-dom';
import KT01BaseLayout from 'shared/components/BaseLayout/KT01BaseLayout';
import Component from './features/Component';
import Customer from './features/Customer';
import Dashboard from './features/Dashboard';
import Product from './features/Product';
import Issue from './features/Issue';
import Project from './features/Project';
import User from './features/User';

ProdCare.propTypes = {};

function ProdCare(props) {
  // MARK: --- props ---
  const { t } = useTranslation();

  return (
    <KT01BaseLayout>
      <div id="prodcare-container" className="container-fluid min-h-100 px-6">
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/admin/user/*" element={<User />} />
          <Route path="/admin/customer/*" element={<Customer />} />
          <Route path="/admin/project/*" element={<Project />} />
          <Route path="/operating/component/*" element={<Component />} />
          <Route path="/operating/product/*" element={<Product />} />
          <Route path="/operating/issue/*" element={<Issue />} />
        </Routes>
      </div>
    </KT01BaseLayout>
  );
}

export default ProdCare;
