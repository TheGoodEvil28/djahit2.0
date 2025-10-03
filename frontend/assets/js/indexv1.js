document.addEventListener('DOMContentLoaded', function() {
    function getAuthToken() {
        return localStorage.getItem('authToken');
    }
    const isAuthenticated = getAuthToken() !== null;
    $('#navbar-container').load('frontend/page/navbar.html', function(response, status, xhr) {
        if (status === "success") {
            console.log("Navbar loaded successfully");
            setTimeout(() => {
                if (typeof window.initializeDjahitNavbarWithAuth === 'function') {
                    window.initializeDjahitNavbarWithAuth();
                }
            }, 150);
        } else {
            console.error("Navbar load failed:", status);
        }
    });    
    $('#footer-container').load('frontend/page/footer.html');
    setTimeout(function() {
        initializeButtonEffects();
        initializeMissionCardEffects();
    }, 200);
    initializeFAQ();
    if (window.innerWidth >= 1024) {
        const mustontop = document.getElementById('mustontop');
        if (mustontop) {
            mustontop.style.cssText = `
                position: fixed !important;
                left: 2px !important;
                bottom: -170px !important;
                z-index: 9999 !important;
                pointer-events: none !important;
            `;
        }
    }
    initializeChatbot(isAuthenticated);
});
function initializeFAQ() {
    const faqToggles = document.querySelectorAll('.faq-toggle');
    faqToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const faqContent = this.parentElement.querySelector('.faq-content');
            const arrow = this.querySelector('.faq-arrow');         
            if (faqContent.style.maxHeight === '0px' || !faqContent.style.maxHeight) {
                faqContent.style.maxHeight = faqContent.scrollHeight + 'px';
                if (arrow) arrow.style.transform = 'rotate(-90deg)';
            } else {
                faqContent.style.maxHeight = '0px';
                if (arrow) arrow.style.transform = 'rotate(0deg)';
            }
        });
    });
}
function initializeButtonEffects() {
    const registerBtn = document.getElementById('registerBtn');
    const loginBtn = document.getElementById('loginBtn');   
    if (registerBtn) {
        registerBtn.addEventListener('mouseenter', () => {
            registerBtn.style.backgroundColor = '#7A8568';
            registerBtn.style.color = 'white';
        });
        registerBtn.addEventListener('mouseleave', () => {
            registerBtn.style.backgroundColor = 'transparent';
            registerBtn.style.color = '#7A8568';
        });
    }
    if (loginBtn) {
        loginBtn.addEventListener('mouseenter', () => {
            loginBtn.style.backgroundColor = 'transparent';
            loginBtn.style.color = '#7A8568';
        });
        loginBtn.addEventListener('mouseleave', () => {
            loginBtn.style.backgroundColor = '#7A8568';
            loginBtn.style.color = 'white';
        });
    }
}
function initializeMissionCardEffects() {
    const cards = [
        {
            id: 'missionCard1',
            img: 'missionCard1Img',
            p: 'missionCard1p',
            imgDefault: 'frontend/assets/img/thrift-shop 1.png',
            imgHover: 'frontend/assets/img/thrift-shop 1 white.png'
        },
        {
            id: 'missionCard2',
            img: 'missionCard2Img',
            p: 'missionCard2p',
            imgDefault: 'frontend/assets/img/sewing-machine 1.png',
            imgHover: 'frontend/assets/img/sewing-machine white.png'
        },
        {
            id: 'missionCard3',
            img: 'missionCard3Img',
            p: 'missionCard3p',
            imgDefault: 'frontend/assets/img/garbage-bag 1.png',
            imgHover: 'frontend/assets/img/garbage-bag white.png'
        }
    ];   
    cards.forEach(({ id, img, p, imgDefault, imgHover }) => {
        const card = document.getElementById(id);
        const imgEl = document.getElementById(img);
        const pEl = document.getElementById(p);  
        if (card) {
            card.addEventListener('mouseenter', () => {
                card.style.backgroundColor = '#7A8568';
                card.style.borderColor = '#A85C47';
                if (pEl) pEl.style.color = '#F6F7F3';
                if (imgEl) imgEl.src = imgHover;
            });
            card.addEventListener('mouseleave', () => {
                card.style.backgroundColor = '#E9E4D4';
                if (pEl) pEl.style.color = '#393E30';
                if (imgEl) imgEl.src = imgDefault;
            });
        }
    });
}
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('nav');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.classList.add('shadow-lg');
        } else {
            navbar.classList.remove('shadow-lg');
        }
    }
});
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
        }
    });
}, observerOptions);
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }    
    .animate-fade-in {
        animation: fadeIn 0.8s ease-out forwards;
    }
    .faq-content {
        transition: all 0.5s ease-in-out;
    }
