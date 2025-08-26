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
        .trim();
};

/**
 * 텍스트에서 페이지 정보를 추출합니다
 * @param {string} text - 페이지 정보가 포함된 텍스트
 * @returns {Array} 페이지 객체 배열
 */
export const extractPagesFromText = (text) => {
    console.log('🔍 텍스트에서 페이지 추출 시도');
    console.log('텍스트 길이:', text.length);
    console.log('텍스트 시작 부분:', text.substring(0, 300));
    console.log('텍스트 끝 부분:', text.substring(text.length - 300));

    const pages = [];

    // 여러 가지 패턴으로 페이지 정보 추출 시도
    const patterns = [
        // 기본 패턴: "page": 숫자, "content": "내용"
        /"page"\s*:\s*(\d+)\s*,\s*"content"\s*:\s*"([^"]+)"/g,
        // 대안 패턴: "page": 숫자, "content": "내용" (공백이 적은 경우)
        /"page":\s*(\d+),\s*"content":\s*"([^"]+)"/g,
        // 더 유연한 패턴: page와 content 사이에 다른 필드가 있을 수 있는 경우
        /"page"\s*:\s*(\d+)[^}]*"content"\s*:\s*"([^"]+)"/g,
        // 6페이지를 위한 특별한 패턴: 마지막 페이지가 누락될 수 있는 경우
        /"page"\s*:\s*(\d+)\s*,\s*"content"\s*:\s*"([^"]+)"\s*}/g
    ];

    let totalMatches = 0;

    for (let i = 0; i < patterns.length; i++) {
        const pattern = patterns[i];
        console.log(`🔍 패턴 ${i + 1} 시도:`, pattern.source);

        let match;
        let patternMatches = 0;

        while ((match = pattern.exec(text)) !== null) {
            const pageNum = parseInt(match[1]);
            const content = match[2];

            console.log(`✅ 패턴 ${i + 1} 매치 발견: page=${pageNum}, content 길이=${content.length}`);
            console.log(`페이지 ${pageNum} 내용 시작:`, content.substring(0, 100));

            // 중복 페이지 방지
            if (!pages.find(p => p.page === pageNum)) {
                pages.push({
                    page: pageNum,
                    content: content
                });
                patternMatches++;
            }
        }

        console.log(`패턴 ${i + 1} 결과: ${patternMatches}개 매치`);
        totalMatches += patternMatches;
    }

    // 6페이지가 누락된 경우 특별 처리
    if (pages.length === 5 && !pages.find(p => p.page === 6)) {
        console.log('⚠️ 6페이지가 누락됨, 특별 추출 시도...');

        // 6페이지를 위한 특별한 정규식
        const page6Pattern = /"page":\s*6\s*,\s*"content":\s*"([^"]+)"/;
        const page6Match = text.match(page6Pattern);

        if (page6Match) {
            console.log('✅ 6페이지 특별 추출 성공');
            pages.push({
                page: 6,
                content: page6Match[1]
            });
        } else {
            console.log('❌ 6페이지 특별 추출 실패');
        }
    }

    // 페이지 번호 순으로 정렬
    pages.sort((a, b) => a.page - b.page);

    console.log(`🎯 총 ${pages.length}개 페이지 추출 완료`);
    console.log('추출된 페이지 번호들:', pages.map(p => p.page));
    console.log('페이지별 내용 길이:', pages.map(p => ({ page: p.page, length: p.content.length })));

    return pages;
};

/**
 * AI 응답을 파싱하여 페이지 데이터를 추출합니다
 * @param {Object} bookData - AI 응답이 포함된 bookData 객체
 * @returns {Array} 파싱된 페이지 배열
 */
export const parseBookData = (bookData) => {
    console.log('🚀 parseBookData 호출됨');
    console.log('bookData 타입:', typeof bookData);
    console.log('bookData 키들:', Object.keys(bookData || {}));

    // raw_response가 있으면 JSON 파싱
    if (bookData.raw_response) {
        console.log('📝 raw_response 발견, 길이:', bookData.raw_response.length);
        console.log('raw_response 시작 부분:', bookData.raw_response.substring(0, 200));

        try {
            // JSON 문자열 정리 (제어 문자만 제거, 따옴표는 보존)
            const cleanResponse = cleanJsonString(bookData.raw_response);
            console.log('🧹 정리된 응답 길이:', cleanResponse.length);
            console.log('정리된 응답 시작 부분:', cleanResponse.substring(0, 200));

            const parsed = JSON.parse(cleanResponse);
            console.log('✅ JSON 파싱 성공');
            console.log('파싱된 객체 키들:', Object.keys(parsed || {}));

            if (parsed.pages && Array.isArray(parsed.pages)) {
                console.log('📚 parsed.pages 발견, 개수:', parsed.pages.length);
                console.log('페이지 번호들:', parsed.pages.map(p => p.page));
                return parsed.pages;
            } else {
                console.log('⚠️ parsed.pages 없음 또는 배열이 아님');
                console.log('parsed.pages 타입:', typeof parsed.pages);
                console.log('parsed.pages 값:', parsed.pages);
            }

        } catch (e) {
            console.error('❌ JSON 파싱 실패:', e);
            console.log('파싱 실패한 원본 raw_response:', bookData.raw_response);

            // 파싱 실패 시 텍스트에서 페이지 정보 추출 시도
            try {
                console.log('🔄 텍스트 추출 시도...');
                const extractedPages = extractPagesFromText(bookData.raw_response);
                console.log('📖 텍스트 추출 결과:', extractedPages);
                return extractedPages;
            } catch (extractError) {
                console.error('❌ 페이지 추출도 실패:', extractError);
                return [];
            }
        }
    } else if (bookData.pages && Array.isArray(bookData.pages)) {
        // 기존 pages 구조가 있으면 그대로 사용
        console.log('📚 기존 pages 구조 사용:', bookData.pages.length);
        console.log('페이지 번호들:', bookData.pages.map(p => p.page));
        return bookData.pages;
    }

    console.log('❌ 사용할 수 있는 데이터 없음');
    return [];
};
