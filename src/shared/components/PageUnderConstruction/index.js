import React from 'react';
import PropTypes from 'prop-types';
import AppResource from 'shared/constants/AppResource';
import { useTranslation } from 'react-i18next';

PageUnderConstruction.propTypes = {};

function PageUnderConstruction(props) {
  // MARK: --- Params ---
  const { t } = useTranslation();
  return (
    <div className="w-100 h-100 d-flex justify-content-center align-items-center">
      <div className="d-flex flex-column align-items-center">
        <img
          style={{ objectFit: 'cover' }}
          className="w-50"
          src={AppResource.images.imgPageUnderConstruction}
        />
        <p className="font-size-h3">{t('PageUnderConstruction')}</p>
      </div>
    </div>
  );
}

export default PageUnderConstruction;