`;
document.head.appendChild(style);
function initializeChatbot(isAuthenticated) {
    const chatbotBubble = document.getElementById('chatbotBubble');
    if (!isAuthenticated) {
        if (chatbotBubble) {
            chatbotBubble.remove();
        }
        return;
    }
    if (chatbotBubble) {
        chatbotBubble.style.display = 'block';
    }
    const chatbotBubbleBtn = document.getElementById('chatbotBubbleBtn');
    const chatbotWidget = document.getElementById('chatbotWidget');
    const closeChatWidget = document.getElementById('closeChatWidget');
    const sendBtn = document.getElementById('sendBtn');
    const messageInput = document.getElementById('userMessage');
    const chatContainer = document.getElementById('chatContainer');
    if (!chatbotBubbleBtn || !chatbotWidget || !sendBtn || !messageInput || !chatContainer) {
        console.error('Chatbot elements not found');
        return;
    }
    chatbotBubbleBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (chatbotWidget.classList.contains('hidden')) {
            chatbotWidget.classList.remove('hidden');
            chatbotWidget.classList.add('show');
            chatbotWidget.classList.remove('hide');
            setTimeout(() => messageInput.focus(), 300);
        }
    });
    if (closeChatWidget) {
        closeChatWidget.addEventListener('click', function(e) {
            e.stopPropagation();
            chatbotWidget.classList.add('hide');       
            setTimeout(() => {
                chatbotWidget.classList.add('hidden');
                chatbotWidget.classList.remove('show', 'hide');
            }, 300);
        });
    }
    document.addEventListener('click', function(e) {
        if (!chatbotWidget.contains(e.target) && 
            !chatbotBubbleBtn.contains(e.target) && 
            !chatbotWidget.classList.contains('hidden')) {     
            chatbotWidget.classList.add('hide');
            setTimeout(() => {
                chatbotWidget.classList.add('hidden');
                chatbotWidget.classList.remove('show', 'hide');
            }, 300);
        }
    });
    const mobileMenu = document.querySelector('[data-navbar-mobile-menu]');
    const avatarDropdown = document.querySelector('[data-navbar-avatar-dropdown]');
    const mobileAvatarModal = document.querySelector('[data-navbar-mobile-avatar-modal]');
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                const target = mutation.target;
                if ((mobileMenu && !mobileMenu.classList.contains('hidden')) ||
                    (avatarDropdown && !avatarDropdown.classList.contains('hidden')) ||
                    (mobileAvatarModal && !mobileAvatarModal.classList.contains('hidden'))) {                    
                    if (!chatbotWidget.classList.contains('hidden')) {
                        chatbotWidget.classList.add('hide');
                        setTimeout(() => {
                            chatbotWidget.classList.add('hidden');
                            chatbotWidget.classList.remove('show', 'hide');
                        }, 300);
                    }
                }
            }
        });
    });
    if (mobileMenu) observer.observe(mobileMenu, { attributes: true });
    if (avatarDropdown) observer.observe(avatarDropdown, { attributes: true });
    if (mobileAvatarModal) observer.observe(mobileAvatarModal, { attributes: true });
    function appendMessage(sender, text) {
        const msgWrapper = document.createElement('div');
        msgWrapper.classList.add('flex', 'items-start', 'space-x-2');
        if (sender === 'user') {
            msgWrapper.classList.add('justify-end');
        }
        const bubble = document.createElement('div');
        bubble.classList.add('rounded-2xl', 'px-4', 'py-3', 'text-sm', 'shadow-sm', 'max-w-[80%]');
        bubble.classList.add(sender === 'user' ? 'bg-[#393E30]' : 'bg-white');
        bubble.classList.add(sender === 'user' ? 'text-white' : 'text-[#393E30]');
        bubble.textContent = text;
        msgWrapper.appendChild(bubble);
        chatContainer.appendChild(msgWrapper);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        if (sender === 'bot' && chatbotWidget.classList.contains('hidden')) {
            const notification = document.getElementById('chatbotNotification');
            if (notification) {
                notification.classList.remove('hidden');
            }
        }
    }
    chatbotBubbleBtn.addEventListener('click', function() {
        const notification = document.getElementById('chatbotNotification');
        if (notification) {
            notification.classList.add('hidden');
        }
    });
    async function verifyAuthBeforeSend() {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) return false;
        try {
            const response = await fetch('https://djahit.andikanugra.my.id/api/users/me', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }
    async function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;
        const isValid = await verifyAuthBeforeSend();
        if (!isValid) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            appendMessage('bot', "Session expired. Redirecting to login...");   
            setTimeout(() => {
                if (chatbotBubble) chatbotBubble.remove();
                window.location.href = '/frontend/page/login.html?error=session_expired';
            }, 2000);
            return;
        }
        appendMessage('user', message);
        messageInput.value = "";
        const payload = { 
            useCase: "chatbot", 
            userMessage: message
        };
        try {
            const response = await fetch("https://3nw62fvjhg.execute-api.us-east-1.amazonaws.com/prod/chatbot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                appendMessage('bot', "Authentication failed. Redirecting to login...");
                setTimeout(() => {
                    if (chatbotBubble) chatbotBubble.remove();
                    window.location.href = '/frontend/page/login.html?error=authentication_failed';
                }, 2000);
                return;
            }
            const data = await response.json();
            appendMessage('bot', data.reply || "Sorry, I couldn't process that.");
        } catch (err) {
            appendMessage('bot', "Error connecting to server.");
            console.error(err);
        }
    }
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}
setInterval(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
        fetch('https://djahit.andikanugra.my.id/api/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (!response.ok) {
                localStorage.clear();
                const chatbotWidget = document.getElementById('chatbotWidget');
                if (chatbotWidget) chatbotWidget.remove();
                setTimeout(() => {
                    window.location.href = '/frontend/page/login.html?error=session_expired';
                }, 2000);
            }
        }).catch(() => {});
    }
}, 5 * 60 * 1000);