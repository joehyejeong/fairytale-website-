import React, { useState } from 'react';
import { X } from 'lucide-react';
import ImageContent1 from './ImageContent1';
import ImageContent2 from './ImageContent2';

const ImageModal = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedStyle, setSelectedStyle] = useState(0);

    const handleNext = (selectedStyleFromContent1) => {
        if (selectedStyleFromContent1 !== undefined) {
            setSelectedStyle(selectedStyleFromContent1);
        }
        setCurrentStep(2);
    };

    const handleBack = () => {
        setCurrentStep(1);
    };

    const handleApply = () => {
        // 적용하기 로직
        console.log('Applying style:', selectedStyle);
        onClose();
    };

    const handleClose = () => {
        setCurrentStep(1); // currentStep을 1로 초기화
        setSelectedStyle(0); // selectedStyle도 초기화
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex justify-center items-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
            onClick={handleClose}
        >
            <div
                className="bg-white rounded-[8px] relative"
                style={{
                    width: '777px', // 518 * 1.5
                    height: '555px', // 370 * 1.5
                    border: '2px solid var(--jk-yellow)' // 1px * 1.5
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Cancel 아이콘 */}
                <button
                    onClick={handleClose}
                    className="absolute w-9 h-9 flex justify-center items-center hover:bg-gray-100 rounded-full transition-colors"
                    style={{
                        top: '38px', // 25px * 1.5
                        right: '38px' // 25px * 1.5
                    }}
                >
                    <X size={30} className="text-black" /> {/* 20 * 1.5 */}
                </button>

                {/* 콘텐츠 */}
                <div className="flex justify-center items-center h-full">
                    {currentStep === 1 ? (
                        <ImageContent1 onNext={handleNext} />
                    ) : (
                        <ImageContent2
                            onBack={handleBack}
                            selectedStyle={selectedStyle}
                            onApply={handleApply}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageModal;
