import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import YearReportTable from '../../components/YearReportTable';
import MonthReportTable from '../../components/MonthReportTable';
import WeekReportTable from '../../components/WeekReportTable';
import QuarterReportTable from '../../components/QuarterReportTable';

DashboardHomeScreen.propTypes = {};

function DashboardHomeScreen(props) {
  // MARK: --- Params ---
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <div>
      <div className="card card-custom">
        <div className="card-header card-header-tabs-line">
          <div className="card-title">
            <h3 className="card-label">{t('Report')}</h3>
          </div>
          <div className="card-toolbar">
            <ul className="nav nav-tabs nav-bold nav-tabs-line">
              <li className="nav-item">
                <a
                  className={`nav-link cursor-pointer ${selectedTab === 0 ? 'active' : ''}`}
                  data-toggle="tab"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedTab(0);
                  }}
                >
                  <span className="nav-icon">
                    <i className="fa-regular fa-calendar-range"></i>
                  </span>
                  <span className="nav-text">{t('Year')}</span>
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link cursor-pointer ${selectedTab === 1 ? 'active' : ''}`}
                  data-toggle="tab"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedTab(1);
                  }}
                >
                  <span className="nav-icon">
                    <i className="fa-regular fa-calendar-lines"></i>
                  </span>
                  <span className="nav-text">{t('Quarter')}</span>
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link cursor-pointer ${selectedTab === 2 ? 'active' : ''}`}
                  data-toggle="tab"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedTab(2);
                  }}
                >
                  <span className="nav-icon">
                    <i className="fa-regular fa-calendar-days"></i>
                  </span>
                  <span className="nav-text">{t('Month')}</span>
                </a>
              </li>
              {/* <li className="nav-item">
                <a
                  className={`nav-link cursor-pointer ${selectedTab === 3 ? 'active' : ''}`}
                  data-toggle="tab"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedTab(3);
                  }}
                >
                  <span className="nav-icon">
                    <i className="fa-regular fa-calendar-week"></i>
                  </span>
                  <span className="nav-text">{t('Week')}</span>
                </a>
              </li> */}
            </ul>
          </div>
        </div>
        <div className="">
          <div className="tab-content">
            {selectedTab === 0 ? (
              <div>
                <YearReportTable />
              </div>
            ) : null}
            {selectedTab === 1 ? (
              <div>
                <QuarterReportTable />
              </div>
            ) : null}
            {selectedTab === 2 ? (
              <div>
                <MonthReportTable />
              </div>
            ) : null}
            {selectedTab === 3 ? (
              <div>
                <WeekReportTable />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHomeScreen;
