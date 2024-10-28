import Authentication from 'modules/Authentication';
import ProdCare from 'modules/prodcare';
import { Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import GuestRoute from 'shared/components/AppRoutes/GuestRoute';
import PrivateRoute from 'shared/components/AppRoutes/PrivateRoute';
import AppToast from 'shared/components/AppToast';
import KTPageError01 from 'shared/components/OtherKeenComponents/KTPageError01';
import AccountListener from 'shared/listeners/AccountListener';
import DataCommonListener from 'shared/listeners/DataCommonListener';

// Load BS
require('bootstrap/dist/js/bootstrap.min');
// Load KT plugins
require('assets/plugins/ktutil');
require('assets/plugins/ktmenu');
require('assets/plugins/ktoffcanvas');
require('assets/plugins/ktcookie');
require('assets/plugins/kttoggle');
// aside
require('assets/plugins/aside/aside');
require('assets/plugins/aside/aside-menu');
require('assets/plugins/aside/aside-toggle');
// header
require('assets/plugins/header/ktheader-mobile');
require('assets/plugins/header/ktheader-topbar');

window.$ = window.jQuery = require('jquery');
window.moment = require('moment');

function App() {
  useEffect(() => {
    if (process.env.REACT_APP_ENVIRONMENT === 'PROD') {
      console.log = () => {};
      console.error = () => {};
      console.warn = () => {};
    }

    // console.log(window.location.host);
  }, [process.env.REACT_APP_ENVIRONMENT]);

  return (
    <>
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/*" element={<Navigate to="/prodcare" />} />

            <Route
              path="/prodcare/*"
              element={
                <PrivateRoute>
                  <ProdCare />
                </PrivateRoute>
              }
            />

            <Route
              path="/auth/*"
              element={
                <GuestRoute>
                  <Authentication />
                </GuestRoute>
              }
            />

            <Route path="*" element={<KTPageError01 />} />
          </Routes>
        </Suspense>
        <AppToast />
        <AccountListener />
        <DataCommonListener />
      </BrowserRouter>
    </>
  );
}

export default App;
