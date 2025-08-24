import React, { useState } from 'react';
import helperImage from '@/assets/helper.svg';
import SpeechBubble from '@/components/SpeechBubble';

const UnderCharacter = ({ speechBubbleText }) => {
    const [showBubble, setShowBubble] = useState(true);

    const toggleBubble = () => {
        setShowBubble(!showBubble);
    };

    return (
        <div className="fixed bottom-10 left-10">
            <div className="relative">
                {showBubble && speechBubbleText && (
                    <div className="absolute bottom-full left-0 mb-3.5 ml-1">
                        <SpeechBubble text={speechBubbleText} />
                    </div>
                )}
                <img
                    src={helperImage}
                    alt="Helper"
                    onClick={toggleBubble}
                    className="cursor-pointer"
                />
            </div>
        </div>
    );
};

export default UnderCharacter;