// electron/main.cjs
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// ---------- 경로 유틸 ----------
function uniquePaths(arr) {
    const out = [];
    const seen = new Set();
    for (const p of arr) {
        if (!p) continue;
        const abs = path.resolve(p);
        if (!seen.has(abs)) {
            seen.add(abs);
            out.push(abs);
        }
    }
    return out;
}

// USB/models 자동 탐색 (exe 주변, 상위, 드라이브 루트 등)
function guessModelsDir() {
    const exeDir = path.dirname(process.execPath);
    const anchor = path.parse(process.execPath).root; // e.g., "E:\\"

    const candidates = uniquePaths([
        process.cwd(),
        exeDir,
        path.join(exeDir, 'models'),
        path.resolve(exeDir, '..'),
        path.resolve(exeDir, '..', 'models'),
        anchor ? path.join(anchor, 'models') : null,
        isDev ? path.join(__dirname, '..') : null,
        isDev ? path.join(__dirname, '..', 'models') : null,
    ]);

    for (const base of candidates) {
        // base 자체가 models인 케이스
        if (path.basename(base).toLowerCase() === 'models' && fs.existsSync(base)) {
            return base;
        }
        // base/models
        const m = path.join(base, 'models');
        if (fs.existsSync(m)) return m;
    }
    return null;
}

// 프로덕션 index.html 로드 (dev 실패시 폴백 포함)
function loadProdHTML(win) {
    const candidates = [
        path.join(__dirname, '../dist/index.html'),
        path.join(process.resourcesPath, 'dist', 'index.html'),
        path.join(process.resourcesPath, 'app.asar', 'dist', 'index.html'),
    ];
    for (const html of candidates) {
        if (fs.existsSync(html)) {
            win.loadURL(pathToFileURL(html).toString());
            console.log('프로덕션 파일 로드:', html);
            return true;
        }
    }
    console.error('❌ 프로덕션 index.html을 찾지 못했습니다. dist 빌드 확인 필요');
    return false;
}

// 쓰기 가능한 프로젝트 루트(배포 모드)
function getWritableProjectRoot() {
    if (isDev) return path.join(__dirname, '..');
    return app.getPath('userData');
}

// ---------- 창 ----------
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
                console.log('💡 dev 서버 대신 프로덕션 파일 폴백 시도');
                const ok = loadProdHTML(mainWindow);
                if (!ok) {
                    setTimeout(() => {
                        console.log('🔄 dev 서버 재시도...');
                        loadDevURL();
                    }, 5000);
                }
            }
        };

        loadDevURL();

        mainWindow.webContents.on('did-start-loading', () => console.log('📱 페이지 로딩 시작'));
        mainWindow.webContents.on('did-finish-load', () => console.log('✅ 페이지 로딩 완료'));
        mainWindow.webContents.on('did-fail-load', (_e, errorCode, errorDescription, validatedURL) => {
            console.error('❌ 페이지 로딩 실패:', { errorCode, errorDescription, validatedURL });
            if (errorCode === -6) {
                console.error('🚨 ERR_CONNECTION_REFUSED: Vite 서버가 실행되지 않았습니다. "npm run dev" 실행 필요');
            }
            console.log('💡 dev 서버 대신 프로덕션 파일 폴백 시도');
            loadProdHTML(mainWindow);
        });
    } else {
        loadProdHTML(mainWindow);
    }

    console.log('메인 윈도우 생성 완료');
}

// ---------- Python 실행 설정 ----------
function getPythonConfig() {
    if (isDev) {
        // 개발 환경에서는 .py 실행
        return {
            executable: process.platform === 'win32' ? 'python' : 'python3',
            cwd: path.join(__dirname, '../python'),
            useScript: true
        };
    } else {
        // 배포 환경에서는 FairyTaleAI.exe 실행
        return {
            executable: path.join(process.resourcesPath, 'python', 'FairyTaleAI.exe'),
            cwd: process.resourcesPath, // resources 기준으로 실행
            useScript: false
        };
    }
}

