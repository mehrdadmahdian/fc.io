import React, { useState, useEffect } from 'react';

function Form({
    initialData = {},
    onSubmit,
    children,
    submitLabel = 'Submit',
    cancelLabel = 'Cancel',
    onCancel,
    isLoading = false,
}) {
    const [formData, setFormData] = useState(initialData);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update form data when initialData changes (useful for edit mode)
    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when field is modified
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            await onSubmit(formData);
        } catch (error) {
            // Handle validation errors
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({
                    general: error.message || 'An error occurred. Please try again.'
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Clone children with additional props
    const formChildren = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, {
                value: formData[child.props.name] || '',
                onChange: handleChange,
                error: errors[child.props.name],
                disabled: isSubmitting || isLoading
            });
        }
        return child;
    });

    return (
        <form onSubmit={handleSubmit} noValidate>
            {errors.general && (
                <div className="form-error-message">
                    {errors.general}
                </div>
            )}

            {formChildren}

            <div className="form-actions">
                {onCancel && (
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onCancel}
                        disabled={isSubmitting || isLoading}
                    >
                        {cancelLabel}
                    </button>
                )}
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting || isLoading}
                >
                    {isSubmitting ? 'Submitting...' : submitLabel}
                </button>
            </div>
        </form>
    );
}

export default Form; 