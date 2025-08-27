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

            // 사용자 이름
            name: '',

            // 선택된 줄거리 인덱스
            selectedPlotIndex: 0,

            // 동화책 데이터 (제목과 페이지별 내용)
            bookData: {
                title: '',
                page1: '',
                page2: '',
                page3: '',
                page4: '',
                page5: '',
                page6: ''
            },

            // 이미지 관련 추가 상태
            currentPageIndex: 0,
            appliedImages: {}, // 페이지별 적용된 이미지 경로 저장

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

            // 동화책 데이터 저장
            saveBookData: (title, pages) => {
                const bookData = {
                    title: title || '',
                    page1: pages[0]?.content || '',
                    page2: pages[1]?.content || '',
                    page3: pages[2]?.content || '',
                    page4: pages[3]?.content || '',
                    page5: pages[4]?.content || '',
                    page6: pages[5]?.content || ''
                };

                set({ bookData });
                console.log('동화책 데이터 저장됨:', bookData);
            },

            // 동화책 데이터 가져오기
            getBookData: () => {
                return get().bookData;
            },

            // 특정 페이지 내용 가져오기 (기존 방식과 새로운 방식 모두 지원)
            getPageContent: (pageNumber) => {
                const state = get();

                // 기존 방식 (pageNumber가 1-6)
                if (pageNumber >= 1 && pageNumber <= 6) {
                    const pageKey = `page${pageNumber}`;
                    return state.bookData[pageKey] || '';
                }

                // 새로운 방식 (CreateImage에서 사용하는 페이지 인덱스)
                if (pageNumber === 0) return ''; // 표지

                // 페이지 인덱스를 실제 내용으로 매핑
                const pageMapping = {
                    1: state.bookData.page1 || '',  // 1-2페이지 -> page1
                    2: state.bookData.page2 || '',  // 3-4페이지 -> page2
                    3: state.bookData.page3 || '',  // 5-6페이지 -> page3
                    4: state.bookData.page4 || '',  // 7-8페이지 -> page4
                    5: state.bookData.page5 || '',  // 9-10페이지 -> page5
                    6: state.bookData.page6 || '',  // 11-12페이지 -> page6
                    7: '' // 13페이지 (마지막 페이지)
                };

                return pageMapping[pageNumber] || '';
            },

            // 제목 가져오기
            getTitle: () => {
                return get().bookData.title;
            },

            // 이름 저장
            saveName: (name) => {
                set({ name });
            },

            // 이름 가져오기
            getName: () => {
                return get().name;
            },

            // 현재 페이지 인덱스 설정 (새로 추가)
            setCurrentPageIndex: (index) => {
                set({ currentPageIndex: index });
            },

            // 현재 페이지 인덱스 가져오기 (새로 추가)
            getCurrentPageIndex: () => {
                return get().currentPageIndex;
            },

            // 적용된 이미지 저장 (새로 추가)
            setAppliedImage: (pageNumber, imagePath) => {
                const state = get();
                set({
                    appliedImages: {
                        ...state.appliedImages,
                        [pageNumber]: imagePath
                    }
                });
            },

            // 적용된 이미지 가져오기 (새로 추가)
            getAppliedImage: (pageNumber) => {
                const state = get();
                return state.appliedImages[pageNumber] || null;
            },

            // 상태 초기화
            reset: () => {
                set({
                    aiResponse: null,
                    userInput: { topic: '', content: '' },
                    selectedPlotIndex: 0,
                    bookData: {
                        title: '',
                        page1: '',
                        page2: '',
                        page3: '',
                        page4: '',
                        page5: '',
                        page6: ''
                    },
                    name: '',
                    currentPageIndex: 0,
                    appliedImages: {},
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
                selectedPlotIndex: state.selectedPlotIndex,
                bookData: state.bookData,
                name: state.name,
                currentPageIndex: state.currentPageIndex,
                appliedImages: state.appliedImages
            })
        }
    )
);

export default useStoryStore;