// 모델/올라마 경로 환경변수 힌트 구성 (인자 전달 없이 env로 고정)
function buildModelEnv(baseEnv = {}) {
    const env = { ...baseEnv };
    const modelsDir = guessModelsDir();
    if (modelsDir) {
        env.FAIRYTALE_MODELS_DIR = modelsDir;
        const hfImage = path.join(modelsDir, 'image-models', 'cache');
        const hfText = path.join(modelsDir, 'text-models', 'cache');
        // 이미지/텍스트 둘 중 존재하는 쪽을 우선 등록(둘 다 있으면 이미지 우선)
        const hfCache = fs.existsSync(hfImage) ? hfImage : (fs.existsSync(hfText) ? hfText : null);
        if (hfCache) {
            env.HF_HOME = hfCache;
            env.TRANSFORMERS_CACHE = hfCache;
            env.HF_DATASETS_CACHE = hfCache;
        }
        const ollamaDir = path.join(modelsDir, 'text-models', 'ollama');
        if (fs.existsSync(ollamaDir)) {
            env.OLLAMA_MODELS = ollamaDir;       // 일반적으로 이 변수를 사용
            env.OLLAMA_MODELS_PATH = ollamaDir;  // 혹시 코드가 이 변수를 볼 수도 있음
        }
    }
    return env;
}

// Python 컨트롤러 실행
function executePythonController(controller, args, options = {}) {
    const config = getPythonConfig();
    const env = buildModelEnv(process.env);

    let spawnArgs;
    if (config.useScript) {
        const scriptPath = path.join(__dirname, `../python/controllers/${controller}.py`);
        if (!fs.existsSync(scriptPath)) {
            throw new Error(`Python 스크립트를 찾을 수 없음: ${scriptPath}`);
        }
        spawnArgs = [scriptPath, ...args];
    } else {
        // PyInstaller 통합 exe: FairyTaleAI.exe <controller> <args...>
        spawnArgs = [controller, ...args];
    }

    console.log('Python 실행 설정:', {
        executable: config.executable,
        args: spawnArgs,
        cwd: config.cwd,
        isDev,
    });

    return spawn(config.executable, spawnArgs, {
        env: {
            ...env,
            PYTHONIOENCODING: 'utf-8',
            PYTHONPATH: config.useScript ? path.join(__dirname, '../python') : undefined,
            OLLAMA_HOST: process.env.OLLAMA_HOST || 'localhost:11434',
            OLLAMA_ORIGINS: '*',
        },
        cwd: config.cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
        ...options,
    });
}

// ---------- Ollama 서버 체크 ----------
async function checkOllamaServer() {
    console.log('=== Ollama 서버 상태 체크 ===');
    return new Promise((resolve) => {
        const http = require('http');
        const req = http.get('http://localhost:11434/api/version', (res) => {
            if (res.statusCode === 200) {
                console.log('✅ Ollama 서버가 실행 중입니다');
                resolve(true);
            } else {
                console.log('❌ Ollama 서버 응답 상태:', res.statusCode);
                resolve(false);
            }
        });
        req.on('error', (error) => {
            console.log('❌ Ollama 서버 연결 실패:', error.message);
            console.log('💡 "ollama serve" 로 서버 실행 필요');
            resolve(false);
        });
        req.setTimeout(3000, () => {
            console.log('❌ Ollama 서버 연결 타임아웃');
            req.destroy();
            resolve(false);
        });
    });
}

