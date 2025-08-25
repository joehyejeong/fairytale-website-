import React from 'react';

const Progress = ({ type }) => {
    // type에 따라 활성화된 단계 결정
    const getActiveStep = () => {
        switch (type) {
            case 'name':
            case 'prePlot':
                return 'plot';
            case 'createPlot':
                return 'plot';
            case 'createStory':
                return 'story';
            case 'createImage':
                return 'image';
            default:
                return null;
        }
    };

    const activeStep = getActiveStep();

    // '/' 경로에서는 Progress를 표시하지 않음
    if (!activeStep) {
        return null;
    }

    const getStepStyle = (step) => {
        const isActive = activeStep === step;
        return isActive
            ? "bg-custom-jk_yellow text-white px-3 py-2 rounded-[5px]"
            : "bg-custom-jk_light_yellow text-black px-3 py-2 rounded-[5px]";
    };

    return (
        <div className="fixed top-12 left-0 right-0 h-[50px] min-h-[50px] bg-custom-jk_light_yellow flex justify-center items-center z-50">
            <div className="w-1/3 flex items-center justify-between">
                <div className={`${getStepStyle('plot')} transition-all duration-200 hover:bg-custom-jk_yellow min-w-[80px] min-h-[36px] flex items-center justify-center`}>
                    줄거리 생성
                </div>

                <span className="material-symbols-outlined text-black" style={{ fontSize: '12px', width: '7.41px', height: '12px' }}>
                    chevron_right
                </span>

                <div className={`${getStepStyle('story')} transition-all duration-200 hover:bg-custom-jk_yellow min-w-[80px] min-h-[36px] flex items-center justify-center`}>
                    글 생성
                </div>

                <span className="material-symbols-outlined text-black" style={{ fontSize: '12px', width: '7.41px', height: '12px' }}>
                    chevron_right
                </span>

                <div className={`${getStepStyle('image')} transition-all duration-200 hover:bg-custom-jk_yellow min-w-[80px] min-h-[36px] flex items-center justify-center`}>
                    이미지 생성
                </div>
            </div>
        </div>
    );
};

export default Progress;