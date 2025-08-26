// electron/main.cjs - Ollama gemma3:4b 모델용
const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
    console.log('createWindow 함수 실행');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('app.isPackaged:', app.isPackaged);
    console.log('isDev:', isDev);

    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs'),
            webSecurity: false,
        },
    });

    if (isDev) {
        const devUrl = 'http://localhost:5173';
        console.log('개발 모드 URL 로드:', devUrl);

        const loadDevURL = async () => {
            try {
                await mainWindow.loadURL(devUrl);
                console.log('✅ Vite 서버 연결 성공!');
                mainWindow.webContents.openDevTools();
            } catch (error) {
                console.error('❌ Vite 서버 연결 실패:', error);
                setTimeout(() => {
                    console.log('🔄 Vite 서버 연결 재시도 중...');
                    loadDevURL();
                }, 5000);
            }
        };

        loadDevURL();

        mainWindow.webContents.on('did-start-loading', () => {
            console.log('📱 페이지 로딩 시작');
        });

        mainWindow.webContents.on('did-finish-load', () => {
            console.log('✅ 페이지 로딩 완료');
        });

        mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
            console.error('❌ 페이지 로딩 실패:', { errorCode, errorDescription, validatedURL });

            if (errorCode === -6) {
                console.error('🚨 ERR_CONNECTION_REFUSED: Vite 서버가 실행되지 않았습니다.');
                console.log('💡 해결 방법: 새 터미널에서 npm run dev 실행');
            }

            setTimeout(() => {
                console.log('🔄 로딩 실패, 재시도 중...');
                loadDevURL();
            }, 10000);
        });

    } else {
        const prodPath = path.join(__dirname, '../dist/index.html');
        console.log('프로덕션 모드 파일 로드:', prodPath);
        mainWindow.loadFile(prodPath);
    }

    console.log('메인 윈도우 생성 완료');
}

// Python 실행기 찾기
function findPythonExecutable() {
    const possiblePaths = [
        'python',
        'python3',
        'py'
    ];
    return process.platform === 'win32' ? 'python' : 'python3';
}

// Ollama 서버 상태 확인
async function checkOllamaServer() {
    console.log('=== Ollama 서버 상태 체크 ===');
    return new Promise((resolve) => {
        const http = require('http');
        const req = http.get('http://localhost:11434/api/version', (res) => {
            if (res.statusCode === 200) {
                console.log('✅ Ollama 서버가 실행 중입니다');
                resolve(true);
            } else {
                console.log('❌ Ollama 서버 응답 오류:', res.statusCode);
                resolve(false);
            }
        });

        req.on('error', (error) => {
            console.log('❌ Ollama 서버 연결 실패:', error.message);
            console.log('💡 해결 방법: 터미널에서 "ollama serve" 실행');
            resolve(false);
        });

        req.setTimeout(3000, () => {
            console.log('❌ Ollama 서버 연결 타임아웃');
            req.destroy();
            resolve(false);
        });
    });
}

