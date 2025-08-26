// src/lib/bookParser.js - 동화책 데이터 파싱 유틸리티

/**
 * JSON 문자열을 정리하여 파싱 가능하게 만듭니다
 * @param {string} rawResponse - 원본 JSON 문자열
 * @returns {string} 정리된 JSON 문자열
 */
export const cleanJsonString = (rawResponse) => {
    return rawResponse
        .replace(/\n/g, ' ')           // 줄바꿈 제거
        .replace(/\r/g, ' ')           // 캐리지 리턴 제거
        .replace(/\t/g, ' ')           // 탭 제거
        .replace(/\f/g, ' ')           // 폼 피드 제거
        .replace(/\v/g, ' ')           // 수직 탭 제거
        .replace(/\b/g, ' ')           // 백스페이스 제거
        .replace(/\0/g, ' ')           // 널 문자 제거
        .replace(/\\/g, '\\\\')        // 백슬래시 이스케이프
        .replace(/"/g, '\\"')          // 따옴표 이스케이프
        .trim();
};

/**
 * 텍스트에서 페이지 정보를 추출합니다
 * @param {string} text - 페이지 정보가 포함된 텍스트
 * @returns {Array} 페이지 객체 배열
 */
export const extractPagesFromText = (text) => {
    console.log('텍스트에서 페이지 추출 시도:', text.substring(0, 200));

    const pages = [];
    const pageRegex = /"page":\s*(\d+),\s*"content":\s*"([^"]+)"/g;
    let match;

    while ((match = pageRegex.exec(text)) !== null) {
        const pageNum = parseInt(match[1]);
        const content = match[2];

        pages.push({
            page: pageNum,
            content: content
        });

        console.log(`페이지 ${pageNum} 추출:`, content.substring(0, 50));
    }

    // 페이지 번호 순으로 정렬
    pages.sort((a, b) => a.page - b.page);

    console.log(`총 ${pages.length}개 페이지 추출 완료`);
    return pages;
};

/**
 * AI 응답을 파싱하여 페이지 데이터를 추출합니다
 * @param {Object} bookData - AI 응답이 포함된 bookData 객체
 * @returns {Array} 파싱된 페이지 배열
 */
export const parseBookData = (bookData) => {
    // raw_response가 있으면 JSON 파싱
    if (bookData.raw_response) {
        try {
            // JSON 문자열 정리 (제어 문자 제거)
            const cleanResponse = cleanJsonString(bookData.raw_response);
            console.log('정리된 응답:', cleanResponse);

            const parsed = JSON.parse(cleanResponse);
            console.log('파싱된 AI 응답:', parsed);
            return parsed.pages || [];

        } catch (e) {
            console.error('JSON 파싱 실패:', e);
            console.log('원본 raw_response:', bookData.raw_response);

            // 파싱 실패 시 텍스트에서 페이지 정보 추출 시도
            try {
                return extractPagesFromText(bookData.raw_response);
            } catch (extractError) {
                console.error('페이지 추출도 실패:', extractError);
                return [];
            }
        }
    } else if (bookData.pages) {
        // 기존 pages 구조가 있으면 그대로 사용
        return bookData.pages;
    }

    return [];
};
