import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";

function ActionsMenu({ actions, buttonContent, buttonClassName = '', disabled = false }) {
    const { t } = useTranslation();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={disabled}>
                <button
                    type="button"
                    className={buttonClassName}
                    disabled={disabled}
                >
                    {buttonContent || (
                        <>
                            <i className="fas fa-ellipsis-v"></i>
                            <span>{t('common.actions')}</span>
                        </>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {actions.map((action, index) => {
                    if (action.divider) {
                        return <DropdownMenuSeparator key={`divider-${index}`} />;
                    }

                    return (
                        <DropdownMenuItem
                            key={action.id || index}
                            onClick={action.onClick}
                            disabled={action.disabled}
                            className={action.danger ? 'text-red-600 focus:text-red-600' : ''}
                        >
                            {action.icon && <i className={`fas ${action.icon} mr-2`}></i>}
                            <span>{action.label}</span>
                            {action.shortcut && (
                                <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
                            )}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default ActionsMenu;
