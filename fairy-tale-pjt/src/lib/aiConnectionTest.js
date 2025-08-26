// AI 모델 연결 상태 테스트 유틸리티

/**
 * 모든 AI 모델 연결 상태 테스트
 * @returns {Promise<{text: boolean, image: boolean}>} 각 모델별 연결 상태
 */
export const testAllAIConnections = async () => {
    try {
        console.log('🔍 AI 연결 테스트 시작...');
        console.log('📡 window.electronAPI.testAIConnection 호출 중...');

        // Python 스크립트를 통해 연결 상태만 확인 (실제 AI 요청 없음)
        const response = await window.electronAPI.testAIConnection();

        console.log('📥 Electron에서 받은 응답:', response);
        console.log('📊 응답 타입:', typeof response);
        console.log('📋 응답 구조:', JSON.stringify(response, null, 2));

        if (response) {
            const result = {
                text: response.text?.connected || false,
                image: response.image?.connected || false
            };
            console.log('✅ 파싱된 결과:', result);
            return result;
        }

        console.log('❌ 응답이 없음');
        return { text: false, image: false };
    } catch (error) {
        console.error('💥 AI 연결 테스트 실패:', error);
        console.error('🔍 에러 상세:', error.message);
        console.error('📚 에러 스택:', error.stack);
        return { text: false, image: false };
    }
};
