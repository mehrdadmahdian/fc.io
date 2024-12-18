import React from 'react';

function FormInput({ 
    label, 
    name, 
    value, 
    onChange, 
    placeholder, 
    required, 
    maxLength, 
    type = "text",
    error,
    disabled
}) {
    return (
        <div className={`form-group ${error ? 'has-error' : ''}`}>
            <label htmlFor={name}>{label}</label>
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                maxLength={maxLength}
                disabled={disabled}
            />
            {error && <div className="form-error">{error}</div>}
        </div>
    );
}

export default FormInput; 