// AI 호출 핸들러
ipcMain.handle('expand-story', async (event, { idea, style }) => {
    console.log('=== AI 호출 시작 ===');
    console.log('입력 데이터:', { idea, style });

    return new Promise(async (resolve) => {
        // 1. Ollama 서버 상태 확인
        const ollamaRunning = await checkOllamaServer();
        if (!ollamaRunning) {
            console.log('⚠️ Ollama 서버가 실행되지 않음, 폴백 응답 생성');
            resolve(createFallbackResponse(idea, style, 'Ollama 서버가 실행되지 않았습니다. "ollama serve" 명령어로 서버를 시작해주세요.'));
            return;
        }

        // 2. Python 스크립트 실행
        const pythonScript = path.join(__dirname, '../python/controllers/story_expander.py');
        const pythonExecutable = findPythonExecutable();

        console.log('Python 실행기:', pythonExecutable);
        console.log('Python 스크립트:', pythonScript);

        // 파일 존재 확인
        const fs = require('fs');
        if (!fs.existsSync(pythonScript)) {
            console.error('❌ Python 스크립트를 찾을 수 없음:', pythonScript);
            resolve(createFallbackResponse(idea, style, 'Python 스크립트 파일을 찾을 수 없습니다.'));
            return;
        }

        const python = spawn(pythonExecutable, [pythonScript, idea, style || 'classic'], {
            env: {
                ...process.env,
                PYTHONIOENCODING: 'utf-8',
                PYTHONPATH: path.join(__dirname, '../python'),
                OLLAMA_HOST: 'localhost:11434',
                OLLAMA_ORIGINS: '*',
                OLLAMA_MODELS_PATH: process.env.OLLAMA_MODELS_PATH || ''
            },
            cwd: path.join(__dirname, '../python'),
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';
        let hasOutput = false;

        python.stdout.on('data', (data) => {
            const output = data.toString();
            stdout += output;
            hasOutput = true;
            console.log('Python stdout:', output);
        });

        python.stderr.on('data', (data) => {
            const errorOutput = data.toString();
            stderr += errorOutput;
            console.log('Python stderr:', errorOutput);
        });

        python.on('error', (err) => {
            console.error('❌ Python 프로세스 에러:', err);
            resolve(createFallbackResponse(idea, style, `Python 실행 오류: ${err.message}`));
        });

        python.on('close', (code) => {
            console.log('🐍 Python 프로세스 종료, 코드:', code);
            console.log('📊 최종 결과 길이:', stdout.length);
            console.log('❌ 최종 에러:', stderr);

            if (code === 0 && hasOutput && stdout.trim()) {
                try {
                    // JSON 파싱 시도
                    const result = JSON.parse(stdout.trim());
                    console.log('✅ JSON 파싱 성공, 결과 타입:', Array.isArray(result) ? 'array' : 'object');

                    // 배열이 아니면 배열로 감싸기 (CreatePlot.jsx가 배열을 기대)
                    const finalResult = Array.isArray(result) ? result : [result];
                    console.log('📖 최종 결과 개수:', finalResult.length);

                    // 각 스토리 정보 로깅
                    finalResult.forEach((story, index) => {
                        console.log(`스토리 ${index + 1}: ${story.title}`);
                        console.log(`   상태: ${story.processing_status}`);
                    });

                    resolve(finalResult);
                    return;
                } catch (parseError) {
                    console.log('❌ JSON 파싱 실패:', parseError.message);
                    console.log('원본 출력 (처음 200자):', stdout.substring(0, 200));

                    // JSON 파싱 실패 시에도 내용이 있으면 활용
                    if (stdout.trim().length > 10) {
                        resolve(createFallbackResponseWithContent(idea, style, stdout.trim()));
                        return;
                    }
                }
            }

            // 모든 것이 실패한 경우
            console.log('❌ 모든 처리 실패, 폴백 응답 생성');
            const errorInfo = stderr || `Python 종료 코드: ${code}`;
            resolve(createFallbackResponse(idea, style, errorInfo));
        });

        // 타임아웃 없음 - AI 응답에 충분한 시간 제공
        console.log('⏳ Python AI 처리 중... (타임아웃 없음)');
    });
});

// 기본 폴백 응답 생성
function createFallbackResponse(idea, style, errorMsg = '') {
    console.log('🔄 폴백 응답 생성:', { idea, style, errorMsg });

    return [{
        title: `${idea}의 이야기`,
        character: "용감한 주인공",
        background: "신비로운 세계",
        plot: `${idea}를 바탕으로 한 흥미진진한 모험이 시작됩니다. 주인공은 여러 도전을 극복하며 성장해나갑니다.`,
        lesson: "용기와 지혜로 어려움을 극복할 수 있습니다",
        style: style || 'classic',
        processing_status: "fallback",
        error: errorMsg
    }];
}

// 내용이 있는 폴백 응답 생성
function createFallbackResponseWithContent(idea, style, content) {
    console.log('📝 내용 기반 폴백 응답 생성');

    return [{
        title: `${idea}`,
        character: "AI 작가",
        background: "창작의 공간",
        plot: content.length > 500 ? content.substring(0, 500) + "..." : content,
        lesson: "AI와 함께 만든 특별한 이야기",
        style: style || 'classic',
        processing_status: "content_fallback"
    }];
}

// 동화책 폴백 응답 생성
function createFallbackBook(data, errorMsg = '') {
    console.log('🔄 동화책 폴백 응답 생성:', { data, errorMsg });

    return {
        title: `${data.title || '동화책'} (폴백)`,
        pages: [
            { page: 1, content: "옛날 옛적에 주인공이 살고 있었습니다. 매일 새로운 모험을 꿈꾸며 지냈습니다." },
            { page: 2, content: "어느 날, 주인공에게 특별한 일이 일어났습니다. 모험의 시작이었습니다." },
            { page: 3, content: "주인공은 용기를 내어 모험을 시작했습니다. 길에서 만난 친구들과 함께 어려움을 극복해 나갔습니다." },
            { page: 4, content: "여행 중에 여러 도전이 기다리고 있었습니다. 하지만 주인공은 포기하지 않고 계속 앞으로 나아갔습니다." },
            { page: 5, content: "마침내 주인공은 목표를 달성했습니다. 그 과정에서 진정한 용기와 우정의 소중함을 배웠습니다." },
            { page: 6, content: "주인공은 집으로 돌아와 가족과 친구들에게 모험 이야기를 들려주었습니다. 그리고 모두 행복하게 살았답니다." }
        ],
        processing_status: "fallback",
        error: errorMsg
    };
}

// 내용이 있는 동화책 폴백 응답 생성
function createFallbackBookWithContent(data, content) {
    console.log('📝 내용 기반 동화책 폴백 응답 생성');

    return {
        title: data.title || 'AI가 만든 동화책',
        pages: [
            { page: 1, content: content.length > 200 ? content.substring(0, 200) + "..." : content },
            { page: 2, content: "이야기가 계속됩니다..." },
            { page: 3, content: "모험의 절정에 도달했습니다." },
            { page: 4, content: "문제를 해결하기 위해 노력합니다." },
            { page: 5, content: "목표를 달성하고 교훈을 얻습니다." },
            { page: 6, content: "행복한 결말로 이야기를 마칩니다." }
        ],
        processing_status: "content_fallback"
    };
}

// 동화책 생성 핸들러
ipcMain.handle('generate-book', async (event, data) => {
    console.log('=== 동화책 생성 시작 ===');
    console.log('입력 데이터:', data);

    return new Promise(async (resolve) => {
        // 1. Ollama 서버 상태 확인
        const ollamaRunning = await checkOllamaServer();
        if (!ollamaRunning) {
            console.log('⚠️ Ollama 서버가 실행되지 않음, 폴백 응답 생성');
            resolve(createFallbackBook(data, 'Ollama 서버가 실행되지 않았습니다. "ollama serve" 명령어로 서버를 시작해주세요.'));
            return;
        }

        // 2. Python 스크립트 실행
        const pythonScript = path.join(__dirname, '../python/controllers/book_generator.py');
        const pythonExecutable = findPythonExecutable();

        console.log('Python 실행기:', pythonExecutable);
        console.log('Python 스크립트:', pythonScript);

        // 파일 존재 확인
        const fs = require('fs');
        if (!fs.existsSync(pythonScript)) {
            console.error('❌ Python 스크립트를 찾을 수 없음:', pythonScript);
            resolve(createFallbackBook(data, 'Python 스크립트 파일을 찾을 수 없습니다.'));
            return;
        }

        // 줄거리 데이터를 JSON 문자열로 변환
        const plotJson = JSON.stringify(data);

        const python = spawn(pythonExecutable, [pythonScript, plotJson, data.style || 'classic'], {
            env: {
                ...process.env,
                PYTHONIOENCODING: 'utf-8',
                PYTHONPATH: path.join(__dirname, '../python'),
                OLLAMA_HOST: 'localhost:11434',
                OLLAMA_ORIGINS: '*',
                OLLAMA_MODELS_PATH: process.env.OLLAMA_MODELS_PATH || ''
            },
            cwd: path.join(__dirname, '../python'),
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';
        let hasOutput = false;

        python.stdout.on('data', (data) => {
            const output = data.toString();
            stdout += output;
            hasOutput = true;
            console.log('Python stdout (raw):', output);
        });

        python.stderr.on('data', (data) => {
            const errorOutput = data.toString();
            stderr += errorOutput;
            console.log('Python stderr:', errorOutput);
        });

        python.on('error', (err) => {
            console.error('❌ Python 프로세스 에러:', err);
            resolve(createFallbackBook(data, `Python 실행 오류: ${err.message}`));
        });

        python.on('close', (code) => {
            console.log('🐍 Python 프로세스 종료, 코드:', code);
            console.log('📊 최종 결과 길이:', stdout.length);
            console.log('❌ 최종 에러:', stderr);
            console.log('📝 전체 stdout:', stdout);

            if (code === 0 && hasOutput && stdout.trim()) {
                try {
                    // JSON 파싱 시도
                    const result = JSON.parse(stdout.trim());
                    console.log('✅ JSON 파싱 성공, 결과 타입:', typeof result);
                    console.log('📖 페이지 수:', result.pages ? result.pages.length : 0);
                    console.log('🔍 파싱된 결과 구조:', JSON.stringify(result, null, 2));

                    resolve(result);
                    return;
                } catch (parseError) {
                    console.log('❌ JSON 파싱 실패:', parseError.message);
                    console.log('원본 출력 (처음 500자):', stdout.substring(0, 500));
                    console.log('원본 출력 (마지막 500자):', stdout.substring(Math.max(0, stdout.length - 500)));

                    // JSON 파싱 실패 시에도 내용이 있으면 활용
                    if (stdout.trim().length > 10) {
                        resolve(createFallbackBookWithContent(data, stdout.trim()));
                        return;
                    }
                }
            }

            // 모든 것이 실패한 경우
            console.log('❌ 모든 처리 실패, 폴백 응답 생성');
            const errorInfo = stderr || `Python 종료 코드: ${code}`;
            resolve(createFallbackBook(data, errorInfo));
        });

        // 타임아웃 없음 - AI 응답에 충분한 시간 제공
        console.log('⏳ Python AI 처리 중... (타임아웃 없음)');
    });
});

ipcMain.handle('generate-image', async (event, data) => {
    console.log('generate-image 호출됨:', data);
    return {
        imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4=",
        pageNumber: data.pageNumber || 1
    };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});