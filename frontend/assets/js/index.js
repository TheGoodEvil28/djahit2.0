
        document.addEventListener('DOMContentLoaded', function() {
        function getAuthToken() {
        return localStorage.getItem('authToken');
    }
    
    const isAuthenticated = getAuthToken() !== null;
    const navbarPath = isAuthenticated ? 'frontend/page/navbar.html' : 'frontend/page/guestnavbar.html';
    
    $('#navbar-container').load(navbarPath);
        $('#footer-container').load('frontend/page/footer.html');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', function() {
                mobileMenu.classList.toggle('hidden');
            });            
            document.addEventListener('click', function(event) {
                if (!mobileMenuBtn.contains(event.target) && !mobileMenu.contains(event.target)) {
                    mobileMenu.classList.add('hidden');
                }
            });
        }
        setTimeout(function() {
            initializeButtonEffects();
            initializeMissionCardEffects();
        }, 100);        
        const faqToggles = document.querySelectorAll('.faq-toggle');
        faqToggles.forEach(toggle => {
                toggle.addEventListener('click', function() {
                    const faqContent = this.parentElement.querySelector('.faq-content');
                    const arrow = this.querySelector('.faq-arrow');
                    if (faqContent.style.maxHeight === '0px' || !faqContent.style.maxHeight) {
                        faqContent.style.maxHeight = faqContent.scrollHeight + 'px';
                        if (arrow) {
                            arrow.style.transform = 'rotate(-90deg)';
                        }
                    } else {
                        faqContent.style.maxHeight = '0px';
                        if (arrow) {
                            arrow.style.transform = 'rotate(0deg)';
                        }
                    }
                });
            });            
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
                    let scrollTimeout;
                    window.addEventListener('scroll', () => {
                        clearTimeout(scrollTimeout);
                        scrollTimeout = setTimeout(() => {
                            mustontop.style.zIndex = '9999';
                        }, 10);
                    });
                }
            }
    });
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
    function initializeMissionCardEffects() {
        const missionCard1 = document.getElementById('missionCard1');
        const missionCard1Img = document.getElementById('missionCard1Img');
        const missionCard1p = document.getElementById('missionCard1p');
        const missionCard2 = document.getElementById('missionCard2');
        const missionCard2Img = document.getElementById('missionCard2Img');
        const missionCard2p = document.getElementById('missionCard2p');
        const missionCard3 = document.getElementById('missionCard3');
        const missionCard3Img = document.getElementById('missionCard3Img');
        const missionCard3p = document.getElementById('missionCard3p');        
        if (missionCard1) {
            missionCard1.addEventListener('mouseenter', () => {
                missionCard1.style.backgroundColor = '#7A8568';
                missionCard1.style.borderStyle = 'solid';
                missionCard1.style.borderColor = '#A85C47';
                missionCard1.style.borderWidth = '1px';
                if (missionCard1p) missionCard1p.style.color = '#F6F7F3';
                if (missionCard1Img) missionCard1Img.src = "frontend/assets/img/thrift-shop 1 white.png";
            });
            missionCard1.addEventListener('mouseleave', () => {
                missionCard1.style.backgroundColor = '#E9E4D4';
                if (missionCard1p) missionCard1p.style.color = '#393E30';
                if (missionCard1Img) missionCard1Img.src = "frontend/assets/img/thrift-shop 1.png";
            });
        }        
        if (missionCard2) {
            missionCard2.addEventListener('mouseenter', () => {
                missionCard2.style.backgroundColor = '#7A8568';
                missionCard2.style.borderStyle = 'solid';
                missionCard2.style.borderColor = '#A85C47';
                missionCard2.style.borderWidth = '1px';
                if (missionCard2p) missionCard2p.style.color = '#F6F7F3';
                if (missionCard2Img) missionCard2Img.src = "frontend/assets/img/sewing-machine white.png";
            });
            missionCard2.addEventListener('mouseleave', () => {
                missionCard2.style.backgroundColor = '#E9E4D4';
                if (missionCard2p) missionCard2p.style.color = '#393E30';
                if (missionCard2Img) missionCard2Img.src = "frontend/assets/img/sewing-machine 1.png";
            });
        }        
        if (missionCard3) {
            missionCard3.addEventListener('mouseenter', () => {
                missionCard3.style.backgroundColor = '#7A8568';
                missionCard3.style.borderStyle = 'solid';
                missionCard3.style.borderColor = '#A85C47';
                missionCard3.style.borderWidth = '1px';
                if (missionCard3p) missionCard3p.style.color = '#F6F7F3';
                if (missionCard3Img) missionCard3Img.src = "frontend/assets/img/garbage-bag white.png";
            });
            missionCard3.addEventListener('mouseleave', () => {
                missionCard3.style.backgroundColor = '#E9E4D4';
                if (missionCard3p) missionCard3p.style.color = '#393E30';
                if (missionCard3Img) missionCard3Img.src = "frontend/assets/img/garbage-bag 1.png";
            });
        }
    };
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('nav');
            if (navbar && window.scrollY > 100) {
                navbar.classList.add('shadow-lg');
            } else if (navbar) {
                navbar.classList.remove('shadow-lg');
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
                transition: all 0.9s ease-in-out;
            }
            
            .hover\\:scale-105:hover {
                transform: scale(1.05);
            }
            
            .transition-transform {
                transition: transform 0.3s ease-in-out;
            }

            /* Force mustontop to stay on top - only on desktop */
            @media (min-width: 1024px) {
                #mustontop {
                    position: fixed !important;
                    z-index: 9999 !important;
                    pointer-events: none !important;
                }
            }
            
            /* Mobile optimizations */
            @media (max-width: 768px) {
                .faq-toggle h3 {
                    font-size: 18px !important;
                    line-height: 1.4 !important;
                }
                
                .grid-cols-2.grid-rows-3 {
                    gap: 12px !important;
                }
                
                /* Ensure mission cards stack properly on mobile */
                @media (max-width: 640px) {
                    .md\\:col-span-2 {
                        grid-column: span 1 !important;
                    }
                }
            }
            
            /* Tablet optimizations */
            @media (min-width: 768px) and (max-width: 1023px) {
                .hero-image {
                    max-width: 450px;
                }
            }
        `;
        document.head.appendChild(style);



// Chat toggle
document.addEventListener('DOMContentLoaded', () => {
    const chatHeader = document.getElementById('chatHeader');
    const chatToggleIcon = document.getElementById('chatToggleIcon');
    const chatContainer = document.getElementById('chatContainer');
    const sendBtn = document.getElementById('sendBtn');
    const messageInput = document.getElementById('userMessage');
    const chatDiv = document.getElementById('chat');

    // Toggle chat visibility
    chatHeader.addEventListener('click', () => {
        if (chatContainer.style.display === 'none' || chatContainer.style.display === '') {
            chatContainer.style.display = 'block';
            chatToggleIcon.textContent = '−';
        } else {
            chatContainer.style.display = 'none';
            chatToggleIcon.textContent = '+';
        }
    });

    // Send message function
    async function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        chatDiv.innerHTML += `<p class="mb-2"><strong>You:</strong> ${message}</p>`;
        messageInput.value = "";
        chatDiv.scrollTop = chatDiv.scrollHeight;

        const payload = { useCase: "chatbot", userMessage: message };
        try {
            const response = await fetch("https://3nw62fvjhg.execute-api.us-east-1.amazonaws.com/prod/chatbot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            chatDiv.innerHTML += `<p class="mb-2"><strong>Bot:</strong> ${data.reply}</p>`;
            chatDiv.scrollTop = chatDiv.scrollHeight;
        } catch (err) {
            chatDiv.innerHTML += `<p class="mb-2"><strong>Bot:</strong> Error connecting to Lambda.</p>`;
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

    // Optional: start hidden
    chatContainer.style.display = 'none';
});



