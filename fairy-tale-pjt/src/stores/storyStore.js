import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStoryStore = create(
    persist(
        (set, get) => ({
            // AI 응답 데이터 (3개의 줄거리 배열)
            aiResponse: null,

            // 사용자 입력 데이터
            userInput: {
                topic: '',
                content: ''
            },

            // 선택된 줄거리 인덱스
            selectedPlotIndex: 0,

            // 로딩 상태
            isLoading: false,

            // 에러 상태
            error: null,

            // AI 호출 함수
            callAI: async (topic, content) => {
                set({ isLoading: true, error: null });

                try {
                    // Electron API를 통해 Python AI 호출
                    const response = await window.electronAPI.expandStory({
                        idea: content,
                        style: 'classic'
                    });

                    set({
                        aiResponse: response,
                        userInput: { topic, content },
                        selectedPlotIndex: 0, // 첫 번째 줄거리 선택
                        isLoading: false
                    });

                    return response;
                } catch (error) {
                    set({
                        error: error.message,
                        isLoading: false
                    });
                    throw error;
                }
            },

            // 줄거리 선택
            selectPlot: (plotIndex) => {
                set({ selectedPlotIndex: plotIndex });
            },

            // 상태 초기화
            reset: () => {
                set({
                    aiResponse: null,
                    userInput: { topic: '', content: '' },
                    selectedPlotIndex: 0,
                    isLoading: false,
                    error: null
                });
            },

            // 현재 선택된 줄거리 데이터 가져오기
            getCurrentPlot: () => {
                const state = get();
                if (state.aiResponse && Array.isArray(state.aiResponse) && state.aiResponse.length > 0) {
                    return state.aiResponse[state.selectedPlotIndex] || state.aiResponse[0];
                }
                return state.aiResponse;
            }
        }),
        {
            name: 'story-store', // localStorage key
            partialize: (state) => ({
                aiResponse: state.aiResponse,
                userInput: state.userInput,
                selectedPlotIndex: state.selectedPlotIndex
            })
        }
    )
);

export default useStoryStore;
