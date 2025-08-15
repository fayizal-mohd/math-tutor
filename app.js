// MathQuest-V2 Application
class MathQuestApp {
    constructor() {
        this.currentYear = 5;
        this.currentDifficulty = 'easy';
        this.currentQuestion = null;
        this.questionNumber = 1;
        this.maxQuestions = 10;
        
        // Player State
        this.playerState = {
            totalStars: 0,
            totalXP: 0,
            streak: 0,
            currentStreak: 0,
            badges: [],
            recentQuestions: {} // NEW: Track recent questions to prevent repetition
        };
        
        // Initialize recent questions tracking
        this.initializeRecentQuestions();
        
        // Question banks for Year 5
        this.questionBanks = {
            5: {
                easy: [
                    { question: "What is 7 + 8?", answer: 15, type: "addition" },
                    { question: "What is 12 - 5?", answer: 7, type: "subtraction" },
                    { question: "What is 6 × 4?", answer: 24, type: "multiplication" },
                    { question: "What is 18 ÷ 2?", answer: 9, type: "division" },
                    { question: "What is 9 + 6?", answer: 15, type: "addition" },
                    { question: "What is 15 - 7?", answer: 8, type: "subtraction" },
                    { question: "What is 8 × 3?", answer: 24, type: "multiplication" },
                    { question: "What is 21 ÷ 3?", answer: 7, type: "division" },
                    { question: "What is 11 + 9?", answer: 20, type: "addition" },
                    { question: "What is 16 - 9?", answer: 7, type: "subtraction" },
                    { question: "What is 7 × 5?", answer: 35, type: "multiplication" },
                    { question: "What is 24 ÷ 4?", answer: 6, type: "division" }
                ],
                medium: [
                    { question: "What is 23 + 47?", answer: 70, type: "addition" },
                    { question: "What is 84 - 39?", answer: 45, type: "subtraction" },
                    { question: "What is 12 × 7?", answer: 84, type: "multiplication" },
                    { question: "What is 96 ÷ 8?", answer: 12, type: "division" },
                    { question: "What is 56 + 38?", answer: 94, type: "addition" },
                    { question: "What is 73 - 26?", answer: 47, type: "subtraction" },
                    { question: "What is 15 × 6?", answer: 90, type: "multiplication" },
                    { question: "What is 72 ÷ 9?", answer: 8, type: "division" },
                    { question: "What is 45 + 29?", answer: 74, type: "addition" },
                    { question: "What is 91 - 37?", answer: 54, type: "subtraction" },
                    { question: "What is 13 × 8?", answer: 104, type: "multiplication" },
                    { question: "What is 84 ÷ 7?", answer: 12, type: "division" }
                ],
                hard: [
                    { question: "What is 147 + 268?", answer: 415, type: "addition" },
                    { question: "What is 524 - 187?", answer: 337, type: "subtraction" },
                    { question: "What is 24 × 15?", answer: 360, type: "multiplication" },
                    { question: "What is 144 ÷ 12?", answer: 12, type: "division" },
                    { question: "What is 236 + 179?", answer: 415, type: "addition" },
                    { question: "What is 403 - 156?", answer: 247, type: "subtraction" },
                    { question: "What is 18 × 23?", answer: 414, type: "multiplication" },
                    { question: "What is 156 ÷ 13?", answer: 12, type: "division" },
                    { question: "What is 325 + 198?", answer: 523, type: "addition" },
                    { question: "What is 672 - 284?", answer: 388, type: "subtraction" },
                    { question: "What is 19 × 17?", answer: 323, type: "multiplication" },
                    { question: "What is 168 ÷ 14?", answer: 12, type: "division" }
                ]
            }
        };
        
        this.progressData = {
            5: { easy: 0, medium: 0, hard: 0 }
        };
        
        this.loadState();
        this.initializeApp();
    }
    
    initializeRecentQuestions() {
        // Initialize recent questions tracking for all years and difficulties
        if (!this.playerState.recentQuestions) {
            this.playerState.recentQuestions = {};
        }
        
        for (let year = 1; year <= 6; year++) {
            if (!this.playerState.recentQuestions[year]) {
                this.playerState.recentQuestions[year] = {};
            }
            ['easy', 'medium', 'hard'].forEach(difficulty => {
                if (!this.playerState.recentQuestions[year][difficulty]) {
                    this.playerState.recentQuestions[year][difficulty] = [];
                }
            });
        }
    }
    
