import React from 'react';
import sunIcon from '@/assets/sun.svg';
import { getCurrentDateKorean } from '@/lib/dateUtils';
import useStoryStore from '@/stores/storyStore';

const LeftPage = ({
    isType = content,
    isLastPage = false,
    onImageClick,
    title = "",
    userName = "",
    appliedImage = null,
    pageNumber = 0
}) => {

    // 스토어에서 함수 가져오기
    const { getAppliedImage } = useStoryStore();

    const renderImage = () => {
        // props로 전달된 appliedImage 또는 스토어에서 가져온 이미지 사용
        let imageUrl = appliedImage;

        if (!imageUrl && pageNumber) {
            const storedImage = getAppliedImage(pageNumber);
            console.log(`LeftPage - 페이지 ${pageNumber}의 저장된 이미지:`, storedImage);
            if (storedImage && storedImage !== 'null') {
                // 파일 경로에서 파일명만 추출하여 형식 확인
                const fileName = storedImage.split('/').pop() || storedImage.split('\\').pop();
                console.log(`LeftPage - 파일명:`, fileName);

                // temps 폴더의 이미지는 @/assets/temps 경로로 접근
                if (storedImage.includes('temps')) {
                    imageUrl = `@/assets/temps/${fileName}`;
                } else {
                    imageUrl = `file://${storedImage}`;
                }
            }
        }

        console.log(`LeftPage - 최종 이미지 URL:`, imageUrl, 'appliedImage:', appliedImage);

        if (imageUrl && imageUrl !== 'file://null' && imageUrl !== 'null') {
            return (
                <img
                    src={imageUrl}
                    alt="Applied"
                    className="w-full h-full object-cover object-center"
                    style={{
                        borderRadius: isType == 'cover' ? '8px' : '0px'
                    }}
                    onError={(e) => {
                        // 이미지 로드 실패 시 기본 아이콘으로 대체
                        console.error('이미지 로드 실패:', imageUrl);
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        if (parent && !parent.querySelector('.fallback-icon')) {
                            const fallback = document.createElement('img');
                            fallback.src = sunIcon;
                            fallback.alt = 'Sun';
                            fallback.className = 'fallback-icon';
                            fallback.style.width = isType == 'cover' ? '67px' : '67px';
                            fallback.style.height = isType == 'cover' ? '67px' : '67px';
                            parent.appendChild(fallback);
                        }
                    }}
                />
            );
        } else {
            // 기본 태양 아이콘
            return (
                <img
                    src={sunIcon}
                    alt="Sun"
                    className={`${isType == 'cover' ? 'w-[67px] h-[67px]' : 'w-[67px] h-[67px]'}`}
                />
            );
        }
    };

    if (isType == 'last') { //맞나?
        return (
            <div className="w-[499px] h-[512px] p-[12px] bg-white drop-shadow-[-4px_4px_4px_rgba(0,0,0,0.25)] relative">
                <div className="flex flex-col items-start pt-[140px]">
                    {/* (1) 이미지 공간 */}
                    <div
                        className="w-[160px] h-[158px] bg-custom-jk_light_yellow rounded-lg flex justify-center items-center cursor-pointer transition-transform hover:scale-105 relative overflow-hidden"
                        onClick={onImageClick}
                    >
                        {renderImage()}


                    </div>

                    {/* (2) 제목 텍스트 */}
                    <div className="mt-[12px] font-noto font-medium text-lg text-black">
                        {title || '제목을 입력해주세요'}
                    </div>

                    {/* (3) 메타데이터 3개 */}
                    <div className="mt-[37px] space-y-[7px]">
                        {/* 첫번째: 발행일 */}
                        <div className="flex flex-row items-center">
                            <span className="font-noto font-medium text-[13px] text-black">
                                발행일
                            </span>
                            <span className="ml-[17px] font-noto font-light text-[13px] text-black">
                                {getCurrentDateKorean()}
                            </span>
                        </div>

                        {/* 두번째: 지은이 */}
                        <div className="flex flex-row items-center">
                            <span className="font-noto font-medium text-[13px] text-black">
                                지은이
                            </span>
                            <span className="ml-[17px] font-noto font-light text-[13px] text-black">
                                {userName || '직코'}
                            </span>
                        </div>

                        {/* 세번째: 제작 */}
                        <div className="flex flex-row items-center">
                            <span className="font-noto font-medium text-[13px] text-black">
                                제작
                            </span>
                            <span className="ml-[17px] font-noto font-light text-[13px] text-black">
                                직코BOOK
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-[499px] h-[512px] ${isType == 'cover' ? 'bg-white' : 'bg-custom-jk_light_yellow'} drop-shadow-[-4px_4px_4px_rgba(0,0,0,0.25)] flex justify-center items-center relative`}>
            {isType == 'cover' ? (
                /* 표지인 경우 - jk_light_yellow 배경 부분만 클릭 가능 */
                <div
                    className="w-[160px] h-[160px] bg-custom-jk_light_yellow rounded-lg flex justify-center items-center cursor-pointer transition-transform hover:scale-105 relative overflow-hidden"
                    onClick={onImageClick}
                >
                    {renderImage()}


                </div>
            ) : (
                /* 일반 페이지인 경우 - 전체 배경이 클릭 가능 */
                <div
                    className="w-full h-full flex justify-center items-center cursor-pointer transition-transform hover:scale-[1.02] relative overflow-hidden"
                    onClick={onImageClick}
                // style={{
                //     backgroundImage: (appliedImage || (pageNumber && getAppliedImage(pageNumber) && getAppliedImage(pageNumber) !== 'null')) ?
                //         `url(${appliedImage || `file://${getAppliedImage(pageNumber)}`})` : 'none',
                //     backgroundSize: 'cover',
                //     backgroundPosition: 'center',
                //     backgroundRepeat: 'no-repeat'
                // }}
                >
                    {renderImage()}

                </div>
            )}
        </div>
    );
};

export default LeftPage;