import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Progress from './Progress';
import UnderCharacter from './UnderCharacter';

const Layout = ({ children }) => {
    const location = useLocation();

    // 현재 경로에 따라 Progress type 결정
    const getProgressType = () => {
        switch (location.pathname) {
            case '/':
                return null; // '/' 경로에서는 Progress 표시하지 않음
            case '/pre-plot':
                return 'prePlot';
            case '/create-plot':
                return 'createPlot';
            case '/create-story':
                return 'createStory';
            case '/create-image':
                return 'createImage';
            default:
                return null;
        }
    };

    // 현재 경로에 따라 말풍선 텍스트 결정
    const getSpeechBubbleText = () => {
        switch (location.pathname) {
            case '/':
                return '작가 이름을 적어주세요';
            case '/pre-plot':
                return '줄거리를 간단히 적어주세요';
            case '/create-story':
                return '원하는 이야기를 선택하세요';
            case '/create-plot':
                return '원하는 줄거리를 선택하세요';
            case '/create-image':
                return '이야기와 어울리는 이미지를 만들어 보아요';
            default:
                return null;
        }
    };

    const progressType = getProgressType();
    const speechBubbleText = getSpeechBubbleText();

    return (
        <div className="min-h-screen bg-white overflow-x-auto">
            <Header />
            {progressType && <Progress type={progressType} />}
            <main className={`${progressType ? 'pt-[50px]' : ''} min-w-[1026px]`}>
                {children}
            </main>
            {/* <UnderCharacter speechBubbleText={speechBubbleText} /> */}
        </div>
    );
};

export default Layout;