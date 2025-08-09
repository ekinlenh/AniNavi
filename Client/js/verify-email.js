document.addEventListener('DOMContentLoaded', function() {
    const email = sessionStorage.getItem('emailForVerification');
    const verificationForm = document.getElementById('verificationForm');
    const codeInputs = document.querySelectorAll('.code-input');
    const userEmailElement = document.getElementById('userEmail');
    const errorMessageElement = document.getElementById('errorMessage');
    const successMessageElement = document.getElementById('successMessage');
    const resendLink = document.getElementById('resendLink');
    const resendContainer = document.getElementById('resendContainer');
    
    if (!email) {
        window.location.href = '/signup.html';
        return;
    }
    
    userEmailElement.textContent = maskEmail(email);
    document.getElementById('email').value = email;
    
    codeInputs[0].focus();
    
    codeInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (!/^\d*$/.test(e.target.value)) {
                e.target.value = '';
                return;
            }
            
            if (e.target.value.length === 1) {
                if (index < codeInputs.length - 1) {
                    codeInputs[index + 1].focus();
                } else {
                    verificationForm.dispatchEvent(new Event('submit'));
                }
            }
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && e.target.value.length === 0) {
                if (index > 0) {
                    codeInputs[index - 1].focus();
                }
            }
        });
        
        input.addEventListener('paste', (e) => {
            e.preventDefault();
        });
    });
    
    verificationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const code = Array.from(codeInputs).map(input => input.value).join('');
        
        if (code.length !== 6) {
            showError('Please enter a complete 6-digit code');
            return;
        }
        
        try {
            const response = await fetch('aninavi.vercel.app/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    verificationCode: code
                })
            });
            
            if (response.ok) {
                showSuccess('Email verified successfully! Redirecting...');
                sessionStorage.removeItem('emailForVerification');
                
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 1500);
            } else {
                const errorData = await response.json();
                showError(errorData.message || 'Verification failed. Please try again.');
                clearInputs();
            }
        } catch (error) {
            console.error('Verification error:', error);
            showError('Network error. Please try again.');
            clearInputs();
        }
    });
    
    resendLink.addEventListener('click', async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('aninavi.vercel.app/api/auth/resend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email })
            });
            
            if (response.ok) {
                showSuccess('A new verification code has been sent.');
                startResendTimer();
                clearInputs();
                codeInputs[0].focus();
            } else {
                const errorData = await response.json();
                showError(errorData.message || 'Failed to resend code. Please try again.');
            }
        } catch (error) {
            console.error('Resend error:', error);
            showError('Network error. Please try again.');
        }
    });
    
    startResendTimer();
    
    function showError(message) {
        errorMessageElement.textContent = message;
        errorMessageElement.style.display = 'block';
        successMessageElement.style.display = 'none';
    }
    
    function showSuccess(message) {
        successMessageElement.textContent = message;
        successMessageElement.style.display = 'block';
        errorMessageElement.style.display = 'none';
    }
    
    function clearInputs() {
        codeInputs.forEach(input => {
            input.value = '';
        });
        codeInputs[0].focus();
    }
    
    function maskEmail(email) {
        const [name, domain] = email.split('@');
        const maskedName = name.length > 2 
            ? name.substring(0, 2) + '*'.repeat(name.length - 2)
            : '*'.repeat(name.length);
        return maskedName + '@' + domain;
    }
    
    function startResendTimer() {
        let countdown = 30;
        resendLink.style.display = 'none';
        resendContainer.innerHTML = `You can request a new code in <span id="countdown">${countdown}</span> seconds`;
        
        const timer = setInterval(() => {
            countdown--;
            document.getElementById('countdown').textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(timer);
                resendContainer.innerHTML = '<a id="resendLink">Resend code</a>';
                document.getElementById('resendLink').addEventListener('click', async (e) => {
                    e.preventDefault();
                    resendLink.click();
                });
            }
        }, 1000);
    }
});