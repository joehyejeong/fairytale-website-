import React from 'react';

const IconButton = ({ icon, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="w-[54px] h-[54px] bg-white border border-custom-jk_yellow rounded-full flex justify-center items-center"
        >
            {icon}
        </button>
    );
};

export default IconButton;