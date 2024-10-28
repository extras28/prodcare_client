import { useEffect } from 'react';
import AppResource from 'shared/constants/AppResource';

const KTScrolltop = require('assets/plugins/ktscrolltop');

function KTScrollTop(props) {
  // MARK: --- Hooks ---
  useEffect(() => {
    if (typeof KTScrolltop !== undefined) {
      new KTScrolltop('kt_scrolltop', {
        offset: 100,
        speed: 20,
      });
    }
  }, []);

  return (
    <div id="kt_scrolltop" className="scrolltop" style={{ zIndex: '1022' }}>
      <img
        alt="up"
        src={AppResource.icons.keens.up}
        style={{
          filter:
            'invert(100%) sepia(0%) saturate(7500%) hue-rotate(156deg) brightness(121%) contrast(115%)',
        }}
      />
    </div>
  );
}

export default KTScrollTop;
