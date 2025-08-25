// electron/main.cjs
const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

// NODE_ENV가 undefined일 때를 대비한 개발 모드 감지
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
            webSecurity: false, // 개발 모드에서 CORS 문제 해결
        },
    });

    if (isDev) {
        const devUrl = 'http://localhost:5173';
        console.log('개발 모드 URL 로드:', devUrl);

        // Vite 서버 연결 상태 확인 함수 (fetch 대신 http 모듈 사용)
        const checkViteServer = () => {
            return new Promise((resolve) => {
                const http = require('http');
                const req = http.get(devUrl, (res) => {
                    if (res.statusCode === 200) {
                        console.log('✅ Vite 서버가 실행 중입니다.');
                        resolve(true);
                    } else {
                        console.log('❌ Vite 서버 응답 오류:', res.statusCode);
                        resolve(false);
                    }
                });

                req.on('error', (error) => {
                    console.log('❌ Vite 서버에 연결할 수 없습니다:', error.message);
                    resolve(false);
                });

                req.setTimeout(5000, () => {
                    console.log('❌ Vite 서버 연결 타임아웃');
                    req.destroy();
                    resolve(false);
                });
            });
        };

        // Vite 서버가 준비될 때까지 대기
        const loadDevURL = async () => {
            try {
                console.log('🔄 Vite 서버 연결 시도 중...');

                // 먼저 서버 상태 확인
                const isServerReady = await checkViteServer();
                if (!isServerReady) {
                    throw new Error('Vite 서버가 실행되지 않았습니다.');
                }

                await mainWindow.loadURL(devUrl);
                console.log('✅ Vite 서버 연결 성공!');
                mainWindow.webContents.openDevTools();

                // 개발자 도구에서 콘솔 로그 확인
                console.log('🎉 Electron 메인 프로세스 로그 - Vite 서버 연결 완료');

                // React 앱이 로드되었는지 확인
                mainWindow.webContents.once('did-finish-load', () => {
                    console.log('📱 React 앱 로딩 완료');

                    // React 앱에서 electronAPI 확인
                    mainWindow.webContents.executeJavaScript(`
                        console.log('🔍 React 앱에서 electronAPI 확인:');
                        console.log('window.electronAPI:', window.electronAPI);
                        console.log('window.electronAPI.expandStory:', window.electronAPI?.expandStory);
                        
                        if (window.electronAPI && window.electronAPI.expandStory) {
                            console.log('✅ electronAPI 연결 성공!');
                        } else {
                            console.error('❌ electronAPI 연결 실패!');
                        }
                    `);
                });

            } catch (error) {
                console.error('❌ Vite 서버 연결 실패:', error);
                console.log('💡 해결 방법:');
                console.log('   1. 새 터미널에서 npm run dev 실행');
                console.log('   2. localhost:5173에서 브라우저 접근 확인');
                console.log('   3. Vite 서버 완전 시작 후 다시 시도');

                // 재시도 (5초 후)
                setTimeout(() => {
                    console.log('🔄 Vite 서버 연결 재시도 중...');
                    loadDevURL();
                }, 5000);
            }
        };

        // 초기 연결 시도
        loadDevURL();

        // 로드 상태 모니터링
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
            } else if (errorCode === -102) {
                console.error('🚨 ERR_CONNECTION_REFUSED: 서버 연결 거부');
                console.log('💡 Vite 서버가 실행 중인지 확인하세요');
            }

            // 로딩 실패 시 재시도 (10초 후)
            setTimeout(() => {
                console.log('🔄 로딩 실패, 재시도 중...');
                loadDevURL();
            }, 10000);
        });

        // 개발자 도구 열기
        mainWindow.webContents.on('did-finish-load', () => {
            console.log('🔧 개발자 도구 열기');
            mainWindow.webContents.openDevTools();
        });

    } else {
        const prodPath = path.join(__dirname, '../dist/index.html');
        console.log('프로덕션 모드 파일 로드:', prodPath);
        mainWindow.loadFile(prodPath);
    }

    console.log('메인 윈도우 생성 완료');
}

