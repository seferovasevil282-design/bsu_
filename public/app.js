// Registration data storage
let registrationData = {};
let verificationQuestions = [];
let selectedAnswers = {};

// Show/Hide screens
function showScreen(screenId) {
    document.querySelectorAll('.container').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

function showLogin() {
    showScreen('loginScreen');
}

function showRegister() {
    showScreen('registerScreen1');
}

function showAdminLogin() {
    showScreen('adminLoginScreen');
}

// Login
async function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    if (!email || !password) {
        errorDiv.textContent = 'Bütün xanaları doldurun';
        errorDiv.classList.remove('hidden');
        return;
    }

    const fullEmail = email.includes('@') ? email : email + '@bsu.edu.az';

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: fullEmail, password })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            window.location.href = '/chat.html';
        } else {
            errorDiv.textContent = data.error;
            errorDiv.classList.remove('hidden');
        }
    } catch (error) {
        errorDiv.textContent = 'Bağlantı xətası';
        errorDiv.classList.remove('hidden');
    }
}

// Admin Login
async function adminLogin() {
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('adminLoginError');

    if (!username || !password) {
        errorDiv.textContent = 'Bütün xanaları doldurun';
        errorDiv.classList.remove('hidden');
        return;
    }

    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('currentAdmin', JSON.stringify(data.admin));
            window.location.href = '/admin.html';
        } else {
            errorDiv.textContent = data.error;
            errorDiv.classList.remove('hidden');
        }
    } catch (error) {
        errorDiv.textContent = 'Bağlantı xətası';
        errorDiv.classList.remove('hidden');
    }
}

// Registration Step 1
function goToRegisterStep2() {
    const email = document.getElementById('registerEmail').value.trim();
    const phone = document.getElementById('registerPhone').value.trim();
    const password = document.getElementById('registerPassword').value;
    const errorDiv = document.getElementById('registerError1');

    if (!email || !phone || !password) {
        errorDiv.textContent = 'Bütün xanaları doldurun';
        errorDiv.classList.remove('hidden');
        return;
    }

    if (phone.length !== 9 || !/^\d+$/.test(phone)) {
        errorDiv.textContent = 'Telefon nömrəsi 9 rəqəmdən ibarət olmalıdır';
        errorDiv.classList.remove('hidden');
        return;
    }

    registrationData = {
        email: email + '@bsu.edu.az',
        phone: '+994' + phone,
        password
    };

    showScreen('registerScreen2');
}

function backToRegisterStep1() {
    showScreen('registerScreen1');
}

// Registration Step 2
async function goToVerification() {
    const fullname = document.getElementById('registerFullname').value.trim();
    const faculty = document.getElementById('registerFaculty').value;
    const degree = document.getElementById('registerDegree').value;
    const course = document.getElementById('registerCourse').value;
    const errorDiv = document.getElementById('registerError2');

    if (!fullname || !faculty || !degree || !course) {
        errorDiv.textContent = 'Bütün xanaları doldurun';
        errorDiv.classList.remove('hidden');
        return;
    }

    registrationData = {
        ...registrationData,
        fullname,
        faculty,
        degree,
        course: parseInt(course)
    };

    // Get verification questions
    try {
        const response = await fetch('/api/verification-questions');
        verificationQuestions = await response.json();
        displayVerificationQuestions();
        showScreen('verificationScreen');
    } catch (error) {
        errorDiv.textContent = 'Xəta baş verdi';
        errorDiv.classList.remove('hidden');
    }
}

function backToRegisterStep2() {
    showScreen('registerScreen2');
}

// Display verification questions
function displayVerificationQuestions() {
    const container = document.getElementById('verificationQuestions');
    container.innerHTML = '';
    selectedAnswers = {};

    verificationQuestions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'verification-question';
        
        const questionText = document.createElement('p');
        questionText.textContent = `${index + 1}. ${q.question}`;
        questionDiv.appendChild(questionText);

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'options';

        q.options.forEach(option => {
            const optionBtn = document.createElement('div');
            optionBtn.className = 'option-btn';
            optionBtn.textContent = option;
            optionBtn.onclick = () => selectAnswer(q.question, option, optionBtn, optionsDiv);
            optionsDiv.appendChild(optionBtn);
        });

        questionDiv.appendChild(optionsDiv);
        container.appendChild(questionDiv);
    });
}

function selectAnswer(question, answer, btn, container) {
    // Remove previous selection
    container.querySelectorAll('.option-btn').forEach(b => {
        b.classList.remove('selected');
    });
    
    // Add selection
    btn.classList.add('selected');
    selectedAnswers[question] = answer;
}

// Complete registration
async function completeRegistration() {
    const errorDiv = document.getElementById('verificationError');

    // Check if all questions are answered
    if (Object.keys(selectedAnswers).length < 3) {
        errorDiv.textContent = 'Bütün sualları cavablandırın';
        errorDiv.classList.remove('hidden');
        return;
    }

    // Prepare answers array
    const answers = verificationQuestions.map(q => ({
        question: q.question,
        answer: selectedAnswers[q.question]
    }));

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...registrationData,
                answers
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('Qeydiyyat uğurla tamamlandı! İndi daxil ola bilərsiniz.');
            showLogin();
        } else {
            errorDiv.textContent = data.error;
            errorDiv.classList.remove('hidden');
        }
    } catch (error) {
        errorDiv.textContent = 'Bağlantı xətası';
        errorDiv.classList.remove('hidden');
    }
}

// Check if user is already logged in
if (localStorage.getItem('currentUser')) {
    window.location.href = '/chat.html';
}
