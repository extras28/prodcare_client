import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import './style.scss';

export const KTTooltipPositions = {
  autoStart: 'auto-start',
  auto: 'auto',
  autoEnd: 'auto-end',
  topStart: 'top-start',
  top: 'top',
  topEnd: 'top-end',
  rightStart: 'right-start',
  right: 'right',
  rightEnd: 'right-end',
  bottomEnd: 'bottom-end',
  bottom: 'bottom',
  bottomStart: 'bottom-start',
  leftEnd: 'left-end',
  left: 'left',
  leftStart: 'left-start',
};

KTTooltip.propTypes = {
  position: PropTypes.oneOf(Object.values(KTTooltipPositions)),
  text: PropTypes.string,
  element: PropTypes.element,
  additionalClassname: PropTypes.string,
  children: PropTypes.node.isRequired, // Add children prop type
};

/**
 *
 * @param {{position: string, text: string, element: ReactNode, additionalClassname: string, children: ReactNode}} props
 * @returns
 */
function KTTooltip({
  position = KTTooltipPositions.top,
  text = '',
  element = null,
  additionalClassname = '',
  children,
}) {
  return (
    <div className={`KTTooltip ${additionalClassname}`}>
      {text.length > 0 || element ? (
        <OverlayTrigger
          placement={position}
          overlay={<Tooltip style={{ width: 'fit-content' }}>{element ?? text}</Tooltip>}
        >
          {children}
        </OverlayTrigger>
      ) : (
        <>{children}</>
      )}
    </div>
  );
}

export default KTTooltip;
