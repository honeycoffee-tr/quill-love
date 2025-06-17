// 게임 상태
let gameState = {
    character: {
        name: '',
        profession: '',
        abilities: {emotion: 0, language: 0, penmanship: 0},
        skill: '',
        patronNickname: ''
    },
    currentLetter: 1,
    currentParagraph: 1,
    totalScore: 0,
    skillUsed: false,
    selectedWord: null,
    usedWords: [],
    paragraphData: []
};

// 직업별 능력치
const professionData = {
    writer: {emotion: 1, language: 3, penmanship: 2},
    painter: {emotion: 2, language: 1, penmanship: 3},
    musician: {emotion: 3, language: 2, penmanship: 1}
};

// 편지별 프롬프트
const letterPrompts = {
    1: "익명의 후원자에게 첫 편지를 써보세요. 당신의 예술에 대한 후원에 감사를 표하며, 앞으로의 창작 계획을 이야기해보세요.",
    2: "오늘 흥미로운 분을 만났습니다. 그분과의 만남을 후원자님께 이야기해보세요.",
    3: "그분을 다시 만났습니다. 점점 깊어지는 감정을 후원자님께 털어놓아보세요.",
    4: "그분을 사랑하게 되었습니다. 후원자님께 이 마음을 고백해보세요.",
    5: "마지막 편지입니다. 지금까지의 마음을 정리하여 써보세요."
};

// 단어 은행
const wordBanks = {
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

// 캐릭터 생성 관련
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

// 이벤트 리스너
document.getElementById('characterName').addEventListener('input', checkFormComplete);
document.getElementById('characterSkill').addEventListener('change', checkFormComplete);

function startGame() {
    // 캐릭터 정보 저장
    gameState.character.name = document.getElementById('characterName').value.trim();
    gameState.character.profession = document.getElementById('characterProfession').value;
    gameState.character.abilities = professionData[gameState.character.profession];
    gameState.character.skill = document.getElementById('characterSkill').value;
    gameState.character.patronNickname = document.getElementById('patronNickname').value.trim() || '후원자님';

    // 화면 전환
    document.getElementById('characterCreation').style.display = 'none';
    document.getElementById('letterInterface').style.display = 'grid';

    // 첫 번째 편지 시작
    startLetter(1);
}

function startLetter(letterNum) {
    gameState.currentLetter = letterNum;
    gameState.currentParagraph = 1;
    gameState.selectedWord = null;
    gameState.usedWords = [];
    gameState.paragraphData = [];
    if (letterNum === 1) gameState.skillUsed = false;

    updateUI();
    loadWordBank();
    setupParagraphListeners();
    resetExternalJudgments();
}

function updateUI() {
    const letterNumbers = ['', '첫 번째', '두 번째', '세 번째', '네 번째', '다섯 번째'];
    document.getElementById('letterNumber').textContent = letterNumbers[gameState.currentLetter] + ' 편지';
    document.getElementById('letterPrompt').textContent = letterPrompts[gameState.currentLetter];
    
    // 서명 업데이트
    document.getElementById('signatureName').textContent = gameState.character.name;

    // 능력치별 주사위 개수 표시
    document.getElementById('emotionDiceCount').textContent = gameState.character.abilities.emotion;
    document.getElementById('languageDiceCount').textContent = gameState.character.abilities.language;
    document.getElementById('penmanshipDiceCount').textContent = gameState.character.abilities.penmanship;

    // 기술 정보 업데이트
    const skillNames = {
        inspiration: '영감 (문장력 +1)',
        elegance: '화려함 (필체 +1)',
        passion: '부푼 감정 (감정 +1)'
    };
    document.getElementById('skillInfo').textContent = skillNames[gameState.character.skill] || '미선택';

    // 진행 상황 업데이트
    document.getElementById('currentStep').textContent = '단어 선택 후 글쓰기';
    document.getElementById('currentParagraph').textContent = `${gameState.currentParagraph}문단 작성 중`;
    
    updateProgressIndicator();
}

function setupParagraphListeners() {
    // 현재 문단의 체크박스에 이벤트 리스너 추가
    const checkboxes = document.querySelectorAll(`#p${gameState.currentParagraph}-emotion, #p${gameState.currentParagraph}-language, #p${gameState.currentParagraph}-penmanship, #p${gameState.currentParagraph}-skill-use`);
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            calculateScore();
            checkParagraphComplete(gameState.currentParagraph);
        });
    });
}

