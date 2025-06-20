// 게임 상태 관리
let gameState = {
    character: {
        name: '',
        profession: '',
        abilities: {emotion: 0, language: 0, penmanship: 0},
        skill: ''
    },
    currentLetter: 1,
    currentParagraph: 1,
    paragraphData: {
        selectedWord: null,
        selectedPair: null,
        emotionRoll: null,
        languageRoll: null,
        penmanshipRoll: null,
        paragraphText: '',
        score: 0
    },
    totalScore: 0,
    letterScores: [],
    skillUsed: false,
    usedWords: [],
    completedParagraphs: []
};

// 직업별 능력치 데이터
const professionData = {
    writer: {emotion: 1, language: 3, penmanship: 2},    // 나쁨/좋음/보통
    painter: {emotion: 2, language: 1, penmanship: 3},   // 보통/나쁨/좋음
    musician: {emotion: 3, language: 2, penmanship: 1}   // 좋음/보통/나쁨
};

// 편지별 프롬프트
const letterPrompts = {
    1: "첫 번째 편지: 익명의 후원자에게 감사의 마음을 전하세요.",
    2: "두 번째 편지: 오늘 만난 흥미로운 분에 대해 이야기하세요.",
    3: "세 번째 편지: 그분과의 두 번째 만남을 설명하세요.",
    4: "네 번째 편지: 사랑에 빠진 마음을 고백하세요.",
    5: "다섯 번째 편지: 마지막 편지를 써보세요."
};

// 잉크병 데이터
const inkwells = {
    1: [
        {passive: "그림", active: "영혼을 담은 캔버스"},
        {passive: "돈", active: "소중한 후원"},
        {passive: "작업실", active: "창작의 성소"},
        {passive: "붓", active: "마음을 그리는 붓"},
        {passive: "감사", active: "깊은 감명"},
        {passive: "미래", active: "찬란한 전망"}
    ],
    2: [
        {passive: "사람", active: "신비로운 분"},
        {passive: "만남", active: "운명적 조우"},
        {passive: "대화", active: "마음 깊은 대화"},
        {passive: "눈", active: "별빛 같은 눈동자"},
        {passive: "웃음", active: "은은한 미소"},
        {passive: "시간", active: "황홀한 시간"}
    ],
    3: [
        {passive: "또", active: "다시금"},
        {passive: "마음", active: "떨리는 가슴"},
        {passive: "생각", active: "그리운 마음"},
        {passive: "밤", active: "잠 못 드는 밤"},
        {passive: "꿈", active: "달콤한 꿈"},
        {passive: "기다림", active: "간절한 기다림"}
    ],
    4: [
        {passive: "사랑", active: "깊은 사랑"},
        {passive: "마음", active: "불타는 마음"},
        {passive: "고백", active: "진심 어린 고백"},
        {passive: "감정", active: "타오르는 감정"},
        {passive: "원함", active: "간절한 바람"},
        {passive: "함께", active: "영원히 함께"}
    ],
    5: [
        {passive: "끝", active: "새로운 시작"},
        {passive: "감사", active: "무한한 감사"},
        {passive: "기억", active: "소중한 기억"},
        {passive: "앞으로", active: "찬란한 미래"},
        {passive: "마음", active: "변치 않는 마음"},
        {passive: "편지", active: "마지막 편지"}
    ]
};

// 캐릭터 생성 관련 함수들
function showCharacterCreation() {
    document.getElementById('scenarioIntro').style.display = 'none';
    document.getElementById('characterCreation').style.display = 'block';
}

function updateAbilities() {
    const profession = document.getElementById('characterProfession').value;
    if (!profession) return;

    const abilities = professionData[profession];
    const abilityNames = ['나쁨', '보통', '좋음'];
    const abilityClasses = ['ability-bad', 'ability-normal', 'ability-good'];

    document.getElementById('emotion').textContent = abilityNames[abilities.emotion - 1];
    document.getElementById('emotion').className = abilityClasses[abilities.emotion - 1];

    document.getElementById('language').textContent = abilityNames[abilities.language - 1];
    document.getElementById('language').className = abilityClasses[abilities.language - 1];

    document.getElementById('penmanship').textContent = abilityNames[abilities.penmanship - 1];
    document.getElementById('penmanship').className = abilityClasses[abilities.penmanship - 1];

    checkFormComplete();
}

