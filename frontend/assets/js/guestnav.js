
function initializeNavbar() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.replaceWith(mobileMenuBtn.cloneNode(true));
        const newMobileMenuBtn = document.getElementById('mobileMenuBtn');
        newMobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            mobileMenu.classList.toggle('hidden');
        });
                document.addEventListener('click', function(event) {
            if (!newMobileMenuBtn.contains(event.target) && !mobileMenu.contains(event.target)) {
                mobileMenu.classList.add('hidden');
            }
        });
        console.log('Mobile menu initialized successfully!');
    } else {
        console.error('Mobile menu elements not found!');
    }    
    initializeButtonEffects();
}
function initializeButtonEffects() {
    const registerBtn = document.getElementById('registerBtn');
    const loginBtn = document.getElementById('loginBtn');
    if (registerBtn && loginBtn) {
        registerBtn.addEventListener('mouseenter', () => {
            registerBtn.style.backgroundColor = '#7A8568';
            registerBtn.style.color = 'white';
        });
        registerBtn.addEventListener('mouseleave', () => {
            registerBtn.style.backgroundColor = 'transparent';
            registerBtn.style.color = '#7A8568';
        });
        loginBtn.addEventListener('mouseenter', () => {
            loginBtn.style.backgroundColor = 'transparent';
            loginBtn.style.color = '#7A8568';
            loginBtn.style.borderColor = '#7A8568';
        });
        loginBtn.addEventListener('mouseleave', () => {
            loginBtn.style.backgroundColor = '#7A8568';
            loginBtn.style.color = 'white';
            loginBtn.style.borderColor = '#7A8568';
        });
    }
}
document.addEventListener('DOMContentLoaded', initializeNavbar);
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNavbar);
} else {
    initializeNavbar();
}
setTimeout(initializeNavbar, 100);