function updateProgressIndicator() {
    const dots = document.querySelectorAll('.progress-dot');
    dots.forEach((dot, index) => {
        dot.className = 'progress-dot';
        if (index < gameState.currentParagraph - 1) {
            dot.classList.add('completed');
        } else if (index === gameState.currentParagraph - 1) {
            dot.classList.add('current');
        }
    });
}

function loadWordBank() {
    const wordBankEl = document.getElementById('wordBank');
    wordBankEl.innerHTML = '';
    
    wordBanks[gameState.currentLetter].forEach((pair, index) => {
        const pairEl = document.createElement('div');
        pairEl.className = 'word-pair';
        pairEl.dataset.index = index;
        
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
        
        wordBankEl.appendChild(pairEl);
    });
}

function selectWord(index, pair) {
    // 기존 선택 해제
    document.querySelectorAll('.word-pair').forEach(el => el.classList.remove('selected'));
    
    // 새로운 선택
    document.querySelector(`[data-index="${index}"]`).classList.add('selected');
    
    gameState.selectedWord = {index, pair};
    
    // 현재 문단 에디터의 플레이스홀더 업데이트
    const currentEditor = document.querySelector(`#paragraph${gameState.currentParagraph} .paragraph-editor`);
    if (currentEditor) {
        currentEditor.placeholder = `이 문단에 "${pair.passive}" 또는 "${pair.active}" 단어를 사용하여 글을 작성하세요.`;
    }

    checkParagraphComplete(gameState.currentParagraph);
}

function rollDiceForAbility(ability) {
    let diceCount = gameState.character.abilities[ability];
    
    // 기술 보너스 체크
    const skillBonus = getSkillBonus(ability);
    if (skillBonus > 0) {
        diceCount += skillBonus;
    }
    
    const results = [];
    for (let i = 0; i < diceCount; i++) {
        results.push(Math.floor(Math.random() * 6) + 1);
    }
    
    displayDice(results, ability + 'Dice');
}

function getSkillBonus(ability) {
    // 현재 문단에서 기술을 사용했는지 확인
    const skillUseCheckbox = document.getElementById(`p${gameState.currentParagraph}-skill-use`);
    if (!skillUseCheckbox || !skillUseCheckbox.checked || gameState.skillUsed) {
        return 0;
    }
    
    const skillMap = {
        inspiration: 'language',
        elegance: 'penmanship',
        passion: 'emotion'
    };
    
    return skillMap[gameState.character.skill] === ability ? 1 : 0;
}

function displayDice(results, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    results.forEach(result => {
        const die = document.createElement('div');
        die.className = 'dice';
        die.textContent = result;
        container.appendChild(die);
    });
}

function checkParagraphComplete(paragraphNum) {
    if (paragraphNum !== gameState.currentParagraph) return;
    
    const editor = document.querySelector(`#paragraph${paragraphNum} .paragraph-editor`);
    const hasText = editor && editor.value.trim().length > 0;
    const hasSelectedWord = gameState.selectedWord !== null;
    
    document.getElementById('finishParagraphBtn').disabled = !(hasText && hasSelectedWord);
}

