import React from 'react';
import PropTypes from 'prop-types';

KT01Content.propTypes = {};

function KT01Content(props) {
  return (
    <div id="kt_content" className="content d-flex flex-column flex-column-fluid zindex-1 py-2">
      {props.children}
    </div>
  );
}

export default KT01Content;
