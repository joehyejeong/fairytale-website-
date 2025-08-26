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
    console.log('전체 텍스트:', text);

    const pages = [];

    // 더 유연한 정규식으로 수정
    const pageRegex = /"page"\s*:\s*(\d+)\s*,\s*"content"\s*:\s*"([^"]+)"/g;
    let match;

    console.log('정규식 테스트 시작');
    while ((match = pageRegex.exec(text)) !== null) {
        const pageNum = parseInt(match[1]);
        const content = match[2];

        console.log(`매치 발견: page=${pageNum}, content 길이=${content.length}`);
        console.log(`페이지 ${pageNum} 추출:`, content.substring(0, 100));

        pages.push({
            page: pageNum,
            content: content
        });
    }

    // 페이지 번호 순으로 정렬
    pages.sort((a, b) => a.page - b.page);

    console.log(`총 ${pages.length}개 페이지 추출 완료:`, pages.map(p => p.page));
    return pages;
};

/**
 * AI 응답을 파싱하여 페이지 데이터를 추출합니다
 * @param {Object} bookData - AI 응답이 포함된 bookData 객체
 * @returns {Array} 파싱된 페이지 배열
 */
export const parseBookData = (bookData) => {
    console.log('parseBookData 호출됨, bookData:', bookData);

    // raw_response가 있으면 JSON 파싱
    if (bookData.raw_response) {
        console.log('raw_response 발견, 길이:', bookData.raw_response.length);

        try {
            // JSON 문자열 정리 (제어 문자 제거)
            const cleanResponse = cleanJsonString(bookData.raw_response);
            console.log('정리된 응답:', cleanResponse);

            const parsed = JSON.parse(cleanResponse);
            console.log('파싱된 AI 응답:', parsed);

            if (parsed.pages) {
                console.log('parsed.pages 발견, 개수:', parsed.pages.length);
                return parsed.pages;
            } else {
                console.log('parsed.pages 없음, 전체 parsed:', parsed);
                return [];
            }

        } catch (e) {
            console.error('JSON 파싱 실패:', e);
            console.log('원본 raw_response:', bookData.raw_response);

            // 파싱 실패 시 텍스트에서 페이지 정보 추출 시도
            try {
                console.log('텍스트 추출 시도...');
                const extractedPages = extractPagesFromText(bookData.raw_response);
                console.log('텍스트 추출 결과:', extractedPages);
                return extractedPages;
            } catch (extractError) {
                console.error('페이지 추출도 실패:', extractError);
                return [];
            }
        }
    } else if (bookData.pages) {
        // 기존 pages 구조가 있으면 그대로 사용
        console.log('기존 pages 구조 사용:', bookData.pages);
        return bookData.pages;
    }

    console.log('사용할 수 있는 데이터 없음');
    return [];
};
