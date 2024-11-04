import React from 'react';
import PropTypes from 'prop-types';
import AppResource from 'shared/constants/AppResource';

AuthenticationBaseLayout.propTypes = {};

function AuthenticationBaseLayout(props) {
  // --- params: ---
  const { children } = props;
  return (
    <div
      className="min-vh-100 m-0"
      style={{
        backgroundImage: `url(${AppResource.images.imgSignInBG})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        // aspectRatio: '580/633',
        width: '100%',
      }}
    >
      {/* <div
        className="col-6 justify-content-center align-items-center d-none d-md-flex"
        style={{ backgroundColor: 'rgba(255, 250, 237, 1)' }}
      >
        <div
          style={{
            backgroundImage: `url(${AppResource.images.imgSignInBG})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            aspectRatio: '580/633',
            width: '50%',
          }}
        ></div>
      </div>
      <div className="col-md-6 col-12 p-0 bg-white d-flex">
        <img
          className="position-fixed bottom-0 d-block d-md-none w-100"
          src={AppResource.images.imgAuthenticationBgMobile}
        />
        {children}
      </div> */}
      {children}
    </div>
  );
}

export default AuthenticationBaseLayout;
