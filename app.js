// MathQuest-V2 Application
class MathQuestApp {
    constructor() {
        this.user = null;
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
        
        
        this.progressData = {
            5: { easy: 0, medium: 0, hard: 0 }
        };
        
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
        this.bindAuthEvents();
    }

    bindAuthEvents() {
        document.getElementById('loginBtn').addEventListener('click', () => this.handleLogin());
        document.getElementById('registerBtn').addEventListener('click', () => this.handleRegister());
        document.getElementById('showRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleAuthForms();
        });
        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleAuthForms(false);
        });
    }

    toggleAuthForms(showRegister = true) {
        document.getElementById('loginForm').classList.toggle('hidden', showRegister);
        document.getElementById('registerForm').classList.toggle('hidden', !showRegister);
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
    
    async loadNextQuestion() {
        // BUG FIX 2: Always recreate the answer input with proper event handling
        this.recreateAnswerInput();
        
        try {
            const response = await fetch('/api/question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ year: this.currentYear, difficulty: this.currentDifficulty })
            });

            const result = await response.json();

            if (result.success) {
                this.currentQuestion = result.question;
                this.renderQuestion();
                this.clearFeedback();
            } else {
                this.showFeedback(result.message, false);
            }
        } catch (error) {
            console.error('Error fetching question:', error);
            this.showFeedback('Could not load a new question.', false);
        }
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
            // Completed hard, award badge and move to next year
            this.checkForBadges(true); // Check for year completion badge
            if (this.currentYear < 10) { // Updated to 10
                this.changeYear(this.currentYear + 1);
                this.changeDifficulty('easy');
            } else {
                // Completed everything!
                this.showFeedback('Congratulations! You\'ve completed all levels!', true);
            }
        }
    }
    
    getDifficultyStars() {
        const starMap = { easy: 5, medium: 10, hard: 15 };
        return starMap[this.currentDifficulty];
    }
    
    getDifficultyXP() {
        const xpMap = { easy: 25, medium: 50, hard: 75 };
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
    
    checkForBadges(checkCompletion = false) {
        const newBadges = [];

        // Streak badges
        const streakBadges = {
            3: { id: 'streak3', name: 'Warming Up', icon: '👍' },
            5: { id: 'streak5', name: 'Hot Streak', icon: '🔥' },
            10: { id: 'streak10', name: 'On Fire', icon: '🚀' },
            15: { id: 'streak15', name: 'Unstoppable', icon: '☄️' }
        };
        for (const streak in streakBadges) {
            if (this.playerState.currentStreak >= streak && !this.playerState.badges.includes(streakBadges[streak].id)) {
                newBadges.push(streakBadges[streak]);
            }
        }

        // Star badges
        const starBadges = {
            25: { id: 'stars25', name: 'Star Gazer', icon: '✨' },
            50: { id: 'stars50', name: 'Star Collector', icon: '⭐' },
            100: { id: 'stars100', name: 'Star Master', icon: '🌟' },
            150: { id: 'stars150', name: 'Galaxy Explorer', icon: '🌌' },
            200: { id: 'stars200', name: 'Supernova', icon: '🎇' }
        };
        for (const stars in starBadges) {
            if (this.playerState.totalStars >= stars && !this.playerState.badges.includes(starBadges[stars].id)) {
                newBadges.push(starBadges[stars]);
            }
        }

        // XP badges
        const xpBadges = {
            100: { id: 'xp100', name: 'Getting Started', icon: '🎓' },
            200: { id: 'xp200', name: 'Experienced', icon: '🏆' },
            300: { id: 'xp300', name: 'Leveling Up', icon: '📈' },
            500: { id: 'xp500', name: 'Prodigy', icon: '🧠' }
        };
        for (const xp in xpBadges) {
            if (this.playerState.totalXP >= xp && !this.playerState.badges.includes(xpBadges[xp].id)) {
                newBadges.push(xpBadges[xp]);
            }
        }

        // Year completion badges
        if (checkCompletion) {
            const yearBadgeId = `year${this.currentYear - 1}Complete`;
            if (!this.playerState.badges.includes(yearBadgeId)) {
                newBadges.push({ id: yearBadgeId, name: `Year ${this.currentYear - 1} Graduate`, icon: '🏅' });
            }
        }

        newBadges.forEach(badge => {
            if (!this.playerState.badges.includes(badge.id)) {
                this.playerState.badges.push(badge.id);
            }
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
            // Streaks
            'streak3': { name: 'Warming Up', icon: '👍' },
            'streak5': { name: 'Hot Streak', icon: '🔥' },
            'streak10': { name: 'On Fire', icon: '🚀' },
            'streak15': { name: 'Unstoppable', icon: '☄️' },
            // Stars
            'stars25': { name: 'Star Gazer', icon: '✨' },
            'stars50': { name: 'Star Collector', icon: '⭐' },
            'stars100': { name: 'Star Master', icon: '🌟' },
            'stars150': { name: 'Galaxy Explorer', icon: '🌌' },
            'stars200': { name: 'Supernova', icon: '🎇' },
            // XP
            'xp100': { name: 'Getting Started', icon: '🎓' },
            'xp200': { name: 'Experienced', icon: '🏆' },
            'xp300': { name: 'Leveling Up', icon: '📈' },
            'xp500': { name: 'Prodigy', icon: '🧠' },
            // Year Completion
            'year5Complete': { name: 'Year 5 Graduate', icon: '🏅' },
            'year6Complete': { name: 'Year 6 Graduate', icon: '🏅' },
            'year7Complete': { name: 'Year 7 Graduate', icon: '🏅' },
            'year8Complete': { name: 'Year 8 Graduate', icon: '🏅' },
            'year9Complete': { name: 'Year 9 Graduate', icon: '🏅' },
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
    async handleLogin() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        if (!username || !password) {
            alert('Please enter username and password');
            return;
        }

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (result.success) {
                this.user = result.user;
                this.showApp();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login.');
        }
    }

    async handleRegister() {
        const username = document.getElementById('registerUsername').value.trim();
        const password = document.getElementById('registerPassword').value.trim();
        const role = document.getElementById('registerRole').value;

        if (!username || !password) {
            alert('Please enter username and password');
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role })
            });

            const result = await response.json();

            if (result.success) {
                this.user = result.user;
                this.showApp();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred during registration.');
        }
    }

    async showApp() {
        document.getElementById('authContainer').classList.add('hidden');
        document.getElementById('appContainer').classList.remove('hidden');

        // If the user is a parent, hide the main game content and show a message.
        if (this.user.role === 'parent') {
            document.querySelector('.main-content').innerHTML = `
                <div class="card">
                    <div class="card__body">
                        <h2>Welcome, Parent!</h2>
                        <p>You are logged in as a parent. You can access Parent Controls from the header.</p>
                    </div>
                </div>
            `;
            this.bindEvents(); // Bind parent-specific events
        } else {
            await this.loadState(); // Await loading state before proceeding
            this.bindEvents();
            this.loadNextQuestion();
        }
    }
    
    async handleSaveApiKey() {
        const apiKey = document.getElementById('geminiApiKeyInput').value.trim();
        if (!apiKey) {
            alert('Please enter an API key.');
            return;
        }

        try {
            const response = await fetch('/api/config/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey, role: this.user.role })
            });

            const result = await response.json();

            if (result.success) {
                alert('API key saved successfully!');
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Error saving API key:', error);
            alert('An error occurred while saving the API key.');
        }
    }

    openParentControls() {
        if (this.user && this.user.role === 'parent') {
            document.getElementById('parentModal').classList.remove('hidden');
            this.updateParentStats();
            document.getElementById('saveApiKeyBtn').addEventListener('click', () => this.handleSaveApiKey());
        } else {
            alert('You must be logged in as a parent to access this feature.');
        }
    }
    
    closeParentControls() {
        document.getElementById('parentModal').classList.add('hidden');
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
            
            this.progressData = {};
            this.progressData[5] = { easy: 0, medium: 0, hard: 0 };
            
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
    async saveState() {
        if (!this.user || this.user.role !== 'student') return;

        try {
            const stateToSave = {
                userId: this.user.id,
                totalStars: this.playerState.totalStars,
                totalXP: this.playerState.totalXP,
                streak: this.playerState.streak,
                currentStreak: this.playerState.currentStreak,
                badges: this.playerState.badges,
                progressData: this.progressData,
                currentYear: this.currentYear,
                currentDifficulty: this.currentDifficulty,
                questionNumber: this.questionNumber
            };

            await fetch('/api/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stateToSave)
            });
        } catch (error) {
            console.error('Could not save state:', error);
        }
    }
    
    async loadState() {
        if (!this.user || this.user.role !== 'student') return;

        try {
            const response = await fetch(`/api/progress/${this.user.id}`);
            const result = await response.json();

            if (result.success && result.progress) {
                const progress = result.progress;
                this.playerState.totalStars = progress.totalStars;
                this.playerState.totalXP = progress.totalXP;
                this.playerState.streak = progress.streak;
                this.playerState.currentStreak = progress.currentStreak;
                this.playerState.badges = progress.badges;
                this.progressData = progress.progressData;
                this.currentYear = progress.currentYear;
                this.currentDifficulty = progress.currentDifficulty;
                this.questionNumber = progress.questionNumber;

                console.log('State loaded successfully.');
            } else {
                console.log('No saved state found, using defaults.');
            }
        } catch (error) {
            console.error('Could not load state, using defaults:', error);
        }

        // Always update UI after attempting to load state
        this.updateUI();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MathQuestApp();
});