function calculateScore() {
    let totalScore = 0;
    
    // 완성된 문단들의 점수
    gameState.paragraphData.forEach(data => {
        totalScore += data.score;
    });
    
    // 현재 문단 점수 계산
    const currentEmotion = document.getElementById(`p${gameState.currentParagraph}-emotion`)?.checked || false;
    const currentLanguage = document.getElementById(`p${gameState.currentParagraph}-language`)?.checked || false;
    const currentPenmanship = document.getElementById(`p${gameState.currentParagraph}-penmanship`)?.checked || false;
    
    let currentParagraphScore = 0;
    if (currentLanguage) {
        currentParagraphScore += 1;
        if (currentEmotion) currentParagraphScore += 1;
    } else {
        if (currentEmotion) currentParagraphScore -= 1;
    }
    if (currentPenmanship) currentParagraphScore += 1;
    
    totalScore += currentParagraphScore;
    gameState.totalScore = totalScore;
    
    document.getElementById('paragraphScore').textContent = currentParagraphScore;
    document.getElementById('totalScore').textContent = totalScore;
}

function finishParagraph() {
    const currentParagraph = document.getElementById(`paragraph${gameState.currentParagraph}`);
    const editor = currentParagraph.querySelector('.paragraph-editor');
    const text = editor.value;
    
    // 판정 결과 가져오기
    const emotionSuccess = document.getElementById(`p${gameState.currentParagraph}-emotion`).checked;
    const languageSuccess = document.getElementById(`p${gameState.currentParagraph}-language`).checked;
    const penmanshipSuccess = document.getElementById(`p${gameState.currentParagraph}-penmanship`).checked;
    const skillUsed = document.getElementById(`p${gameState.currentParagraph}-skill-use`).checked;
    
    // 사용된 단어 결정
    const wordToUse = languageSuccess ? 
        gameState.selectedWord.pair.active : 
        gameState.selectedWord.pair.passive;
    
    // 점수 계산
    let paragraphScore = 0;
    if (languageSuccess) {
        paragraphScore += 1;
        if (emotionSuccess) paragraphScore += 1;
    } else {
        if (emotionSuccess) paragraphScore -= 1;
    }
    if (penmanshipSuccess) paragraphScore += 1;
    
    // 문단 데이터 저장
    const paragraphData = {
        text: text,
        word: gameState.selectedWord,
        emotionSuccess: emotionSuccess,
        languageSuccess: languageSuccess,
        penmanshipSuccess: penmanshipSuccess,
        skillUsed: skillUsed,
        wordUsed: wordToUse,
        score: paragraphScore
    };
    gameState.paragraphData.push(paragraphData);
    
    // 기술 사용 체크
    if (skillUsed && !gameState.skillUsed) {
        gameState.skillUsed = true;
    }
    
    // 문단을 완성된 상태로 변경 (투명한 배경)
    currentParagraph.classList.remove('current');
    currentParagraph.classList.add('completed');
    currentParagraph.innerHTML = `
        <div class="paragraph-content">
            <div class="paragraph-label">${gameState.currentParagraph}문단</div>
            <div class="paragraph-text">${text}</div>
        </div>
        <div class="used-word-display">${wordToUse}</div>
    `;
    
    // 편지 외부에 판정 결과 추가
    addExternalJudgment(gameState.currentParagraph, paragraphData);
    
    // 사용된 단어 추가
    gameState.usedWords.push(gameState.selectedWord.index);
    gameState.selectedWord = null;
    
    // 다음 문단으로 또는 편지 완성
    if (gameState.currentParagraph < 5) {
        nextParagraph();
    } else {
        // 편지 완성 버튼 표시
        document.getElementById('finishParagraphBtn').style.display = 'none';
        document.getElementById('finishLetterBtn').style.display = 'inline-block';
        document.getElementById('finishLetterBtn').disabled = false;
    }
}

function resetExternalJudgments() {
    const externalJudgments = document.getElementById('externalJudgments');
    externalJudgments.innerHTML = '';
    externalJudgments.style.display = 'none';
}

