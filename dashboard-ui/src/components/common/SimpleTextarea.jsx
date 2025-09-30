import React from 'react';

const SimpleTextarea = ({ 
    label, 
    name, 
    value = '', 
    onChange, 
    placeholder, 
    required, 
    rows = 3,
    disabled 
}) => {
    return (
        <div className="form-group">
            <label htmlFor={name}>
                {label}
                {required && <span className="required"> *</span>}
            </label>
            <textarea
                id={name}
                name={name}
                className="form-control simple-textarea"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                disabled={disabled}
                required={required}
            />
        </div>
    );
};

export default SimpleTextarea;