    initializeApp() {
        this.bindEvents();
        this.updateUI();
        this.loadNextQuestion();
    }
    
    bindEvents() {
        // Answer input and submission
        document.getElementById('submitBtn').addEventListener('click', () => this.submitAnswer());
        document.getElementById('skipBtn').addEventListener('click', () => this.skipQuestion());
        
        // Difficulty tabs
        document.querySelectorAll('.difficulty-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.changeDifficulty(e.target.dataset.difficulty);
            });
        });
        
        // Parent controls
        document.getElementById('parentControlsBtn').addEventListener('click', () => this.openParentControls());
        document.getElementById('closeParentModal').addEventListener('click', () => this.closeParentControls());
        document.getElementById('validatePinBtn').addEventListener('click', () => this.validatePin());
        document.getElementById('resetProgressBtn').addEventListener('click', () => this.resetProgress());
        document.getElementById('yearSelect').addEventListener('change', (e) => this.changeYear(parseInt(e.target.value)));
        
        // Celebration modal
        document.getElementById('continueBtn').addEventListener('click', () => this.closeCelebration());
        
        // Modal backdrop clicks
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    e.target.closest('.modal').classList.add('hidden');
                }
            });
        });
        
        // Initial answer input setup
        this.setupAnswerInput();
    }
    
    // BUG FIX 2: Enhanced answer input setup with proper event handling
    setupAnswerInput() {
        const input = document.getElementById('answerInput');
        if (input) {
            // Clear any existing attributes that might interfere
            input.disabled = false;
            input.readOnly = false;
            input.removeAttribute('disabled');
            input.removeAttribute('readonly');
            
            // Clear any existing event listeners by cloning and replacing the element
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
            
            // Add all necessary event listeners
            newInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.submitAnswer();
                }
            });
            
            // Ensure input responds to clicks
            newInput.addEventListener('click', (e) => {
                e.target.focus();
            });
            
            // Ensure input is focusable
            newInput.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.target.focus();
            });
            
            // Additional input events for better UX
            newInput.addEventListener('focus', (e) => {
                e.target.select(); // Select all text when focused
            });
            
            // Make sure the input is properly styled and interactable
            newInput.style.pointerEvents = 'auto';
            newInput.style.userSelect = 'text';
            newInput.tabIndex = 0;
            
            // Focus the input
            setTimeout(() => {
                newInput.focus();
            }, 100);
        }
    }
    
    // BUG FIX 2: Always recreate answer input and re-attach events
    recreateAnswerInput() {
        const answerSection = document.querySelector('.answer-section');
        const oldInput = document.getElementById('answerInput');
        
        // Remove old input
        if (oldInput) {
            oldInput.remove();
        }
        
        // Create new input with proper attributes
        const newInput = document.createElement('input');
        newInput.type = 'text';
        newInput.className = 'form-control answer-input';
        newInput.id = 'answerInput';
        newInput.placeholder = 'Enter your answer...';
        newInput.autocomplete = 'off';
        newInput.tabIndex = 0;
        
        // Ensure input is never disabled and fully interactive
        newInput.disabled = false;
        newInput.readOnly = false;
        newInput.style.pointerEvents = 'auto';
        newInput.style.userSelect = 'text';
        newInput.style.cursor = 'text';
        
        // Insert before answer buttons
        const answerButtons = document.querySelector('.answer-buttons');
        answerSection.insertBefore(newInput, answerButtons);
        
        // Add all event listeners for full functionality
        newInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitAnswer();
            }
        });
        
        // Mouse interaction events
        newInput.addEventListener('click', (e) => {
            e.stopPropagation();
            e.target.focus();
        });
        
        newInput.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            e.target.focus();
        });
        
        // Focus management
        newInput.addEventListener('focus', (e) => {
            e.target.select(); // Select all text when focused for easy replacement
        });
        
        // Ensure the input is visible and interactable
        newInput.addEventListener('blur', (e) => {
            // Don't prevent blur, but ensure input remains functional
            setTimeout(() => {
                e.target.style.pointerEvents = 'auto';
            }, 10);
        });
        
        // Focus the new input after a short delay to ensure it's rendered
        setTimeout(() => {
            newInput.focus();
            newInput.click(); // Trigger click to ensure it's active
        }, 150);
    }
    
    changeDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        this.questionNumber = 1;
        
        // Update UI
        document.querySelectorAll('.difficulty-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.difficulty === difficulty);
        });
        
        this.updateUI();
        this.loadNextQuestion();
    }
    
    // BUG FIX 1: Implement question sampling with repetition prevention
    getRandomQuestion() {
        const questions = this.questionBanks[this.currentYear]?.[this.currentDifficulty];
        if (!questions || questions.length === 0) {
            return { question: "No questions available", answer: 0, type: "error" };
        }
        
        const recentQuestions = this.playerState.recentQuestions[this.currentYear][this.currentDifficulty];
        
        // Get questions that haven't been used recently
        const availableQuestions = questions.filter(q => 
            !recentQuestions.includes(q.question)
        );
        
        let selectedQuestion;
        
        if (availableQuestions.length === 0) {
            // All questions have been used, reset the recent questions list
            this.playerState.recentQuestions[this.currentYear][this.currentDifficulty] = [];
            selectedQuestion = questions[Math.floor(Math.random() * questions.length)];
        } else {
            // Pick from available questions
            selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        }
        
        // Add to recent questions
        this.playerState.recentQuestions[this.currentYear][this.currentDifficulty].push(selectedQuestion.question);
        
        // Keep only the last N questions (where N is roughly half the total questions available)
        const maxRecent = Math.max(1, Math.floor(questions.length / 2));
        if (this.playerState.recentQuestions[this.currentYear][this.currentDifficulty].length > maxRecent) {
            this.playerState.recentQuestions[this.currentYear][this.currentDifficulty].shift();
        }
        
        return selectedQuestion;
    }
    
    loadNextQuestion() {
        // BUG FIX 2: Always recreate the answer input with proper event handling
        this.recreateAnswerInput();
        
        this.currentQuestion = this.getRandomQuestion();
        this.renderQuestion();
        this.clearFeedback();
    }
    
    renderQuestion() {
        document.getElementById('questionContent').innerHTML = `<p>${this.currentQuestion.question}</p>`;
        document.getElementById('questionNumber').textContent = this.questionNumber;
        document.getElementById('difficultyIndicator').textContent = 
            this.currentDifficulty.charAt(0).toUpperCase() + this.currentDifficulty.slice(1);
    }
    
    submitAnswer() {
        const input = document.getElementById('answerInput');
        if (!input) return;
        
        const userAnswer = parseFloat(input.value.trim());
        
        if (isNaN(userAnswer)) {
            this.showFeedback('Please enter a valid number', false);
            return;
        }
        
        const isCorrect = Math.abs(userAnswer - this.currentQuestion.answer) < 0.01;
        
        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer();
        }
        
        // Progress to next question after delay
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }
    
    skipQuestion() {
        this.showFeedback(`Skipped. The answer was ${this.currentQuestion.answer}`, false);
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }
    
    handleCorrectAnswer() {
        const stars = this.getDifficultyStars();
        const xp = this.getDifficultyXP();
        
        this.playerState.totalStars += stars;
        this.playerState.totalXP += xp;
        this.playerState.currentStreak++;
        this.playerState.streak = Math.max(this.playerState.streak, this.playerState.currentStreak);
        
        this.showFeedback(`Correct! +${stars} stars, +${xp} XP`, true);
        this.checkForBadges();
        this.updateUI();
    }
    
    handleIncorrectAnswer() {
        this.playerState.currentStreak = 0;
        this.showFeedback(`Incorrect. The answer was ${this.currentQuestion.answer}`, false);
    }
    
    nextQuestion() {
        this.questionNumber++;
        this.progressData[this.currentYear][this.currentDifficulty]++;
        
        if (this.progressData[this.currentYear][this.currentDifficulty] >= this.maxQuestions) {
            this.completeDifficulty();
        } else {
            this.loadNextQuestion();
        }
        
        this.updateUI();
        this.saveState();
    }
    
    completeDifficulty() {
        const stats = this.calculateStats();
        this.showCelebration(stats);
        
        // Auto-progress to next difficulty or year
        setTimeout(() => {
            this.autoProgress();
        }, 3000);
    }
    
    autoProgress() {
        if (this.currentDifficulty === 'easy') {
            this.changeDifficulty('medium');
        } else if (this.currentDifficulty === 'medium') {
            this.changeDifficulty('hard');
        } else {
            // Completed hard, move to next year if available
            if (this.currentYear < 6) {
                this.changeYear(this.currentYear + 1);
                this.changeDifficulty('easy');
            } else {
                // Completed everything!
                this.showFeedback('Congratulations! You\'ve completed all levels!', true);
            }
        }
    }
    
    getDifficultyStars() {
        const starMap = { easy: 1, medium: 2, hard: 3 };
        return starMap[this.currentDifficulty];
    }
    
    getDifficultyXP() {
        const xpMap = { easy: 10, medium: 20, hard: 30 };
        return xpMap[this.currentDifficulty];
    }
    
    showFeedback(message, isCorrect) {
        const feedbackSection = document.getElementById('feedbackSection');
        feedbackSection.innerHTML = `
            <div class="feedback-${isCorrect ? 'correct' : 'incorrect'}">
                ${message}
            </div>
        `;
    }
    
    clearFeedback() {
        document.getElementById('feedbackSection').innerHTML = '';
    }
    
    checkForBadges() {
        const newBadges = [];
        
        // Streak badges
        if (this.playerState.currentStreak === 5 && !this.playerState.badges.includes('streak5')) {
            newBadges.push({ id: 'streak5', name: 'Hot Streak', icon: '🔥' });
        }
        if (this.playerState.currentStreak === 10 && !this.playerState.badges.includes('streak10')) {
            newBadges.push({ id: 'streak10', name: 'On Fire', icon: '🚀' });
        }
        
        // Star badges
        if (this.playerState.totalStars >= 50 && !this.playerState.badges.includes('stars50')) {
            newBadges.push({ id: 'stars50', name: 'Star Collector', icon: '⭐' });
        }
        if (this.playerState.totalStars >= 100 && !this.playerState.badges.includes('stars100')) {
            newBadges.push({ id: 'stars100', name: 'Star Master', icon: '🌟' });
        }
        
        // XP badges
        if (this.playerState.totalXP >= 200 && !this.playerState.badges.includes('xp200')) {
            newBadges.push({ id: 'xp200', name: 'Experienced', icon: '🏆' });
        }
        
        newBadges.forEach(badge => {
            this.playerState.badges.push(badge.id);
        });
        
        if (newBadges.length > 0) {
            this.updateBadgesDisplay();
        }
    }
    
    updateUI() {
        // Update header stats
        document.getElementById('totalStars').textContent = this.playerState.totalStars;
        document.getElementById('totalXP').textContent = this.playerState.totalXP;
        document.getElementById('streak').textContent = this.playerState.currentStreak;
        
        // Update year display
        document.getElementById('currentYearDisplay').textContent = this.currentYear;
        
        // Update progress bar
        const progress = this.progressData[this.currentYear][this.currentDifficulty];
        const percentage = (progress / this.maxQuestions) * 100;
        document.getElementById('progressFill').style.width = `${percentage}%`;
        document.getElementById('progressText').textContent = `${progress}/${this.maxQuestions} questions`;
        
        // Update badges
        this.updateBadgesDisplay();
    }
    
    updateBadgesDisplay() {
        const badgesContainer = document.getElementById('badgesContainer');
        const badgeDefinitions = {
            'streak5': { name: 'Hot Streak', icon: '🔥' },
            'streak10': { name: 'On Fire', icon: '🚀' },
            'stars50': { name: 'Star Collector', icon: '⭐' },
            'stars100': { name: 'Star Master', icon: '🌟' },
            'xp200': { name: 'Experienced', icon: '🏆' }
        };
        
        badgesContainer.innerHTML = '';
        
        if (this.playerState.badges.length === 0) {
            badgesContainer.innerHTML = '<p style="color: var(--color-text-secondary);">No badges earned yet</p>';
            return;
        }
        
        this.playerState.badges.slice(-5).forEach(badgeId => {
            const badge = badgeDefinitions[badgeId];
            if (badge) {
                const badgeElement = document.createElement('div');
                badgeElement.className = 'badge';
                badgeElement.innerHTML = `
                    <span class="badge-icon">${badge.icon}</span>
                    <span>${badge.name}</span>
                `;
                badgesContainer.appendChild(badgeElement);
            }
        });
    }
    
    // Parent Controls
    openParentControls() {
        document.getElementById('parentModal').classList.remove('hidden');
        document.getElementById('parentPinInput').focus();
    }
    
    closeParentControls() {
        document.getElementById('parentModal').classList.add('hidden');
        document.getElementById('pinEntry').classList.remove('hidden');
        document.getElementById('parentControls').classList.add('hidden');
        document.getElementById('parentPinInput').value = '';
    }
    
    validatePin() {
        const pin = document.getElementById('parentPinInput').value;
        if (pin === '1234') {
            document.getElementById('pinEntry').classList.add('hidden');
            document.getElementById('parentControls').classList.remove('hidden');
            this.updateParentStats();
        } else {
            alert('Incorrect PIN');
        }
    }
    
    updateParentStats() {
        const statsDisplay = document.getElementById('statsDisplay');
        statsDisplay.innerHTML = `
            <div class="stat-row"><span>Total Stars:</span><span>${this.playerState.totalStars}</span></div>
            <div class="stat-row"><span>Total XP:</span><span>${this.playerState.totalXP}</span></div>
            <div class="stat-row"><span>Best Streak:</span><span>${this.playerState.streak}</span></div>
            <div class="stat-row"><span>Current Year:</span><span>${this.currentYear}</span></div>
            <div class="stat-row"><span>Badges Earned:</span><span>${this.playerState.badges.length}</span></div>
        `;
    }
    
    resetProgress() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            this.playerState = {
                totalStars: 0,
                totalXP: 0,
                streak: 0,
                currentStreak: 0,
                badges: [],
                recentQuestions: {}
            };
            
            this.progressData = {
                5: { easy: 0, medium: 0, hard: 0 }
            };
            
            this.currentYear = 5;
            this.currentDifficulty = 'easy';
            this.questionNumber = 1;
            
            this.initializeRecentQuestions();
            this.saveState();
            this.updateUI();
            this.closeParentControls();
            this.loadNextQuestion();
        }
    }
    
    changeYear(year) {
        this.currentYear = year;
        
        // Initialize progress for new year if needed
        if (!this.progressData[year]) {
            this.progressData[year] = { easy: 0, medium: 0, hard: 0 };
        }
        
        // Reset to easy difficulty
        this.changeDifficulty('easy');
        this.updateUI();
    }
    
    // Celebration
    showCelebration(stats) {
        const modal = document.getElementById('celebrationModal');
        const title = document.getElementById('celebrationTitle');
        const message = document.getElementById('celebrationMessage');
        const statsDiv = document.getElementById('celebrationStats');
        
        title.textContent = `${this.currentDifficulty.charAt(0).toUpperCase() + this.currentDifficulty.slice(1)} Complete!`;
        message.textContent = `Great job completing Year ${this.currentYear} ${this.currentDifficulty} level!`;
        
        statsDiv.innerHTML = `
            <div class="stat-row"><span>Questions Completed:</span><span>${this.maxQuestions}</span></div>
            <div class="stat-row"><span>Stars Earned:</span><span>+${stats.starsEarned}</span></div>
            <div class="stat-row"><span>XP Earned:</span><span>+${stats.xpEarned}</span></div>
        `;
        
        modal.classList.remove('hidden');
    }
    
    closeCelebration() {
        document.getElementById('celebrationModal').classList.add('hidden');
    }
    
    calculateStats() {
        const questionsCompleted = this.progressData[this.currentYear][this.currentDifficulty];
        const starsEarned = questionsCompleted * this.getDifficultyStars();
        const xpEarned = questionsCompleted * this.getDifficultyXP();
        
        return { questionsCompleted, starsEarned, xpEarned };
    }
    
    // State Management
    saveState() {
        try {
            const state = {
                playerState: this.playerState,
                progressData: this.progressData,
                currentYear: this.currentYear,
                currentDifficulty: this.currentDifficulty,
                questionNumber: this.questionNumber
            };
            // Note: Using console.log instead of localStorage due to sandbox restrictions
            console.log('Saving state:', state);
        } catch (error) {
            console.log('Could not save state:', error);
        }
    }
    
    loadState() {
        try {
            // Note: In a real app this would load from localStorage
            // For sandbox environment, we'll use default values
            console.log('Loading default state');
        } catch (error) {
            console.log('Could not load state, using defaults:', error);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MathQuestApp();
});