// ---------- IPC 핸들러 등록 ----------
function registerIpcHandlers() {
    console.log('[IPC] handlers registering');

    ipcMain.removeHandler('expand-story');
    ipcMain.handle('expand-story', async (_event, { idea, style }) => {
        console.log('=== AI 호출 시작 ===');
        console.log('입력 데이터:', { idea, style });

        return new Promise(async (resolve) => {
            const ollamaRunning = await checkOllamaServer();
            if (!ollamaRunning) {
                console.log('⚠️ Ollama 서버 미실행 → 폴백 응답');
                resolve(createFallbackResponse(idea, style, 'Ollama 서버가 실행되지 않았습니다. "ollama serve"를 실행하세요.'));
                return;
            }
            try {
                const python = executePythonController('story_expander', [idea, style || 'classic']);
                let stdout = '', stderr = '', hasOutput = false;

                python.stdout.on('data', (d) => { const t = d.toString(); stdout += t; hasOutput = true; console.log('Python stdout:', t); });
                python.stderr.on('data', (d) => { const t = d.toString(); stderr += t; console.log('Python stderr:', t); });
                python.on('error', (err) => { console.error('❌ Python 프로세스 에러:', err); resolve(createFallbackResponse(idea, style, `Python 실행 오류: ${err.message}`)); });
                python.on('close', (code) => {
                    console.log('🐍 종료 코드:', code);
                    if (code === 0 && hasOutput && stdout.trim()) {
                        try {
                            const result = JSON.parse(stdout.trim());
                            const finalResult = Array.isArray(result) ? result : [result];
                            resolve(finalResult);
                            return;
                        } catch (e) {
                            console.log('❌ JSON 파싱 실패:', e.message);
                            if (stdout.trim().length > 10) {
                                resolve(createFallbackResponseWithContent(idea, style, stdout.trim()));
                                return;
                            }
                        }
                    }
                    resolve(createFallbackResponse(idea, style, stderr || `Python 종료 코드: ${code}`));
                });
            } catch (error) {
                console.error('❌ 실행 설정 오류:', error);
                resolve(createFallbackResponse(idea, style, `실행 환경 오류: ${error.message}`));
            }
        });
    });

    ipcMain.removeHandler('generate-book');
    ipcMain.handle('generate-book', async (_event, data) => {
        console.log('=== 동화책 생성 시작 ===');
        return new Promise(async (resolve) => {
            const ollamaRunning = await checkOllamaServer();
            if (!ollamaRunning) {
                resolve(createFallbackBook(data, 'Ollama 서버가 실행되지 않았습니다. "ollama serve"를 실행하세요.'));
                return;
            }
            try {
                const plotJson = JSON.stringify(data);
                const python = executePythonController('book_generator', [plotJson, data.style || 'classic']);
                let stdout = '', stderr = '', hasOutput = false;

                python.stdout.on('data', (d) => { const t = d.toString(); stdout += t; hasOutput = true; console.log('Python stdout (raw):', t); });
                python.stderr.on('data', (d) => { const t = d.toString(); stderr += t; console.log('Python stderr:', t); });
                python.on('error', (err) => { console.error('❌ Python 프로세스 에러:', err); resolve(createFallbackBook(data, `Python 실행 오류: ${err.message}`)); });
                python.on('close', (code) => {
                    console.log('🐍 종료 코드:', code);
                    if (code === 0 && hasOutput && stdout.trim()) {
                        try {
                            const result = JSON.parse(stdout.trim());
                            resolve(result);
                            return;
                        } catch (e) {
                            console.log('❌ JSON 파싱 실패:', e.message);
                            if (stdout.trim().length > 10) {
                                resolve(createFallbackBookWithContent(data, stdout.trim()));
                                return;
                            }
                        }
                    }
                    resolve(createFallbackBook(data, stderr || `Python 종료 코드: ${code}`));
                });
            } catch (error) {
                console.error('❌ 실행 설정 오류:', error);
                resolve(createFallbackBook(data, `실행 환경 오류: ${error.message}`));
            }
        });
    });

    // generate-image 핸들러 수정 (main.js 내부)
    ipcMain.removeHandler('generate-image');
    ipcMain.handle('generate-image', async (_event, { description, style, pageNumber }) => {
        console.log('=== 이미지 생성 시작 ===', { description, style, pageNumber });

        return new Promise(async (resolve) => {
            try {
                const python = executePythonController('image_generator', [
                    description || '기본 이미지',
                    style || '수채화 일러스트',
                    String(pageNumber),
                ]);

                let stdout = '', stderr = '', hasOutput = false;

                python.stdout.on('data', (d) => {
                    const text = d.toString();
                    stdout += text;
                    hasOutput = true;
                    console.log('Python 이미지 stdout:', text);
                });

                python.stderr.on('data', (d) => {
                    const text = d.toString();
                    stderr += text;
                    console.log('Python 이미지 stderr:', text);
                });

                python.on('error', (err) => {
                    console.error('❌ 이미지 생성 프로세스 에러:', err);
                    resolve(createFallbackImageResponse(pageNumber, `Python 실행 오류: ${err.message}`));
                });

                python.on('close', (code) => {
                    console.log('🐍 이미지 생성 종료 코드:', code);

                    if (code === 0 && hasOutput && stdout.trim()) {
                        try {
                            const result = JSON.parse(stdout.trim());
                            console.log('이미지 생성 JSON 결과:', result);

                            // Python에서 반환된 결과 검증 및 보완
                            if (result.success) {
                                // 이미지 경로 통일 (다양한 키 이름 지원)
                                const imagePath = result.imagePath ||
                                    result.image_path ||
                                    result.path ||
                                    result.filePath;

                                if (imagePath && fs.existsSync(imagePath)) {
                                    resolve({
                                        success: true,
                                        imagePath: imagePath,  // 통일된 키 이름
                                        pageNumber: pageNumber,
                                        message: result.message || '이미지가 성공적으로 생성되었습니다.',
                                        style: style,
                                        description: description
                                    });
                                } else {
                                    console.error('❌ 생성된 이미지 파일이 존재하지 않음:', imagePath);
                                    resolve(createFallbackImageResponse(pageNumber, '이미지 파일이 생성되지 않았습니다.'));
                                }
                            } else {
                                console.error('❌ 이미지 생성 실패:', result.error);
                                resolve(createFallbackImageResponse(pageNumber, result.error || '이미지 생성 실패'));
                            }
                            return;
                        } catch (parseError) {
                            console.log('❌ 이미지 JSON 파싱 실패:', parseError.message);
                            console.log('원본 stdout:', stdout);

                            // JSON 파싱 실패 시, 기본 경로로 이미지 찾기 시도
                            const projectRoot = getWritableProjectRoot();
                            const tempsDir = path.join(projectRoot, 'temps');
                            const fileName = `${String(pageNumber).padStart(2, '0')}.png`;
                            const expectedPath = path.join(tempsDir, fileName);

                            if (fs.existsSync(expectedPath)) {
                                console.log('✅ 기본 경로에서 이미지 파일 발견:', expectedPath);
                                resolve({
                                    success: true,
                                    imagePath: expectedPath,
                                    pageNumber: pageNumber,
                                    message: '이미지가 생성되었습니다.',
                                    style: style,
                                    description: description,
                                    fallbackPath: true
                                });
                            } else {
                                resolve(createFallbackImageResponse(pageNumber, '이미지 생성 결과 파싱 실패'));
                            }
                        }
                    } else {
                        console.error('❌ Python 프로세스 실패 또는 출력 없음');
                        resolve(createFallbackImageResponse(pageNumber, stderr || `Python 종료 코드: ${code}`));
                    }
                });

            } catch (error) {
                console.error('❌ 이미지 실행 설정 오류:', error);
                resolve(createFallbackImageResponse(pageNumber, `실행 환경 오류: ${error.message}`));
            }
        });
    });

    // 폴백 이미지 응답 생성 함수도 개선
    function createFallbackImageResponse(pageNumber, errorMsg = '') {
        console.log('🔄 이미지 생성 폴백 응답 생성:', { pageNumber, errorMsg });
        return {
            success: false,
            error: errorMsg,
            pageNumber: pageNumber,
            fallback: true,
            message: '이미지 생성에 실패했습니다. 기본 이미지가 표시됩니다.',
            imagePath: null
        };
    }

    // apply-image 핸들러 수정 (main.js 내부)
    ipcMain.removeHandler('apply-image');
    ipcMain.handle('apply-image', async (_event, { pageNumber, imagePath, selectedStyle }) => {
        console.log('=== 이미지 적용 시작 ===', { pageNumber, imagePath, selectedStyle });

        try {
            const projectRoot = getWritableProjectRoot();
            const tempsDir = path.join(projectRoot, 'temps');
            const savesDir = path.join(projectRoot, 'saves');

            // saves 디렉토리가 없으면 생성
            if (!fs.existsSync(savesDir)) {
                fs.mkdirSync(savesDir, { recursive: true });
            }

            const fileName = `${String(pageNumber).padStart(2, '0')}.png`;

            // 1. imagePath가 직접 제공된 경우 (우선순위)
            if (imagePath && fs.existsSync(imagePath)) {
                const savePath = path.join(savesDir, fileName);
                fs.copyFileSync(imagePath, savePath);

                console.log('✅ 직접 경로에서 이미지 적용 완료:', savePath);
                return {
                    success: true,
                    imagePath: savePath,
                    pageNumber,
                    message: '이미지가 성공적으로 적용되었습니다.'
                };
            }

            // 2. temps 폴더에서 찾기 (기존 로직)
            const tempPath = path.join(tempsDir, fileName);
            if (fs.existsSync(tempPath)) {
                const savePath = path.join(savesDir, fileName);
                fs.copyFileSync(tempPath, savePath);

                // 임시 파일 삭제 (선택사항)
                try {
                    fs.unlinkSync(tempPath);
                } catch (unlinkError) {
                    console.warn('임시 파일 삭제 실패 (무시):', unlinkError.message);
                }

                console.log('✅ temps 폴더에서 이미지 적용 완료:', savePath);
                return {
                    success: true,
                    imagePath: savePath,
                    pageNumber,
                    message: '이미지가 성공적으로 적용되었습니다.'
                };
            }

            // 3. 둘 다 실패한 경우
            const errorMsg = imagePath
                ? `제공된 이미지 파일을 찾을 수 없습니다: ${imagePath}`
                : `임시 이미지 파일을 찾을 수 없습니다: ${tempPath}`;

            console.error('❌ 이미지 파일 없음:', errorMsg);
            return {
                success: false,
                error: errorMsg,
                pageNumber,
                debug: {
                    imagePath: imagePath || 'null',
                    tempPath,
                    tempsExists: fs.existsSync(tempsDir),
                    tempFiles: fs.existsSync(tempsDir) ? fs.readdirSync(tempsDir) : []
                }
            };

        } catch (error) {
            console.error('❌ 이미지 적용 오류:', error);
            return {
                success: false,
                error: `이미지 적용 실패: ${error.message}`,
                pageNumber
            };
        }
    });

    ipcMain.removeHandler('check-ai-health');
    ipcMain.handle('check-ai-health', async () => {
        try {
            return new Promise((resolve, reject) => {
                const python = executePythonController('health_checker', []);
                let stdout = '', stderr = '';

                python.stdout.on('data', (d) => { stdout += d.toString(); });
                python.stderr.on('data', (d) => { const t = d.toString(); stderr += t; console.log('Python Health Check:', t); });
                python.on('close', (code) => {
                    if (code === 0) {
                        try {
                            const result = JSON.parse(stdout.trim());
                            resolve({
                                text: result.text_available || false,
                                image: result.image_available || false,
                                messages: result.messages || {},
                            });
                        } catch (e) {
                            reject(new Error(`JSON 파싱 오류: ${e.message}`));
                        }
                    } else {
                        reject(new Error(`Health check 실패: ${stderr}`));
                    }
                });
                python.on('error', (err) => reject(new Error(`Health check 실행 오류: ${err.message}`)));
                setTimeout(() => { python.kill(); reject(new Error('Health check 타임아웃')); }, 60000);
            });
        } catch (error) {
            return { text: false, image: false, error: error.message };
        }
    });

    ipcMain.removeHandler('save-file');
    ipcMain.handle('save-file', async (_event, data) => {
        try {
            console.log('파일 저장 요청:', data);
            const result = await dialog.showSaveDialog({
                title: '동화책 저장',
                defaultPath: `${data.title || '동화책'}.json`,
                filters: [
                    { name: 'JSON 파일', extensions: ['json'] },
                    { name: '텍스트 파일', extensions: ['txt'] },
                    { name: '모든 파일', extensions: ['*'] },
                ],
            });

            if (!result.canceled && result.filePath) {
                let content = '';
                if (result.filePath.endsWith('.json')) {
                    content = JSON.stringify(data, null, 2);
                } else {
                    content = `제목: ${data.title}\n\n`;
                    if (data.pages) {
                        data.pages.forEach((page) => {
                            content += `페이지 ${page.page}:\n${page.content}\n\n`;
                        });
                    }
                }
                fs.writeFileSync(result.filePath, content, 'utf8');
                console.log('파일 저장 완료:', result.filePath);
                return { success: true, filePath: result.filePath };
            }
            console.log('파일 저장 취소됨');
            return { success: false, canceled: true };
        } catch (error) {
            console.error('파일 저장 오류:', error);
            return { success: false, error: error.message };
        }
    });

    console.log('[IPC] handlers registered');
}

