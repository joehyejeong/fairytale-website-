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
            case '/create-story':
                return 'createStory';
            case '/create-plot':
                return 'createPlot';
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
                return '줄거리를 생성해주세요';
            case '/create-story':
                return '이야기를 작성해주세요';
            case '/create-plot':
                return '줄거리를 수정해주세요';
            case '/create-image':
                return '이미지를 생성해주세요';
            default:
                return null;
        }
    };

    const progressType = getProgressType();
    const speechBubbleText = getSpeechBubbleText();

    return (
        <div className="min-h-screen bg-white">
            <Header />
            {progressType && <Progress type={progressType} />}
            <main className={`${progressType ? 'pt-[50px]' : ''}`}>
                {children}
            </main>
            <UnderCharacter speechBubbleText={speechBubbleText} />
        </div>
    );
};

export default Layout;