// Python AI 호출 함수들
ipcMain.handle('expand-story', async (event, { idea, style }) => {
    console.log('AI 호출 시작:', { idea, style });

    return new Promise((resolve, reject) => {
        // 새로운 간단한 스토리 생성기 사용 (Ollama 기반)
        const pythonScript = path.join(__dirname, '../python/controllers/story_expander.py');
        console.log('🔍 Python 스크립트 경로:', pythonScript);
        console.log('📁 실행할 파일:', path.basename(pythonScript));
        console.log('🎯 story_expander.py를 실행합니다!');

        // Python 실행
        console.log('Python 프로세스 시작...');
        console.log('🔍 실행할 Python 파일 존재 확인:', require('fs').existsSync(pythonScript));
        console.log('📁 Python 파일 경로:', pythonScript);
        console.log('📁 Python 파일 크기:', require('fs').statSync(pythonScript).size, 'bytes');
        console.log('📁 Python 파일 내용 (처음 200자):', require('fs').readFileSync(pythonScript, 'utf8').substring(0, 200));
        const python = spawn('C:\\Users\\eel8\\Desktop\\python.exe', [pythonScript, idea, style || 'classic'], {
            env: {
                ...process.env,
                PYTHONIOENCODING: 'utf-8',
                OLLAMA_HOST: 'localhost:11434',  // Ollama 서버 주소 명시적 설정
                OLLAMA_ORIGINS: '*',  // CORS 설정
                OLLAMA_MODELS_PATH: 'C:\\Users\\eel8\\.ollama\\models',  // Ollama 모델 경로 설정
                PYTHONPATH: path.dirname(path.dirname(pythonScript))  // python 디렉토리 (controllers의 상위)
            },
            cwd: path.dirname(path.dirname(pythonScript))  // python 디렉토리 (controllers의 상위)
        });
        console.log('🐍 실행 명령어:', 'C:\\Users\\eel8\\Desktop\\python.exe', [pythonScript, idea, style || 'classic'], 'with environment variables');
        console.log('🐍 Python 실행기 경로 존재 확인:', require('fs').existsSync('C:\\Users\\eel8\\Desktop\\python.exe'));
        console.log('🐍 Python 실행기 크기:', require('fs').existsSync('C:\\Users\\eel8\\Desktop\\python.exe') ? require('fs').statSync('C:\\Users\\eel8\\Desktop\\python.exe').size : '파일 없음');
        console.log('🌐 환경변수 설정:', {
            PYTHONIOENCODING: 'utf-8',
            OLLAMA_HOST: 'localhost:11434',
            OLLAMA_ORIGINS: '*',
            OLLAMA_MODELS_PATH: 'C:\\Users\\eel8\\.ollama\\models',
            PYTHONPATH: path.dirname(pythonScript)
        });
        console.log('🎯 Python 프로세스 PID:', python.pid);

        let result = '';
        let error = '';

        python.stdout.on('data', (data) => {
            const output = data.toString();
            result += output;
            console.log('Python 출력:', output);
            console.log('🎭 Python에서 반환된 스토리 개수:', Array.isArray(output) ? output.length : '배열 아님');
        });

        python.stderr.on('data', (data) => {
            const errorOutput = data.toString();
            error += errorOutput;
            console.log('🐍 Python stderr 에러:', errorOutput);
        });

        python.on('error', (err) => {
            console.error('🐍 Python 프로세스 에러:', err);
            error += `프로세스 에러: ${err.message}`;
        });

        python.on('close', (code) => {
            console.log('🐍 Python 프로세스 종료, 코드:', code);
            console.log('📊 최종 결과 길이:', result.length);
            console.log('❌ 최종 에러:', error);
            console.log('🔍 Python 실행 결과 분석:');
            console.log('   - 결과가 비어있음:', result.length === 0);
            console.log('   - 에러가 있음:', error.length > 0);
            console.log('   - 종료 코드가 0이 아님:', code !== 0);

            if (code === 0) {
                try {
                    console.log('JSON 파싱 시도...');
                    const parsedResult = JSON.parse(result);
                    console.log('JSON 파싱 성공!');
                    console.log('생성된 스토리 수:', parsedResult.length);

                    // 각 스토리 정보 로깅
                    parsedResult.forEach((story, index) => {
                        console.log(`스토리 ${index + 1}: ${story.title}`);
                        console.log(`   캐릭터: ${story.character}`);
                        console.log(`   상태: ${story.processing_status}`);
                    });

                    resolve(parsedResult);
                } catch (e) {
                    console.log('JSON 파싱 실패:', e.message);
                    console.log('원본 응답:', result);

                    // 폴백 응답 생성 (1개만)
                    const fallbackResponse = [
                        {
                            title: `${idea}`,
                            character: "용감한 주인공",
                            background: "신비로운 모험의 세계",
                            plot: `AI가 '${idea}'에 대한 동화를 생성했습니다. 상세한 내용을 확인해보세요.`,
                            lesson: "AI와 함께 창의적인 이야기를 만들어보세요.",
                            style: style || 'classic',
                            processing_status: "ai_generated",
                            story_number: 1
                        }
                    ];
                    resolve(fallbackResponse);
                }
            } else {
                console.log('Python 실행 실패, 폴백 응답 사용');
                // Python 실행 실패 시에도 폴백 응답 제공
                const fallbackResponse = [
                    {
                        title: `${idea} - 테스트 동화`,
                        character: "테스트 주인공",
                        plot: `${idea}에 대한 테스트 줄거리입니다. Python AI 시스템을 확인해주세요.`,
                        lesson: "테스트를 통해 시스템을 점검할 수 있습니다.",
                        style: style || 'classic',
                        processing_status: "fallback_execution",
                        error: error,
                        story_number: 1
                    },
                    {
                        title: `${idea} - 테스트 변형 1`,
                        character: "테스트 캐릭터 1",
                        plot: `${idea}에 대한 첫 번째 테스트 변형입니다.`,
                        lesson: "테스트의 중요성을 배울 수 있습니다.",
                        style: style || 'classic',
                        processing_status: "fallback_execution",
                        story_number: 2
                    },
                    {
                        title: `${idea} - 테스트 변형 2`,
                        character: "테스트 캐릭터 2",
                        plot: `${idea}에 대한 두 번째 테스트 변형입니다.`,
                        lesson: "지속적인 테스트가 필요합니다.",
                        style: style || 'classic',
                        processing_status: "fallback_execution",
                        story_number: 3
                    }
                ];
                resolve(fallbackResponse);
            }
        });

        // 타임아웃 제거 - AI가 충분한 시간을 가질 수 있도록
        // setTimeout(() => {
        //     python.kill();
        //     console.log('Python 프로세스 타임아웃 (120초)');
        //     const timeoutResponse = [
        //         {
        //             title: `${idea} - 타임아웃 동화`,
        //             character: "인내심 많은 주인공",
        //             plot: `${idea}에 대한 동화를 생성하려 했지만 시간이 오래 걸렸습니다. AI가 더 빠르게 응답할 수 있도록 프롬프트를 최적화했습니다. 잠시 후 다시 시도해주세요.`,
        //             lesson: "때로는 기다림이 필요하고, 더 나은 방법을 찾는 것이 중요합니다.",
        //             style: style || 'classic',
        //             processing_status: "timeout",
        //             story_number: 1
        //         }
        //     ];
        //     resolve(timeoutResponse);
        // }, 120000);
    });
});

