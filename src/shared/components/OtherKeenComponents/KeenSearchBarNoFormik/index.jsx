import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';

function KeenSearchBarNoFormik({
    name,
    type = "text",
    placeholder = "",
    disabled = false,
    className = '',
    onSubmit = null,
    value = '',
    hintText = '',
}) {
    // MARK: --- Params ---
    const typingTimeoutRef = useRef(null);
    const [text, setText] = useState(value);

    // MARK: --- Functions ---
    function handleTextChanged(e) {
        const value = e.target.value;
        setText(value);

        if (!onSubmit) {
            return;
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            onSubmit(value);
        }, 500);
    }

    return (
        <div>
            <div className={`input-icon mr-2 ${className}`}>
                <input
                    id={name}
                    type={type}
                    className="form-control"
                    placeholder={placeholder}
                    value={text}
                    onChange={handleTextChanged}
                    disabled={disabled} // Added disabled attribute
                />
                <span>
                    <i className="fal fa-search text-muted"></i>
                </span>
            </div>
            {!_.isEmpty(hintText) && <span className="form-text text-muted">{hintText}</span>}
        </div>
    );
}

KeenSearchBarNoFormik.propTypes = {
    name: PropTypes.string.isRequired,
    type: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    onSubmit: PropTypes.func,
    value: PropTypes.string,
    hintText: PropTypes.string,
};

export default KeenSearchBarNoFormik;