// ---------- 폴백 응답 생성 ----------
function createFallbackResponse(idea, style, errorMsg = '') {
    console.log('🔄 폴백 응답 생성:', { idea, style, errorMsg });
    return [{
        title: `${idea}의 이야기`,
        character: '용감한 주인공',
        background: '신비로운 세계',
        plot: `${idea}를 바탕으로 한 흥미진진한 모험이 시작됩니다. 주인공은 여러 도전을 극복하며 성장해나갑니다.`,
        lesson: '용기와 지혜로 어려움을 극복할 수 있습니다',
        style: style || 'classic',
        processing_status: 'fallback',
        error: errorMsg,
    }];
}
function createFallbackResponseWithContent(idea, style, content) {
    console.log('📝 내용 기반 폴백 응답 생성');
    return [{
        title: `${idea}`,
        character: 'AI 작가',
        background: '창작의 공간',
        plot: content.length > 500 ? content.substring(0, 500) + '...' : content,
        lesson: 'AI와 함께 만든 특별한 이야기',
        style: style || 'classic',
        processing_status: 'content_fallback',
    }];
}
function createFallbackBook(data, errorMsg = '') {
    console.log('🔄 동화책 폴백 응답 생성:', { data, errorMsg });
    return {
        title: `${data.title || '동화책'} (폴백)`,
        pages: [
            { page: 1, content: '옛날 옛적에 주인공이 살고 있었습니다. 매일 새로운 모험을 꿈꾸며 지냈습니다.' },
            { page: 2, content: '어느 날, 주인공에게 특별한 일이 일어났습니다. 모험의 시작이었습니다.' },
            { page: 3, content: '주인공은 용기를 내어 모험을 시작했습니다. 길에서 만난 친구들과 함께 어려움을 극복해 나갔습니다.' },
            { page: 4, content: '여행 중에 여러 도전이 기다리고 있었습니다. 하지만 주인공은 포기하지 않고 계속 앞으로 나아갔습니다.' },
            { page: 5, content: '마침내 주인공은 목표를 달성했습니다. 그 과정에서 진정한 용기와 우정의 소중함을 배웠습니다.' },
            { page: 6, content: '주인공은 집으로 돌아와 가족과 친구들에게 모험 이야기를 들려주었습니다. 그리고 모두 행복하게 살았답니다.' },
        ],
        processing_status: 'fallback',
        error: errorMsg,
    };
}
function createFallbackBookWithContent(data, content) {
    console.log('📝 내용 기반 동화책 폴백 응답 생성');
    return {
        title: data.title || 'AI가 만든 동화책',
        pages: [
            { page: 1, content: content.length > 200 ? content.substring(0, 200) + '...' : content },
            { page: 2, content: '이야기가 계속됩니다...' },
            { page: 3, content: '모험의 절정에 도달했습니다.' },
            { page: 4, content: '문제를 해결하기 위해 노력합니다.' },
            { page: 5, content: '목표를 달성하고 교훈을 얻습니다.' },
            { page: 6, content: '행복한 결말로 이야기를 마칩니다.' },
        ],
        processing_status: 'content_fallback',
    };
}
function createFallbackImageResponse(pageNumber, errorMsg = '') {
    console.log('🔄 이미지 생성 폴백 응답 생성:', { pageNumber, errorMsg });
    return {
        success: false,
        error: errorMsg,
        pageNumber,
        fallback: true,
        message: '이미지 생성에 실패했습니다. 기본 이미지가 표시됩니다.',
    };
}

// ---------- 앱 수명주기 ----------
registerIpcHandlers();               // 핸들러를 가장 먼저 등록 (No handler 방지)
app.whenReady().then(createWindow);

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
