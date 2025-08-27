// src/lib/bookParser.js - 동화책 데이터 파싱 유틸리티

/**
 * JSON 문자열을 정리하여 파싱 가능하게 만듭니다
 * @param {string} rawResponse - 원본 JSON 문자열
 * @returns {string} 정리된 JSON 문자열
 */
export const cleanJsonString = (rawResponse) => {
    let cleaned = rawResponse
        .replace(/\r/g, ' ')           // 캐리지 리턴 제거
        .replace(/\t/g, ' ')           // 탭 제거
        .replace(/\f/g, ' ')           // 폼 피드 제거
        .replace(/\v/g, ' ')           // 수직 탭 제거
        .replace(/\b/g, ' ')           // 백스페이스 제거
        .replace(/\0/g, ' ')           // 널 문자 제거
        .trim();

    // 간단한 따옴표 이스케이프 처리
    // content 필드 내부의 따옴표들을 임시로 다른 문자로 변경
    let inContentField = false;
    let result = '';
    let i = 0;

    while (i < cleaned.length) {
        const char = cleaned[i];
        const nextChars = cleaned.substr(i, 10);

        // "content": 패턴 감지
        if (nextChars.startsWith('"content"')) {
            result += '"content"';
            i += 9;
            // : 찾기
            while (i < cleaned.length && cleaned[i] !== ':') {
                result += cleaned[i];
                i++;
            }
            result += ':'; // : 추가
            i++;
            // 공백 건너뛰기
            while (i < cleaned.length && /\s/.test(cleaned[i])) {
                result += cleaned[i];
                i++;
            }
            // 시작 따옴표
            if (cleaned[i] === '"') {
                result += '"';
                i++;
                inContentField = true;
            }
        } else if (inContentField && char === '"') {
            // content 필드 내부에서 따옴표를 만났을 때
            // 이전 문자가 백슬래시가 아니면 이스케이프 처리
            if (i > 0 && cleaned[i - 1] !== '\\') {
                // 다음 문자를 확인해서 필드 끝인지 판단
                let j = i + 1;
                while (j < cleaned.length && /\s/.test(cleaned[j])) j++;

                if (j < cleaned.length && (cleaned[j] === '}' || cleaned[j] === ',')) {
                    // 필드의 끝
                    result += '"';
                    inContentField = false;
                } else {
                    // 필드 내부의 따옴표 - 이스케이프 처리
                    result += '\\"';
                }
            } else {
                result += char;
            }
            i++;
        } else {
            result += char;
            i++;
        }
    }

    return result;
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

    const pages = [];

    // 이스케이프된 따옴표를 처리하는 개선된 패턴들
    const patterns = [
        // 기본 패턴: 이스케이프된 따옴표 처리
        /"page"\s*:\s*(\d+)\s*,\s*"content"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
        // 공백이 적은 경우
        /"page":\s*(\d+),\s*"content":\s*"((?:[^"\\]|\\.)*)"/g,
        // 다른 필드가 있는 경우를 위한 더 유연한 패턴
        /"page"\s*:\s*(\d+)[^}]*"content"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
        // 패턴 4: 6페이지 특수 케이스 - 백틱과 특수 문자 포함
        /\{\s*"page"\s*:\s*(\d+)\s*,\s*"content"\s*:\s*"([^"]*(?:\\.[^"]*)*?)"\s*\\n\s*\]\s*\\n\s*\}\s*\\n\s*```/g,
        // 패턴 5: 더 관대한 6페이지 패턴 - 끝에 특수 문자열이 있어도 매치
        /"page"\s*:\s*(\d+)\s*,\s*"content"\s*:\s*"((?:[^"\\]|\\.)*?)"\s*(?:\\n\s*\]\s*\\n\s*\}\s*\\n\s*```|")/g
    ];

    let totalMatches = 0;

    for (let i = 0; i < patterns.length; i++) {
        const pattern = patterns[i];
        console.log(`🔍 패턴 ${i + 1} 시도:`, pattern.source);

        let match;
        let patternMatches = 0;

        while ((match = pattern.exec(text)) !== null) {
            const pageNum = parseInt(match[1]);
            let content = match[2];

            // 이스케이프 문자 처리 (단, \n은 제거하지 않음)
            content = content.replace(/\\"/g, '"').replace(/\\\\/g, '\\');

            // 6페이지 특수 처리: 끝부분의 특수 패턴 제거
            content = content.replace(/\\n\s*\]\s*\\n\s*\}\s*\\n\s*```.*$/, '');
            content = content.replace(/\?\?\s*$/, ''); // 끝에 있는 ?? 제거

            // content 끝에 있는 "},{ 패턴 제거
            content = content.replace(/"\s*}\s*,\s*\{\s*$/, '').trim();

            console.log(`✅ 패턴 ${i + 1} 매치 발견: page=${pageNum}, content 길이=${content.length}`);
            console.log(`페이지 ${pageNum} 내용 시작:`, content.substring(0, 100));
            console.log(`페이지 ${pageNum} 내용 끝:`, content.substring(content.length - 50));

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

    // 6페이지 특별 처리 - 더 공격적인 패턴
    if (pages.length === 5 && !pages.find(p => p.page === 6)) {
        console.log('⚠️ 6페이지가 누락됨, 특별 추출 시도...');

        const page6SpecialPatterns = [
            // 일반적인 패턴
            /"page":\s*6\s*,\s*"content":\s*"((?:[^"\\]|\\.)*)"/,
            // 백틱과 특수 문자가 포함된 패턴
            /"page"\s*:\s*6\s*,\s*"content"\s*:\s*"([^"]*(?:\\.[^"]*)*?)"\s*\\n.*?```/,
            // \n]\n}\n```" 끝 패턴 전용 - 기본
            /"page"\s*:\s*6\s*,\s*"content"\s*:\s*"([^"]*(?:\\.[^"]*)*?)"\s*\\n\s*\]\s*\\n\s*\}\s*\\n\s*```"/,
            // \n]\n}\n```" 끝 패턴 - 여러 공백 허용
            /"page"\s*:\s*6\s*,\s*"content"\s*:\s*"([^"]*(?:\\.[^"]*)*?)"\s*\\n\s+\]\s*\\n\s*\}\s*\\n\s*```"/,
            // \n]\n}\n```" 끝 패턴 - 매우 관대한 공백 처리
            /"page"\s*:\s*6\s*,\s*"content"\s*:\s*"([^"]*(?:\\.[^"]*)*?)"[\s\n]*\][\s\n]*\}[\s\n]*```"/,
            // 더 관대한 패턴 - 6페이지만 대상
            /\{\s*"page"\s*:\s*6[^}]*"content"\s*:\s*"([^"]*(?:\\.[^"]*)*?)"/,
            // 매우 관대한 패턴 - content 뒤에 뭐가 와도 상관없음
            /"page"\s*:\s*6.*?"content"\s*:\s*"(.*?)"/s
        ];

        for (const pattern of page6SpecialPatterns) {
            const page6Match = text.match(pattern);
            if (page6Match) {
                let content = page6Match[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\');

                // 특수 문자 정리
                content = content.replace(/\\n\s*\]\s*\\n\s*\}\s*\\n\s*```.*$/, '');
                content = content.replace(/\?\?\s*$/, '');
                content = content.replace(/"\s*}\s*,\s*\{\s*$/, '').trim();

                console.log('✅ 6페이지 특별 추출 성공');
                console.log('6페이지 내용 (처리 후):', content.substring(0, 200));
                pages.push({
                    page: 6,
                    content: content
                });
                break;
            }
        }
    }

    // 페이지 번호 순으로 정렬
    pages.sort((a, b) => a.page - b.page);

    console.log(`🎯 총 ${pages.length}개 페이지 추출 완료`);
    console.log('추출된 페이지 번호들:', pages.map(p => p.page));

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

        // 🔍 전체 raw_response 내용을 500글자씩 나누어서 출력
        console.log('📋 raw_response 전체 내용 (500글자씩 분할):');
        console.log('='.repeat(80));
        const chunkSize = 500;
        for (let i = 0; i < bookData.raw_response.length; i += chunkSize) {
            const chunk = bookData.raw_response.substring(i, i + chunkSize);
            console.log(`청크 ${Math.floor(i / chunkSize) + 1}/${Math.ceil(bookData.raw_response.length / chunkSize)}:`, chunk);
        }
        console.log('='.repeat(80));
        console.log('raw_response 끝부분:', bookData.raw_response.substring(bookData.raw_response.length - 200));

        try {
            // 먼저 원본 그대로 JSON 파싱 시도 (완전한 JSON 구조인 경우)
            let parsed;
            try {
                parsed = JSON.parse(bookData.raw_response);
                console.log('✅ 원본 JSON 파싱 성공');
                console.log('파싱된 객체 키들:', Object.keys(parsed || {}));

                if (parsed.pages && Array.isArray(parsed.pages)) {
                    console.log('📚 parsed.pages 발견, 개수:', parsed.pages.length);
                    console.log('페이지 번호들:', parsed.pages.map(p => p.page));
                    return parsed.pages;
                }
            } catch (originalError) {
                console.log('⚠️ 원본 JSON 파싱 실패:', originalError.message);
                console.log('🔄 정리 후 재시도...');

                // JSON 문자열 정리 후 파싱 시도
                const cleanResponse = cleanJsonString(bookData.raw_response);
                console.log('🧹 정리된 응답 길이:', cleanResponse.length);

                // 정리된 내용도 500글자씩 분할해서 출력
                console.log('🧹 정리된 응답 전체 내용 (500글자씩 분할):');
                console.log('-'.repeat(80));
                for (let i = 0; i < cleanResponse.length; i += chunkSize) {
                    const chunk = cleanResponse.substring(i, i + chunkSize);
                    console.log(`정리된 청크 ${Math.floor(i / chunkSize) + 1}/${Math.ceil(cleanResponse.length / chunkSize)}:`, chunk);
                }
                console.log('-'.repeat(80));

                parsed = JSON.parse(cleanResponse);
                console.log('✅ 정리 후 JSON 파싱 성공');
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
            }

        } catch (e) {
            console.error('❌ JSON 파싱 완전 실패:', e.message);
            console.log('🔄 텍스트 추출 시도...');

            // 파싱 실패 시 텍스트에서 페이지 정보 추출 시도
            try {
                const extractedPages = extractPagesFromText(bookData.raw_response);
                console.log('📖 텍스트 추출 결과:', extractedPages);

                if (extractedPages.length === 0) {
                    console.log('⚠️ 텍스트 추출에서도 페이지를 찾지 못함');
                    console.log('🔍 패턴 매치 실패 원인 분석을 위해 원본 데이터 확인:');
                    console.log('데이터 타입:', typeof bookData.raw_response);
                    console.log('데이터에 "page" 포함 여부:', bookData.raw_response.includes('"page"'));
                    console.log('데이터에 "content" 포함 여부:', bookData.raw_response.includes('"content"'));
                } else if (extractedPages.length < 6) {
                    console.log(`⚠️ ${extractedPages.length}개 페이지만 찾음, 6페이지 추가 검색...`);

                    // 6페이지를 더 적극적으로 찾기
                    const page6Patterns = [
                        /"page"\s*:\s*6\s*,\s*"content"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/g,
                        /"page":\s*6,\s*"content":\s*"([^"]*(?:\\.[^"]*)*)"/g,
                        /\{\s*"page"\s*:\s*6[^}]*"content"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/g
                    ];

                    let found6thPage = false;
                    for (const pattern of page6Patterns) {
                        const match = bookData.raw_response.match(pattern);
                        if (match) {
                            console.log('✅ 6페이지 추가 패턴으로 발견!', match[0].substring(0, 100));
                            found6thPage = true;
                            break;
                        }
                    }

                    if (!found6thPage) {
                        // raw_response 끝부분에서 6페이지 찾기
                        const lastPart = bookData.raw_response.substring(bookData.raw_response.length - 500);
                        console.log('🔍 raw_response 마지막 500글자에서 6페이지 검색:');
                        console.log(lastPart);

                        if (lastPart.includes('"page": 6') || lastPart.includes('"page":6')) {
                            console.log('✅ 마지막 부분에서 6페이지 발견!');
                        } else {
                            console.log('❌ 6페이지를 전혀 찾을 수 없음');
                        }
                    }
                }

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