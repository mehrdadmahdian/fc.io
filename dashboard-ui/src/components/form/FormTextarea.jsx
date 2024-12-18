import React from 'react';

function FormTextarea({ label, name, value, onChange, placeholder, rows = 4, maxLength }) {
    return (
        <div className="form-group">
            <label htmlFor={name}>{label}</label>
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                maxLength={maxLength}
            />
        </div>
    );
}

export default FormTextarea; 