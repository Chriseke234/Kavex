/**
 * Kavex Password Recovery Logic
 */

async function handleForgotPassword(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const btn = e.target.querySelector('button');
    const statusDiv = document.querySelector('#recovery-status');

    btn.disabled = true;
    btn.textContent = 'Sending...';

    const res = await window.kavexAuth.resetPassword(email);

    if (res.success) {
        statusDiv.innerHTML = `<div class="alert-inline success">Reset link sent! Please check your email inbox.</div>`;
        e.target.style.display = 'none';
    } else {
        statusDiv.innerHTML = `<div class="alert-inline error">${res.error}</div>`;
        btn.disabled = false;
        btn.textContent = 'Send Reset Link';
    }
}

async function handleResetPassword(e) {
    e.preventDefault();
    const newPassword = e.target.password.value;
    const confirm = e.target.confirm_password.value;
    const btn = e.target.querySelector('button');
    const statusDiv = document.querySelector('#reset-status');

    if (newPassword !== confirm) {
        statusDiv.innerHTML = `<div class="alert-inline error">Passwords do not match.</div>`;
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Updating...';

    const res = await window.kavexAuth.updatePassword(newPassword);

    if (res.success) {
        statusDiv.innerHTML = `<div class="alert-inline success">Password updated! Redirecting to login...</div>`;
        setTimeout(() => {
            window.location.href = '/pages/auth/login.html';
        }, 2000);
    } else {
        statusDiv.innerHTML = `<div class="alert-inline error">${res.error}</div>`;
        btn.disabled = false;
        btn.textContent = 'Update Password';
    }
}
