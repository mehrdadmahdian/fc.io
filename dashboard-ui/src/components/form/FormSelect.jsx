import React from 'react';

function FormSelect({ label, name, value, onChange, options }) {
    return (
        <div className="form-group">
            <label htmlFor={name}>{label}</label>
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default FormSelect; 