function addExternalJudgment(paragraphNum, data) {
    const externalJudgments = document.getElementById('externalJudgments');
    externalJudgments.style.display = 'block';
    
    const judgmentItem = document.createElement('div');
    judgmentItem.className = 'external-judgment-item';
    
    judgmentItem.innerHTML = `
        <div class="judgment-paragraph-label">${paragraphNum}문단</div>
        <div class="judgment-results">
            <div class="judgment-result">
                <input type="checkbox" ${data.emotionSuccess ? 'checked' : ''} disabled>
                <span>미사여구</span>
            </div>
            <div class="judgment-result">
                <input type="checkbox" ${data.languageSuccess ? 'checked' : ''} disabled>
                <span>문장력</span>
            </div>
            <div class="judgment-result">
                <input type="checkbox" ${data.penmanshipSuccess ? 'checked' : ''} disabled>
                <span>필체</span>
            </div>
            <div class="judgment-result">
                <input type="checkbox" ${data.skillUsed ? 'checked' : ''} disabled>
                <span>기술</span>
            </div>
        </div>
        <div class="used-word-small">"${data.wordUsed}"</div>
    `;
    
    externalJudgments.appendChild(judgmentItem);
}

function nextParagraph() {
    gameState.currentParagraph++;
    
    // 다음 문단 활성화
    const nextParagraph = document.getElementById(`paragraph${gameState.currentParagraph}`);
    nextParagraph.classList.add('current');
    nextParagraph.innerHTML = `
        <div class="paragraph-content">
            <div class="paragraph-label">${gameState.currentParagraph}문단</div>
            <textarea class="paragraph-editor" placeholder="${gameState.currentParagraph}번째 문단을 작성하세요. 선택한 단어를 반드시 포함해야 합니다."></textarea>
        </div>
        <div class="judgment-panel" id="judgment${gameState.currentParagraph}">
            <div class="judgment-title">판정</div>
            <div class="judgment-item">
                <input type="checkbox" class="judgment-checkbox" id="p${gameState.currentParagraph}-emotion">
                <label class="judgment-label">미사여구</label>
            </div>
            <div class="judgment-item">
                <input type="checkbox" class="judgment-checkbox" id="p${gameState.currentParagraph}-language">
                <label class="judgment-label">문장력</label>
            </div>
            <div class="judgment-item">
                <input type="checkbox" class="judgment-checkbox" id="p${gameState.currentParagraph}-penmanship">
                <label class="judgment-label">필체</label>
            </div>
            <div class="judgment-item skill-item ${gameState.skillUsed ? 'used' : ''}" id="p${gameState.currentParagraph}-skill">
                <input type="checkbox" class="judgment-checkbox" id="p${gameState.currentParagraph}-skill-use" ${gameState.skillUsed ? 'disabled' : ''}>
                <label class="judgment-label">기술</label>
            </div>
        </div>
    `;
    
    updateUI();
    loadWordBank();
    setupParagraphListeners();
    
    // 버튼 상태 리셋
    document.getElementById('finishParagraphBtn').disabled = true;
    
    // 에디터 이벤트 리스너 추가
    const newEditor = nextParagraph.querySelector('.paragraph-editor');
    if (newEditor) {
        newEditor.addEventListener('input', () => checkParagraphComplete(gameState.currentParagraph));
    }
}

function finishLetter() {
    // 편지 완성 처리
    if (gameState.currentLetter < 4) {
        showStory(gameState.currentLetter);
    } else if (gameState.currentLetter === 4) {
        startLetter(5);
    } else {
        showEnding();
    }
}

function showStory(storyNum) {
    document.getElementById('letterInterface').style.display = 'none';
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
    document.getElementById('letterInterface').style.display = 'grid';
    
    // 다음 편지에서는 기술을 다시 사용할 수 있음
    gameState.skillUsed = false;
    
    // 버튼 상태 리셋
    document.getElementById('finishParagraphBtn').style.display = 'inline-block';
    document.getElementById('finishLetterBtn').style.display = 'none';
    document.getElementById('finishParagraphBtn').disabled = true;
    
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
    
    alert(`게임 종료!\n\n${gameState.character.name}의 이야기\n총점: ${finalScore}점\n\n결말: ${ending}`);
}

// 페이지 로드 시 에디터 리스너 설정
document.addEventListener('DOMContentLoaded', function() {
    const editor = document.querySelector('#paragraph1 .paragraph-editor');
    if (editor) {
        editor.addEventListener('input', () => checkParagraphComplete(1));
    }
});