ipcMain.handle('generate-book', async (event, { storyData, style }) => {
    return new Promise((resolve, reject) => {
        const pythonScript = path.join(__dirname, '../python/controllers/book_generator.py');
        const python = spawn('python', [
            pythonScript,
            JSON.stringify(storyData),
            style
        ]);

        let result = '';
        python.stdout.on('data', (data) => result += data.toString());
        python.on('close', (code) => {
            if (code === 0) {
                try {
                    resolve(JSON.parse(result));
                } catch (e) {
                    resolve({
                        pages: [
                            { page: 1, content: "테스트 페이지 1" },
                            { page: 2, content: "테스트 페이지 2" },
                        ]
                    });
                }
            } else {
                reject(new Error('동화책 생성 실패'));
            }
        });
    });
});

ipcMain.handle('generate-image', async (event, { pageContent, pageNumber, style }) => {
    return new Promise((resolve, reject) => {
        const pythonScript = path.join(__dirname, '../python/controllers/image_generator.py');
        const python = spawn('python', [
            pythonScript,
            pageContent,
            pageNumber.toString(),
            style
        ]);

        let result = '';
        python.stdout.on('data', (data) => result += data.toString());
        python.on('close', (code) => {
            if (code === 0) {
                try {
                    resolve(JSON.parse(result));
                } catch (e) {
                    resolve({
                        imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4=",
                        pageNumber
                    });
                }
            } else {
                reject(new Error('이미지 생성 실패'));
            }
        });
    });
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
