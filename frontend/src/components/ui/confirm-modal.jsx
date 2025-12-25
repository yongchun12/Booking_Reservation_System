import { Button } from './button';
import { Loader2 } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, isLoading, confirmText = "Confirm", cancelText = "Cancel", variant = "destructive" }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-background rounded-lg shadow-lg border w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
                    <p className="text-sm text-muted-foreground">
                        {message}
                    </p>
                </div>
                <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        {cancelText}
                    </Button>
                    <Button variant={variant} onClick={onConfirm} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}
