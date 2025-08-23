import React, { useState } from 'react';
import smallLogo from '/small_logo.svg';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.jsx';

const Header = () => {
    const [language, setLanguage] = useState('한국어');

    return (
        <header className="h-12 w-full min-w-[1050px] bg-custom-jk_yellow flex items-center justify-between px-5">
            {/* Left side - Logo and Language */}
            <div className="flex items-center">
                {/* Logo with 5px left margin */}
                <img src={smallLogo} alt="직코BOOK 로고" className="w-auto h-auto ml-1" />

                {/* Language Dropdown with 75px margins */}
                <div className="flex items-center mx-18">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center hover:text-custom-jk_dark_yellow transition-colors">
                            <span className="material-symbols-outlined text-white" style={{ fontSize: '19px', width: '19px' }}>
                                language
                            </span>
                            <span className="material-symbols-outlined text-white ml-1" style={{ fontSize: '8px', width: '5px' }}>
                                arrow_drop_down
                            </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="border border-custom-jk_dark_yellow bg-white z-50"
                            style={{ width: '64px', height: '60px' }}
                        >
                            <DropdownMenuItem
                                className="hover:bg-custom-jk_dark_yellow hover:text-white cursor-pointer"
                                onClick={() => setLanguage('English')}
                            >
                                English
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="hover:bg-custom-jk_dark_yellow hover:text-white cursor-pointer"
                                onClick={() => setLanguage('한국어')}
                            >
                                한국어
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="hover:bg-custom-jk_dark_yellow hover:text-white cursor-pointer"
                                onClick={() => setLanguage('简体中文')}
                            >
                                简体中文
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Vertical dotted line - 7 equal parts with 2.5px gaps */}
                <div className="mx-4">
                    <div className="h-6 w-px bg-custom-jk_dark_yellow relative">
                        <div className="absolute top-0 left-0 w-full h-full">
                            {[...Array(7)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-full bg-custom-jk_dark_yellow"
                                    style={{
                                        top: `${(i * 100) / 7}%`,
                                        height: `${100 / 14}%`
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Text Model Status */}
                <div className="flex items-center mx-4">
                    <span className="material-symbols-outlined text-white" style={{ fontSize: '23.33px', width: '21.93px' }}>
                        link_off
                    </span>
                    <span className="ml-2 text-white font-sans font-bold text-sm">텍스트 모델 연결 안 됨</span>
                </div>

                {/* Vertical dotted line */}
                <div className="mx-4">
                    <div className="h-6 w-px bg-custom-jk_dark_yellow relative">
                        <div className="absolute top-0 left-0 w-full h-full">
                            {[...Array(7)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-full bg-custom-jk_dark_yellow"
                                    style={{
                                        top: `${(i * 100) / 7}%`,
                                        height: `${100 / 14}%`
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Image Model Status */}
                <div className="flex items-center mx-4">
                    <span className="material-symbols-outlined text-white" style={{ fontSize: '23.33px', width: '21.93px' }}>
                        link_off
                    </span>
                    <span className="ml-2 text-white font-sans font-bold text-sm">이미지 모델 연결 안 됨</span>
                </div>
            </div>

            {/* Right side - Search, File, Settings */}
            <div className="flex items-center">
                {/* Search Input with 193px margin */}
                <div className="mr-5">
                    <input
                        type="text"
                        placeholder="동화책 제작 프로젝트"
                        className="px-3 py-2 border border-custom-jk_dark_yellow bg-custom-jk_light_yellow text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-custom-jk_dark_yellow rounded"
                        style={{ width: '110px', height: '35px' }}
                    />
                </div>

                {/* File Dropdown */}
                <div className="mr-12">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center hover:text-custom-jk_dark_yellow transition-colors">
                            <span className="material-symbols-outlined text-white" style={{ fontSize: '22px', width: '20px' }}>
                                folder
                            </span>
                            <span className="ml-1 text-white font-sans font-bold text-sm">파일</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="border border-custom-jk_dark_yellow bg-custom-jk_yellow z-50"
                            style={{ width: '187px', height: '106px' }}
                        >
                            <DropdownMenuItem className="hover:bg-custom-jk_dark_yellow hover:text-white cursor-pointer">
                                새로 만들기
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-custom-jk_dark_yellow hover:text-white cursor-pointer">
                                내 컴퓨터에서 불러오기
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-custom-jk_dark_yellow hover:text-white cursor-pointer">
                                컴퓨터에 저장하기
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Settings Icon with 13px margin */}
                <div className="mr-3">
                    <span className="material-symbols-outlined text-white" style={{ fontSize: '19px' }}>
                        settings
                    </span>
                </div>
            </div>
        </header>
    );
};

export default Header;