function checkFormComplete() {
    const name = document.getElementById('characterName').value.trim();
    const profession = document.getElementById('characterProfession').value;
    const skill = document.getElementById('characterSkill').value;

    document.getElementById('startGameBtn').disabled = !(name && profession && skill);
}

// 이벤트 리스너 등록
document.getElementById('characterName').addEventListener('input', checkFormComplete);
document.getElementById('characterSkill').addEventListener('change', checkFormComplete);

function startGame() {
    // 캐릭터 정보 저장
    gameState.character.name = document.getElementById('characterName').value.trim();
    gameState.character.profession = document.getElementById('characterProfession').value;
    gameState.character.abilities = professionData[gameState.character.profession];
    gameState.character.skill = document.getElementById('characterSkill').value;

    // 화면 전환
    document.getElementById('characterCreation').style.display = 'none';
    document.getElementById('gameInterface').style.display = 'grid';

    // 첫 번째 편지 시작
    startLetter(1);
}

// 편지 시작
function startLetter(letterNum) {
    gameState.currentLetter = letterNum;
    gameState.currentParagraph = 1;
    gameState.usedWords = [];
    gameState.completedParagraphs = [];
    // 새 편지 시작 시에만 기술 초기화 (같은 편지 내에서는 유지)
    if (letterNum === 1) {
        gameState.skillUsed = false;
    }
    
    updateUI();
    loadInkwell();
    
    // 기술 체크박스 초기화
    if (!gameState.skillUsed) {
        document.getElementById('skillCheckbox').checked = false;
        document.getElementById('skillCheckbox').disabled = false;
    }
}

// UI 업데이트
function updateUI() {
    const paragraphNumbers = ['', '1문단', '2문단', '3문단', '4문단', '5문단'];
    document.getElementById('paragraphNumber').textContent = paragraphNumbers[gameState.currentParagraph] || '완성';
    document.getElementById('currentStep').textContent = gameState.currentParagraph > 5 ? '편지 완성' : '단어 선택';
    
    if (gameState.currentParagraph > 5) {
        document.getElementById('letterProgress').textContent = '편지 완성 (5/5)';
    } else {
        document.getElementById('letterProgress').textContent = 
            `${gameState.currentParagraph}문단 작성 중 (${gameState.currentParagraph}/5)`;
    }
    
    // 편지 제목 업데이트
    const letterNumbers = ['', '첫 번째', '두 번째', '세 번째', '네 번째', '다섯 번째'];
    document.getElementById('letterTitle').textContent = letterNumbers[gameState.currentLetter] + ' 편지';
    
    // 진행률 업데이트
    const progress = gameState.currentParagraph > 5 ? 100 : (gameState.currentParagraph - 1) * 20 + 20;
    document.getElementById('progressFill').style.width = progress + '%';
    
    // 기술 정보
    const skillNames = {
        inspiration: '영감',
        elegance: '화려함',
        passion: '부푼 감정'
    };
    document.getElementById('skillName').textContent = skillNames[gameState.character.skill] || '미선택';
    document.getElementById('skillStatus').textContent = gameState.skillUsed ? '사용됨' : '사용 가능';
    
    // 편지 전체 업데이트
    updateLetterContainer();
    
    // 완성 상태가 아닐 때만 리셋
    if (gameState.currentParagraph <= 5) {
        resetParagraphState();
    }
}

