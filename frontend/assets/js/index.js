document.addEventListener('DOMContentLoaded', function () {
    // ---------- Auth ----------
    function getAuthToken() {
        return localStorage.getItem('authToken');
    }
    const isAuthenticated = getAuthToken() !== null;

    // ---------- Navbar & Footer ----------
    const navbarPath = isAuthenticated ? 'frontend/page/navbar.html' : 'frontend/page/guestnavbar.html';
    $('#navbar-container').load(navbarPath);
    $('#footer-container').load('frontend/page/footer.html');

    // ---------- Mobile Menu ----------
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
        document.addEventListener('click', (event) => {
            if (!mobileMenuBtn.contains(event.target) && !mobileMenu.contains(event.target)) {
                mobileMenu.classList.add('hidden');
            }
        });
    }

    // ---------- Button Effects ----------
    function initializeButtonEffects() {
        const registerBtn = document.getElementById('registerBtn');
        const loginBtn = document.getElementById('loginBtn');
        if (!registerBtn || !loginBtn) return;

        registerBtn.addEventListener('mouseenter', () => { registerBtn.style.backgroundColor = '#7A8568'; registerBtn.style.color = 'white'; });
        registerBtn.addEventListener('mouseleave', () => { registerBtn.style.backgroundColor = 'transparent'; registerBtn.style.color = '#7A8568'; });
        loginBtn.addEventListener('mouseenter', () => { loginBtn.style.backgroundColor = 'transparent'; loginBtn.style.color = '#7A8568'; loginBtn.style.borderColor = '#7A8568'; });
        loginBtn.addEventListener('mouseleave', () => { loginBtn.style.backgroundColor = '#7A8568'; loginBtn.style.color = 'white'; loginBtn.style.borderColor = '#7A8568'; });
    }

    // ---------- Mission Cards ----------
    function initializeMissionCardEffects() {
        const cards = [
            { id: 'missionCard1', img: 'missionCard1Img', p: 'missionCard1p', src: ["frontend/assets/img/thrift-shop 1.png", "frontend/assets/img/thrift-shop 1 white.png"] },
            { id: 'missionCard2', img: 'missionCard2Img', p: 'missionCard2p', src: ["frontend/assets/img/sewing-machine 1.png", "frontend/assets/img/sewing-machine white.png"] },
            { id: 'missionCard3', img: 'missionCard3Img', p: 'missionCard3p', src: ["frontend/assets/img/garbage-bag 1.png", "frontend/assets/img/garbage-bag white.png"] }
        ];

        cards.forEach(card => {
            const el = document.getElementById(card.id);
            const img = document.getElementById(card.img);
            const p = document.getElementById(card.p);
            if (!el) return;

            el.addEventListener('mouseenter', () => {
                el.style.backgroundColor = '#7A8568';
                el.style.borderStyle = 'solid';
                el.style.borderColor = '#A85C47';
                el.style.borderWidth = '1px';
                if (p) p.style.color = '#F6F7F3';
                if (img) img.src = card.src[1];
            });

            el.addEventListener('mouseleave', () => {
                el.style.backgroundColor = '#E9E4D4';
                if (p) p.style.color = '#393E30';
                if (img) img.src = card.src[0];
            });
        });
    }

    // ---------- FAQ Toggle ----------
    document.querySelectorAll('.faq-toggle').forEach(toggle => {
        toggle.addEventListener('click', function () {
            const faqContent = this.parentElement.querySelector('.faq-content');
            const arrow = this.querySelector('.faq-arrow');
            if (!faqContent) return;
            if (!faqContent.style.maxHeight || faqContent.style.maxHeight === '0px') {
                faqContent.style.maxHeight = faqContent.scrollHeight + 'px';
                if (arrow) arrow.style.transform = 'rotate(-90deg)';
            } else {
                faqContent.style.maxHeight = '0px';
                if (arrow) arrow.style.transform = 'rotate(0deg)';
            }
        });
    });

    // ---------- Smooth Scroll ----------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // ---------- Navbar Shadow on Scroll ----------
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('nav');
        if (!navbar) return;
        if (window.scrollY > 100) navbar.classList.add('shadow-lg');
        else navbar.classList.remove('shadow-lg');
    });

    // ---------- MustOnTop ----------
    if (window.innerWidth >= 1024) {
        const mustontop = document.getElementById('mustontop');
        if (mustontop) {
            mustontop.style.cssText = 'position: fixed !important; left: 2px !important; bottom: -170px !important; z-index: 9999 !important; pointer-events: none !important;';
            let scrollTimeout;
            window.addEventListener('scroll', () => {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => { mustontop.style.zIndex = '9999'; }, 10);
            });
        }
    }

    // ---------- Intersection Observer ----------
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('animate-fade-in'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('section').forEach(section => observer.observe(section));

    // ---------- Dynamic Styles ----------
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
        .faq-content { transition: all 0.9s ease-in-out; }
        .hover\\:scale-105:hover { transform: scale(1.05); }
        .transition-transform { transition: transform 0.3s ease-in-out; }
        @media (min-width: 1024px) { #mustontop { position: fixed !important; z-index: 9999 !important; pointer-events: none !important; } }
        @media (max-width: 768px) { .faq-toggle h3 { font-size: 18px !important; line-height: 1.4 !important; } .grid-cols-2.grid-rows-3 { gap: 12px !important; } @media (max-width: 640px) { .md\\:col-span-2 { grid-column: span 1 !important; } } }
        @media (min-width: 768px) and (max-width: 1023px) { .hero-image { max-width: 450px; } }
    `;
    document.head.appendChild(style);

    // ---------- Initialize UI Effects ----------
    setTimeout(() => { initializeButtonEffects(); initializeMissionCardEffects(); }, 100);

    // ---------- Chat Widget ----------
    const chatWidget = document.getElementById('chatbotWidget');
    const chatHeader = document.getElementById('chatHeader');
    const chatToggleIcon = document.getElementById('chatToggleIcon');
    const chatContainer = document.getElementById('chatContainer');
    const sendBtn = document.getElementById('sendBtn');
    const messageInput = document.getElementById('userMessage');

    // Show chatbot always (for testing or guest users)
if (chatWidget) chatWidget.classList.remove('hidden');

    chatHeader?.addEventListener('click', () => {
        chatContainer.classList.toggle('hidden');
        chatToggleIcon.textContent = chatContainer.classList.contains('hidden') ? '+' : '−';
    });

    function appendMessage(sender, text) {
        const msgWrapper = document.createElement('div');
        msgWrapper.classList.add('flex', 'items-start', 'space-x-2');
        if (sender === 'user') msgWrapper.classList.add('justify-end');

        const bubble = document.createElement('div');
        bubble.classList.add('rounded-2xl', 'px-4', 'py-3', 'text-sm', 'shadow-sm', 'max-w-[80%]');
        bubble.classList.add(sender === 'user' ? 'bg-[#393E30] text-white' : 'bg-white text-[#393E30]');
        bubble.textContent = text;

        msgWrapper.appendChild(bubble);
        chatContainer.appendChild(msgWrapper);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    async function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        const token = getAuthToken();
        if (!token) {
            appendMessage('bot', "⚠️ Kamu harus register/login dulu untuk pakai chatbot.");
            messageInput.value = "";
            return;
        }

        appendMessage('user', message);
        messageInput.value = "";

        try {
            const response = await fetch("https://3nw62fvjhg.execute-api.us-east-1.amazonaws.com/prod/chatbot", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ useCase: "chatbot", userMessage: message })
            });

            if (!response.ok) {
                appendMessage('bot', response.status === 401 ? "❌ Token invalid atau expired. Silakan login ulang." : "⚠️ Server error.");
                return;
            }

            const data = await response.json();
            appendMessage('bot', data.reply);

        } catch (err) {
            appendMessage('bot', "Error connecting to Lambda.");
            console.error(err);
        }
    }

    sendBtn?.addEventListener('click', sendMessage);
    messageInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
});
