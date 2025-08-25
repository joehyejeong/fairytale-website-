import React from 'react';

const SmallIconButton = ({ icon, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="bg-custom-jk_light_yellow rounded-full flex justify-center items-center border-none"
            style={{
                border: 'none',
                width: '47px', // 31px * 1.5
                height: '47px' // 31px * 1.5
            }}
        >
            <div className="text-custom-jk_yellow">
                {icon}
            </div>
        </button>
    );
};

export default SmallIconButton;
