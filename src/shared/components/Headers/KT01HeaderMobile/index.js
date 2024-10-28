import 'assets/styles/keen/theme01/layout/brand/dark.css';
import { useEffect, useMemo } from 'react';
import './style.scss';
import AppResource from 'shared/constants/AppResource';
import KTBSDropdown from 'shared/components/OtherKeenComponents/KTBSDropdown';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentProject } from 'app/appSlice';
import { useTranslation } from 'react-i18next';
import PreferenceKeys from 'shared/constants/PreferenceKeys';

function KT01HeaderMobile(props) {
  // MARK: --- Params ---
  const { projects, currentProject } = useSelector((state) => state?.app);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  // MARK: --- Hooks ---
  useEffect(() => {
    // Init header mobile
    if (typeof KTLayoutHeaderMobile !== undefined) {
      KTLayoutHeaderMobile.init('kt_header_mobile');
    }

    // Init header mobile top bar
    if (typeof KTLayoutHeaderTopbar !== undefined) {
      KTLayoutHeaderTopbar.init('kt_header_mobile_topbar_toggle');
    }
  }, []);

  const projectDropdown = useMemo(() => {
    return (
      <div className="mr-5">
        <KTBSDropdown
          toggleElement={
            <div className="topbar-item ml-4">
              <div className="d-flex align-items-center cursor-pointer">
                <div className="font-size-h3">
                  <span className="text-white font-weight-bold mr-1">{`${t('Product')}: `}</span>
                  <span className="text-primary font-weight-bold">
                    {currentProject?.['project_name']}
                  </span>
                </div>
              </div>
            </div>
          }
          toggleWrapperClassName="h-100 d-flex align-items-center"
          dropdownMenuClassName="dropdown-menu-sm"
          dropdownMenuItems={projects.map((item) => {
            return { name: item?.['project_name'], value: item?.id };
          })}
          selectedValue={currentProject?.id}
          onChange={(newValue) => {
            const selectedProject = projects?.find((item) => item?.id === newValue);
            localStorage.setItem(PreferenceKeys.currentProject, JSON.stringify(selectedProject));
            dispatch(setCurrentProject(selectedProject)); // Trigger a re-render by updating state
          }}
        />
      </div>
    );
  }, [projects, currentProject]);

  return (
    <div id="kt_header_mobile" className="header-mobile align-items-center header-mobile-fixed">
      {/* logo */}
      <a href="#">
        <img
          className="h-25px"
          src={AppResource.images.imgLogo}
          alt="logo"
          // style={{
          //     filter: 'invert(96%) sepia(38%) saturate(59%) hue-rotate(118deg) brightness(109%) contrast(100%)',
          // }}
        />
      </a>
      {projectDropdown}
      {/* toolbar */}
      <div className="d-flex align-items-center">
        {/* button sidebar toggle */}
        <button id="kt_aside_mobile_toggle" className="btn p-0 burger-icon burger-icon-left">
          <span className="svg-icon svg-icon-xxl"></span>
        </button>

        {/* button header menu mobile */}
        {/* <button
                    id='kt_header_mobile_toggle'
                    className='btn p-0 burger-icon ml-5'
                >
                    <span className='svg-icon svg-icon-xxl'></span>
                </button> */}

        {/* button top bar menu toggle */}
        <button
          id="kt_header_mobile_topbar_toggle"
          className="btn btn-hover-text-primary p-0 ml-3 border-0 ml-5"
        >
          <span className="svg-icon svg-icon-xl">
            <img alt="avatar" src={AppResource.icons.keens.user} />
          </span>
        </button>
      </div>
    </div>
  );
}

export default KT01HeaderMobile;