// 편지 컨테이너 업데이트
function updateLetterContainer() {
    const container = document.getElementById('letterContainer');
    container.innerHTML = '';
    
    // 편지 시작 인사말
    const greeting = document.createElement('div');
    greeting.style.cssText = 'margin-bottom: 30px; font-style: italic; color: #666;';
    greeting.textContent = '친애하는 후원자님께,';
    container.appendChild(greeting);
    
    // 5개 문단 생성
    for (let i = 1; i <= 5; i++) {
        const paragraphDiv = document.createElement('div');
        paragraphDiv.className = 'letter-paragraph';
        paragraphDiv.id = `paragraph-${i}`;
        
        // 문단 라벨
        const label = document.createElement('div');
        label.className = 'paragraph-label';
        label.textContent = `${i}문단`;
        
        // 문단 내용 컨테이너
        const content = document.createElement('div');
        content.className = 'paragraph-content';
        
        if (i < gameState.currentParagraph || gameState.currentParagraph > 5) {
            // 완성된 문단 (또는 편지 완성 후)
            paragraphDiv.classList.add('completed');
            const completedParagraph = gameState.completedParagraphs[i - 1];
            if (completedParagraph) {
                content.textContent = completedParagraph.paragraphText;
                
                // 사용된 단어 표시
                const usedWord = document.createElement('div');
                usedWord.className = 'paragraph-used-word';
                const pair = completedParagraph.selectedPair;
                const wordUsed = completedParagraph.languageRoll ? pair.active : pair.passive;
                usedWord.textContent = wordUsed;
                paragraphDiv.appendChild(usedWord);
            }
            
        } else if (i === gameState.currentParagraph) {
            // 현재 작성 중인 문단
            paragraphDiv.classList.add('current');
            
            const editor = document.createElement('textarea');
            editor.className = 'current-editor';
            editor.id = 'currentParagraphEditor';
            editor.placeholder = `${i}번째 문단을 작성하세요. 단어를 선택하고 판정 후 해당 단어를 포함해서 글을 써보세요.`;
            editor.value = ''; // 에디터 초기화
            
            // 자동 높이 조절
            editor.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });
            
            content.appendChild(editor);
            
            // 마침표 버튼 추가
            const completeBtn = document.createElement('button');
            completeBtn.className = 'paragraph-complete-btn';
            completeBtn.textContent = '●';
            completeBtn.title = '문단 완성';
            completeBtn.disabled = true; // 초기에는 비활성화
            completeBtn.onclick = function() {
                if (gameState.currentParagraph < 5) {
                    nextParagraph();
                } else {
                    finishLetter();
                }
            };
            content.appendChild(completeBtn);
            
            // 포커스 및 초기 높이 설정
            setTimeout(() => {
                editor.focus();
                editor.style.height = 'auto';
                editor.style.height = editor.scrollHeight + 'px';
            }, 100);
            
        } else {
            // 아직 작성하지 않은 문단
            paragraphDiv.classList.add('pending');
            content.innerHTML = '<div style="color: #999; font-style: italic;">아직 작성되지 않은 문단입니다.</div>';
        }
        
        paragraphDiv.appendChild(label);
        paragraphDiv.appendChild(content);
        container.appendChild(paragraphDiv);
    }
    
    // 편지 마무리
    const signature = document.createElement('div');
    signature.className = 'letter-signature';
    signature.innerHTML = `
        <div style="margin-bottom: 10px;">당신의 예술가,</div>
        <div><strong>${gameState.character.name || '익명의 예술가'}</strong></div>
    `;
    container.appendChild(signature);
}

function resetParagraphState() {
    gameState.paragraphData = {
        selectedWord: null,
        selectedPair: null,
        emotionRoll: null,
        languageRoll: null,
        penmanshipRoll: null,
        paragraphText: '',
        score: 0
    };
    
    // 판정 체크박스 숨기기
    document.getElementById('judgementCheckboxes').style.display = 'none';
    document.getElementById('paragraphInfo').style.display = 'none';
    
    // 버튼 상태 리셋
    document.getElementById('selectWordBtn').disabled = true;
    document.getElementById('selectWordBtn').style.display = 'inline-block';
    
    // 체크박스 초기화
    document.getElementById('emotionCheck').checked = false;
    document.getElementById('languageCheck').checked = false;
    document.getElementById('penmanshipCheck').checked = false;
    
    // 기술 체크박스 리셋 (기술이 이미 사용되지 않았을 때만)
    if (!gameState.skillUsed) {
        document.getElementById('skillUseCheck').checked = false;
        document.getElementById('skillUseCheck').disabled = true;
    }
}

// 잉크병 로드
function loadInkwell() {
    const inkwellEl = document.getElementById('inkwell');
    inkwellEl.innerHTML = '';
    
    inkwells[gameState.currentLetter].forEach((pair, index) => {
        const pairEl = document.createElement('div');
        pairEl.className = 'word-pair';
        pairEl.dataset.index = index;
        
        // 사용된 단어 체크
        if (gameState.usedWords.includes(index)) {
            pairEl.classList.add('used');
        }
        
        pairEl.innerHTML = `
            <div class="passive-word">${pair.passive}</div>
            <div class="active-word">${pair.active}</div>
        `;
        
        if (!gameState.usedWords.includes(index)) {
            pairEl.addEventListener('click', function() {
                selectWord(index, pair);
            });
        }
        
        inkwellEl.appendChild(pairEl);
    });
}

