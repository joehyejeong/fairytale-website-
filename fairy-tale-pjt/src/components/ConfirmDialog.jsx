import React from 'react';

const ConfirmDialog = ({
    isOpen,
    title,
    message,
    confirmText = "네",
    cancelText = "취소",
    onConfirm,
    onCancel,
    confirmButtonClass = "bg-red-600 hover:bg-red-700",
    cancelButtonClass = "bg-gray-500 hover:bg-gray-600"
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-[51] pointer-events-auto"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        >
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl pointer-events-auto">
                {/* 제목 */}
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {title}
                </h3>

                {/* 메시지 */}
                <p className="text-gray-600 mb-6">
                    {message}
                </p>

                {/* 버튼 그룹 */}
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className={`px-4 py-2 text-white font-medium rounded-md transition-colors ${cancelButtonClass}`}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-white font-medium rounded-md transition-colors ${confirmButtonClass}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
