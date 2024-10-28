import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

Loading.propTypes = {
    message: PropTypes.string,
    showBackground: PropTypes.bool,
};

function Loading({ message = 'Loading', showBackground = true }) {
    const { t } = useTranslation();

    return (
        <div className={`blockui ${!showBackground ? 'bg-light-primary shadow-none' : ''}`}>
            <span className={`${!showBackground ? 'text-primary' : ''}`}>{`${t(message)}...`}</span>
            <span className="spinner spinner-loader spinner-primary"></span>
        </div>
    );
}

export default Loading;