// 단어 선택
function selectWord(index, pair) {
    // 기존 선택 해제
    document.querySelectorAll('.word-pair').forEach(el => el.classList.remove('selected'));
    
    // 새로운 선택
    document.querySelector(`[data-index="${index}"]`).classList.add('selected');
    
    gameState.paragraphData.selectedWord = index;
    gameState.paragraphData.selectedPair = pair;
    
    document.getElementById('selectWordBtn').disabled = false;
    
    console.log('선택된 단어:', pair); // 디버깅용
}

// 단어 선택 완료
function selectWordComplete() {
    document.getElementById('currentStep').textContent = '판정 체크';
    document.getElementById('judgementCheckboxes').style.display = 'block';
    document.getElementById('selectWordBtn').style.display = 'none';
    
    // 기술 사용 가능 여부 확인
    const skillUseCheck = document.getElementById('skillUseCheck');
    if (!gameState.skillUsed) {
        skillUseCheck.disabled = false;
    }
    
    updateParagraphInfo();
    
    // 체크박스 변경 이벤트 리스너 추가
    document.getElementById('emotionCheck').addEventListener('change', updateScore);
    document.getElementById('languageCheck').addEventListener('change', updateScore);
    document.getElementById('penmanshipCheck').addEventListener('change', updateScore);
    document.getElementById('skillUseCheck').addEventListener('change', updateScore);
}

// 점수 업데이트
function updateScore() {
    const emotionSuccess = document.getElementById('emotionCheck').checked;
    const languageSuccess = document.getElementById('languageCheck').checked;
    const penmanshipSuccess = document.getElementById('penmanshipCheck').checked;
    const skillUsed = document.getElementById('skillUseCheck').checked;
    
    // 기술 사용 상태 업데이트
    if (skillUsed && !gameState.skillUsed) {
        gameState.skillUsed = true;
        document.getElementById('skillStatus').textContent = '사용됨';
        document.getElementById('skillUseCheck').disabled = true;
    }
    
    // 점수 계산 (퀼 룰에 따라)
    let score = 0;
    
    // 감정 + 문장력 조합 점수
    if (emotionSuccess && languageSuccess) {
        // 감정 성공 + 문장력 성공 = 2점 (고상한 단어 + 미사여구)
        score += 2;
    } else if (emotionSuccess && !languageSuccess) {
        // 감정 성공 + 문장력 실패 = -1점 (천박한 단어 + 미사여구)
        score -= 1;
    } else if (!emotionSuccess && languageSuccess) {
        // 감정 실패 + 문장력 성공 = 1점 (고상한 단어만)
        score += 1;
    }
    // 둘 다 실패 = 0점
    
    // 필체 점수
    if (penmanshipSuccess) {
        score += 1;
    }
    
    // 문단 데이터 업데이트
    gameState.paragraphData.emotionRoll = emotionSuccess;
    gameState.paragraphData.languageRoll = languageSuccess;
    gameState.paragraphData.penmanshipRoll = penmanshipSuccess;
    gameState.paragraphData.score = score;
    
    // 화면 점수 업데이트
    document.getElementById('paragraphScore').textContent = score;
    
    // 마침표 버튼 활성화 (모든 체크가 완료되었을 때)
    const completeBtn = document.querySelector('.paragraph-complete-btn');
    if (completeBtn) {
        completeBtn.disabled = false;
    }
    
    updateParagraphInfo();
}

// 문단 정보 업데이트
function updateParagraphInfo() {
    const pair = gameState.paragraphData.selectedPair;
    if (!pair) return;
    
    document.getElementById('paragraphInfo').style.display = 'block';
    document.getElementById('selectedWord').textContent = 
        `${pair.passive} / ${pair.active}`;
    
    const emotionSuccess = document.getElementById('emotionCheck') ? document.getElementById('emotionCheck').checked : false;
    const languageSuccess = document.getElementById('languageCheck') ? document.getElementById('languageCheck').checked : false;
    
    document.getElementById('emotionStatus').textContent = 
        emotionSuccess ? '성공' : '실패';
            
    document.getElementById('languageStatus').textContent = 
        languageSuccess ? '성공 (고상한 단어)' : '실패 (천박한 단어)';
            
    document.getElementById('wordType').textContent = 
        languageSuccess ? pair.active : pair.passive;
}

