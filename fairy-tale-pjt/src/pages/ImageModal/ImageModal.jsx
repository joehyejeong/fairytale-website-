import React, { useState } from 'react';
import { X } from 'lucide-react';
import ImageContent1 from './ImageContent1';
import ImageContent2 from './ImageContent2';

const ImageModal = ({ isOpen, onClose, currentPageIndex }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedStyle, setSelectedStyle] = useState(0);
    const [generationResult, setGenerationResult] = useState(null);

    const handleNext = (selectedStyleFromContent1, imageGenerationResult) => {
        if (selectedStyleFromContent1 !== undefined) {
            setSelectedStyle(selectedStyleFromContent1);
        }
        if (imageGenerationResult) {
            setGenerationResult(imageGenerationResult);
        }
        setCurrentStep(2);
    };

    const handleBack = () => {
        setCurrentStep(1);
    };

    const handleApply = (applyResult) => {
        // 적용이 성공하면 모달을 닫고 상태 초기화
        if (applyResult && applyResult.success) {
            console.log('이미지 적용 완료:', applyResult);
            handleClose();

            // 부모 컴포넌트에 이미지 적용 완료를 알릴 수 있음
            // 필요하다면 onImageApplied 같은 콜백을 props로 받아서 호출
        }
    };

    const handleClose = () => {
        setCurrentStep(1);
        setSelectedStyle(0);
        setGenerationResult(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex justify-center items-center bg-black/70"
            onClick={handleClose}
        >
            <div
                className="bg-white rounded-[8px] relative w-[777px] h-[555px] border-2 border-[var(--jk-yellow)]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Cancel 아이콘 */}
                <button
                    onClick={handleClose}
                    className="absolute w-9 h-9 flex justify-center items-center hover:bg-gray-100 rounded-full transition-colors top-[38px] right-[38px]"
                >
                    <X size={30} className="text-black" />
                </button>

                {/* 콘텐츠 */}
                <div className="flex justify-center items-center h-full">
                    {currentStep === 1 ? (
                        <ImageContent1
                            onNext={handleNext}
                            currentPageIndex={currentPageIndex}
                        />
                    ) : (
                        <ImageContent2
                            onBack={handleBack}
                            selectedStyle={selectedStyle}
                            generationResult={generationResult}
                            onApply={handleApply}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageModal;