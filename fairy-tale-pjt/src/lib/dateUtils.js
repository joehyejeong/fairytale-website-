// 날짜 관련 유틸리티 함수들

/**
 * 오늘 날짜를 한국어 형식으로 반환
 * @returns {string} "2025년 01월 15일" 형식의 문자열
 */
export const getCurrentDateKorean = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}년 ${month}월 ${day}일`;
};

/**
 * 오늘 날짜를 간단한 형식으로 반환
 * @returns {string} "2025.01.15" 형식의 문자열
 */
export const getCurrentDateSimple = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}.${month}.${day}`;
};

/**
 * 특정 날짜를 한국어 형식으로 변환
 * @param {Date} date - 변환할 날짜
 * @returns {string} "2025년 01월 15일" 형식의 문자열
 */
export const formatDateKorean = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}년 ${month}월 ${day}일`;
};