// 다음 문단으로
function nextParagraph() {
    // 현재 문단 텍스트 저장
    const editor = document.getElementById('currentParagraphEditor');
    gameState.paragraphData.paragraphText = editor ? editor.value : '';
    
    // 총점에 현재 문단 점수 추가
    gameState.totalScore += gameState.paragraphData.score;
    document.getElementById('totalScore').textContent = gameState.totalScore;
    
    // 현재 문단 저장
    gameState.completedParagraphs.push({...gameState.paragraphData});
    gameState.usedWords.push(gameState.paragraphData.selectedWord);
    
    // 다음 문단으로
    gameState.currentParagraph++;
    updateUI();
    loadInkwell();
}

// 편지 완성
function finishLetter() {
    // 마지막 문단 텍스트 저장
    const editor = document.getElementById('currentParagraphEditor');
    gameState.paragraphData.paragraphText = editor ? editor.value : '';
    
    // 총점에 현재 문단 점수 추가
    gameState.totalScore += gameState.paragraphData.score;
    document.getElementById('totalScore').textContent = gameState.totalScore;
    
    // 마지막 문단 저장
    gameState.completedParagraphs.push({...gameState.paragraphData});
    gameState.usedWords.push(gameState.paragraphData.selectedWord);
    
    // 편지 완성 후 화면 업데이트
    gameState.currentParagraph = 6; // 완성 상태
    updateLetterContainer();
    
    // 결과 표시
    if (gameState.currentLetter < 4) {
        showStory(gameState.currentLetter);
    } else if (gameState.currentLetter === 4) {
        startLetter(5);
    } else {
        showEnding();
    }
}

// 스토리 표시
function showStory(storyNum) {
    document.getElementById('gameInterface').style.display = 'none';
    document.getElementById('storySection').style.display = 'block';
    
    const stories = {
        1: {
            title: "첫 번째 만남",
            content: "당신이 편지를 보낸 며칠 후, 시장에서 우연히 한 분을 만났습니다. 그분은 당신의 작품에 대해 놀라운 지식을 가지고 있었고, 예술에 대한 깊은 이해를 보여주었습니다. 당신은 그분과의 대화에서 묘한 친밀감을 느꼈습니다..."
        },
        2: {
            title: "두 번째 만남",
            content: "며칠 후, 당신은 다시 그분을 만났습니다. 이번에는 더 오랜 시간 함께 보냈고, 그분의 따뜻한 마음과 지혜로운 말씀에 깊은 감명을 받았습니다. 혹시 이분이... 하는 생각이 스쳤지만, 설마 하며 고개를 저었습니다..."
        },
        3: {
            title: "깨달음의 순간",
            content: "당신의 마음은 이미 그분에게 향하고 있었습니다. 밤마다 그분을 떠올리며 잠들었고, 아침마다 그분을 만날 생각에 가슴이 뛰었습니다. 이것이 사랑이라는 것을 깨달았을 때, 당신은 이 마음을 누군가에게 털어놓고 싶었습니다..."
        },
        4: {
            title: "진실의 순간",
            content: "당신의 편지를 받은 후원자는 깊은 고민에 빠졌습니다. 자신이 사랑하는 예술가가 다른 누군가를(실제로는 자신을) 사랑한다고 고백한 것입니다. 이제 자신의 정체를 밝힐 때가 온 것 같았습니다..."
        }
    };
    
    document.getElementById('storyTitle').textContent = stories[storyNum].title;
    document.getElementById('storyContent').textContent = stories[storyNum].content;
}

function continueToNextLetter() {
    document.getElementById('storySection').style.display = 'none';
    document.getElementById('gameInterface').style.display = 'grid';
    
    // 다음 편지에서는 기술을 다시 사용할 수 있음
    gameState.skillUsed = false;
    
    startLetter(gameState.currentLetter + 1);
}

function showEnding() {
    const finalScore = gameState.totalScore;
    let ending = '';
    
    if (finalScore >= 15) {
        ending = '완벽한 사랑: 서로의 마음과 정체를 확인하고 사랑하게 됨';
    } else if (finalScore >= 10) {
        ending = '비터스위트: 서로의 마음과 정체는 확인하지만 신분 차이를 극복할 용기를 내지 못함';
    } else {
        ending = '미완의 사랑: 서로의 정체와 마음을 확인하지 못하고 후원자와 피후원자의 관계로 남게됨';
    }
    
    // 최종 편지 표시를 위해 완료 상태로 설정
    gameState.currentParagraph = 6;
    updateLetterContainer();
    
    setTimeout(() => {
        alert(`게임 종료!\n\n${gameState.character.name}의 이야기\n총점: ${finalScore}점\n\n결말: ${ending}`);
    }, 500);
}
