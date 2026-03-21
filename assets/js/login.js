/**
 * Kavex Login & UI Helpers
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('#login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Password Toggle
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            const input = e.target.parentElement.querySelector('input');
            if (input.type === 'password') {
                input.type = 'text';
                e.target.textContent = 'HIDE';
            } else {
                input.type = 'password';
                e.target.textContent = 'SHOW';
            }
        });
    });
});

async function handleLogin(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    const btn = e.target.querySelector('button[type="submit"]');
    const errorDiv = document.querySelector('#login-error');

    if (errorDiv) errorDiv.style.display = 'none';
    setLoading(btn, true);

    try {
        const res = await window.kavexAuth.signIn(email, password);
        
        if (!res.success) {
            showError(errorDiv, res.error);
            setLoading(btn, false);
            return;
        }

        // Redirect is handled inside signIn() based on role
        // but can be overridden here if needed.

    } catch (err) {
        showError(errorDiv, "An unexpected error occurred. Please try again.");
        setLoading(btn, false);
    }
}

async function handleGoogleLogin() {
    const { supabase } = window.kavexSupabase;
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + '/index.html'
        }
    });
    if (error) alert("OAuth Error: " + error.message);
}

// UI Helpers
function setLoading(btn, isLoading) {
    if (isLoading) {
        btn.disabled = true;
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = `<span class="spinner"></span> Logging in...`;
    } else {
        btn.disabled = false;
        btn.innerHTML = btn.dataset.originalText;
    }
}

function showError(div, msg) {
    if (div) {
        div.textContent = msg;
        div.style.display = 'block';
        div.className = 'alert-inline error-shake';
    } else {
        alert(msg);
    }
}
