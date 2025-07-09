// auth.js

// 요소 참조
const authModal = document.getElementById('auth-modal');
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const toggleAuthBtn = document.getElementById('toggle-auth-mode');

const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const authUser = document.getElementById('auth-user');

let isLoginMode = true; // 로그인 모드인지 여부

// ──────────────── 모달 열기/닫기 ────────────────
loginBtn.addEventListener('click', () => {
  isLoginMode = true;
  updateAuthMode();
  authModal.classList.remove('hidden');
});

logoutBtn.addEventListener('click', async () => {
  await fetch('/logout', {
    method: 'POST',
    credentials: 'include'      // 세션 쿠키 포함
  });
  updateUI(null);
});

toggleAuthBtn.addEventListener('click', () => {
  isLoginMode = !isLoginMode;
  updateAuthMode();
});

// ──────────────── 로그인/회원가입 제출 ────────────────
authForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = authEmail.value.trim();
  const password = authPassword.value.trim();
  if (!email || !password) return;

  const endpoint = isLoginMode ? 'login' : 'signup';

  try {
    const res = await fetch(`/${endpoint}`, {
      method: 'POST',
      credentials: 'include',     // 세션 쿠키 포함
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message || '오류가 발생했습니다.');
      return;
    }

    updateUI(data.user);
    authModal.classList.add('hidden');
    authForm.reset();
  } catch (err) {
    console.error('오류 발생:', err);
    alert('네트워크 오류입니다.');
  }
});

// ──────────────── 현재 로그인 사용자 확인 ────────────────
async function checkLogin() {
  try {
    const res = await fetch('/me', {
      credentials: 'include'      // 세션 쿠키 포함
    });
    if (!res.ok) throw new Error('not logged in');
    const data = await res.json();
    updateUI(data);
  } catch {
    updateUI(null);
  }
}

// ──────────────── 로그인 상태에 따른 UI 처리 ────────────────
function updateUI(user) {
  if (user) {
    authUser.textContent = `${user.email}님`;
    loginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
  } else {
    authUser.textContent = '';
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
  }
}

// ──────────────── 모드 전환 처리 ────────────────
function updateAuthMode() {
  authTitle.textContent = isLoginMode ? '로그인' : '회원가입';
  toggleAuthBtn.textContent = isLoginMode ? '회원가입' : '로그인';
}

// ──────────────── 초기 로그인 상태 확인 ────────────────
checkLogin();
