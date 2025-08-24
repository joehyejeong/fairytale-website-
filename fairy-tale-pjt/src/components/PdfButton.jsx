import React from 'react';
import { FileText } from 'lucide-react';

const PdfButton = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="bg-custom-jk_red text-white rounded-[5px] flex items-center justify-center gap-2"
            style={{
                width: '180px',
                height: '32px',
                padding: '7px 20px',
                fontFamily: 'Noto Sans KR',
                fontWeight: 500,
                fontSize: '14px'
            }}
        >
            <FileText size={16} />
            <span>PDF 내보내기</span>
        </button>
    );
};

export default PdfButton;
