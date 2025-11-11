// ==================== Supabase Configuration ====================
const supabaseUrl = 'https://qcfifybkaddcoimjroca.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZmlmeWJrYWRkY29pbWpyb2NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NzU0MDUsImV4cCI6MjA3NTA1MTQwNX0.glGwHxds0PzVLF1Y8VBGX0jYz3zrLsgE9KAWWwkYms8';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// ==================== Supabase Connection Test ====================
async function testSupabaseConnection() {
    try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabaseClient
            .from('zat_faq')
            .select('count', { count: 'exact', head: true });

        if (error) {
            console.error('❌ Supabase connection FAILED:', error.message);
            return false;
        }

        console.log('✅ Supabase connection successful!');
        console.log(`Found ${data || 0} FAQs in database`);
        return true;
    } catch (error) {
        console.error('❌ Supabase connection error:', error);
        return false;
    }
}

// ==================== FAQ Loading Functions ====================
async function loadFAQs() {
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');

    // Show loading state
    loadingState.style.display = 'flex';
    errorState.style.display = 'none';

    try {
        // Fetch FAQs from Supabase with sub-category
        const { data, error } = await supabaseClient
            .from('zat_faq')
            .select('Question, Answer, Category, sub-category')
            .order('Category', { ascending: true })
            .order('sub-category', { ascending: true });

        if (error) throw error;

        // Map tab names to database Category values
        const categoryMapping = {
            'general': 'General',
            'travelers': 'Guest',
            'hosts': 'Host'
        };

        // Group FAQs by category and then by sub-category
        const faqsByCategory = {
            general: [],
            travelers: [],
            hosts: []
        };

        data.forEach(faq => {
            // Find which tab this FAQ belongs to
            for (const [tabName, dbCategory] of Object.entries(categoryMapping)) {
                if (faq.Category === dbCategory) {
                    faqsByCategory[tabName].push(faq);
                    break;
                }
            }
        });

        // Render FAQs for each category (now grouped by sub-category)
        renderFAQs('general', faqsByCategory.general);
        renderFAQs('travelers', faqsByCategory.travelers);
        renderFAQs('hosts', faqsByCategory.hosts);

        // Hide loading state
        loadingState.style.display = 'none';

        // Re-initialize accordion functionality
        initializeAccordion();

    } catch (error) {
        console.error('Error loading FAQs:', error);
        console.error('Error details:', error.message, error.details, error.hint);
        loadingState.style.display = 'none';
        errorState.style.display = 'flex';
    }
}

function renderFAQs(category, faqs) {
    const container = document.getElementById(category);

    if (!container || faqs.length === 0) return;

    // Group FAQs by sub-category
    const faqsBySubCategory = {};

    faqs.forEach(faq => {
        const subCat = faq['sub-category'] || 'General';
        if (!faqsBySubCategory[subCat]) {
            faqsBySubCategory[subCat] = [];
        }
        faqsBySubCategory[subCat].push(faq);
    });

    // Build HTML with sections for each sub-category
    let html = '';

    for (const [subCategory, subCategoryFaqs] of Object.entries(faqsBySubCategory)) {
        html += `
            <section class="faq-section">
                <h2 class="section-title">${subCategory}</h2>
        `;

        subCategoryFaqs.forEach(faq => {
            html += `
                <div class="accordion-item">
                    <div class="accordion-header" tabindex="0" role="button" aria-expanded="false">
                        <h3>${faq.Question}</h3>
                        <span class="accordion-icon"></span>
                    </div>
                    <div class="accordion-content">
                        <p>${faq.Answer}</p>
                    </div>
                </div>
            `;
        });

        html += `</section>`;
    }

    container.innerHTML = html;
}

function initializeAccordion() {
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach((item, index) => {
        const header = item.querySelector('.accordion-header');

        // Remove any existing listeners
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);

        newHeader.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            accordionItems.forEach(i => i.classList.remove('active'));
            if (!isActive) {
                item.classList.add('active');
            }
        });

        newHeader.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
                this.setAttribute('aria-expanded',
                    item.classList.contains('active') ? 'true' : 'false'
                );
            }
        });

        // Animation on scroll
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = `all 0.5s ease ${index * 0.05}s`;

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        observer.observe(item);
    });
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const hamburger = document.querySelector('.hamburger-menu');
    const navCenter = document.querySelector('.nav-center');
    const navRight = document.querySelector('.nav-right');

    hamburger.classList.toggle('active');
    navCenter.classList.toggle('mobile-active');
    navRight.classList.toggle('mobile-active');
}

// Open Auth Modal (redirects to app.split.lease)
function openAuthModal() {
    window.location.href = 'https://app.split.lease/signup-login';
}

// Handle Import Listing
function handleImportListing() {
    const url = document.getElementById('importUrl').value;
    const email = document.getElementById('importEmail').value;

    if (!url || !email) {
        alert('Please fill in both URL and email address.');
        return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        alert('Please enter a valid URL starting with http:// or https://');
        return;
    }

    if (!email.includes('@') || !email.includes('.')) {
        alert('Please enter a valid email address.');
        return;
    }

    // Show loading state
    const btn = document.querySelector('.import-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Importing...';
    btn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;

        alert('Your listing import request has been submitted! We will process it shortly.');

        // Clear inputs
        document.getElementById('importUrl').value = '';
        document.getElementById('importEmail').value = '';
    }, 2000);
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async function() {

    // ==================== Test Supabase Connection ====================
    await testSupabaseConnection();

    // ==================== Load FAQs from Supabase ====================
    loadFAQs();

    // ==================== Tab Switching Functionality ====================
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');

            // Hide all tab contents
            tabContents.forEach(content => content.classList.remove('active'));

            // Show corresponding tab content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');

            // Scroll to FAQ container smoothly
            document.querySelector('.faq-container').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });

    // ==================== Market Research Widget ====================
    const marketWidget = document.getElementById('marketWidget');
    const closeWidget = document.querySelector('.close-widget');
    const nextBtn = document.querySelector('.next-btn');

    if (marketWidget && closeWidget && nextBtn) {
        const widgetTextarea = marketWidget.querySelector('textarea');

        // Close widget functionality
        closeWidget.addEventListener('click', function() {
            marketWidget.style.display = 'none';
        });

        if (widgetTextarea) {
            // Enable/disable Next button based on textarea input
            widgetTextarea.addEventListener('input', function() {
                if (this.value.trim().length > 0) {
                    nextBtn.style.background = '#5B4AD6';
                    nextBtn.style.cursor = 'pointer';
                    nextBtn.disabled = false;
                } else {
                    nextBtn.style.background = '#d0d0d0';
                    nextBtn.style.cursor = 'not-allowed';
                    nextBtn.disabled = true;
                }
            });
        }

        // Initialize button state
        nextBtn.style.background = '#d0d0d0';
        nextBtn.style.cursor = 'not-allowed';
        nextBtn.disabled = true;

        // Next button click handler
        nextBtn.addEventListener('click', function() {
            if (!this.disabled && widgetTextarea) {
                alert('Thank you for your interest! We will send you the market research report shortly.');
                widgetTextarea.value = '';
                nextBtn.style.background = '#d0d0d0';
                nextBtn.disabled = true;
            }
        });
    }

    // ==================== Floating Chat Button ====================
    const floatingChatBtn = document.querySelector('.floating-chat-btn');

    if (floatingChatBtn) {
        floatingChatBtn.addEventListener('click', function() {
            alert('Chat feature coming soon! Contact us at support@splitlease.com');
        });
    }

    // ==================== AI Chat Widget ====================
    const aiInput = document.querySelector('.ai-input');
    const voiceBtn = document.querySelector('.voice-btn');
    const exploreBtn = document.querySelector('.explore-btn');
    const chatTooltip = document.querySelector('.chat-tooltip');

    // AI input handler
    if (aiInput) {
        aiInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.value.trim().length > 0) {
                handleAIQuery(this.value);
                this.value = '';
            }
        });
    }

    // Voice button handler
    if (voiceBtn) {
        voiceBtn.addEventListener('click', function() {
            alert('Voice input feature coming soon!');
        });
    }

    // Explore button handler
    if (exploreBtn) {
        exploreBtn.addEventListener('click', function() {
            // Scroll to top and switch to general tab
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (tabs.length > 0) {
                tabs[0].click();
            }
        });
    }

    // Simple AI query handler
    function handleAIQuery(query) {
        const lowerQuery = query.toLowerCase();

        // Simple keyword matching
        if (lowerQuery.includes('price') || lowerQuery.includes('cost')) {
            alert('Pricing varies by location and amenities. You can filter by price range when searching for properties. Most rentals range from $50-150 per night.');
        } else if (lowerQuery.includes('book') || lowerQuery.includes('reservation')) {
            alert('To book: 1) Search for available spaces, 2) Select your dates, 3) Review the listing, 4) Complete payment. It\'s that simple!');
        } else if (lowerQuery.includes('cancel')) {
            alert('Cancellation policies vary by host. Check the specific policy before booking. Most offer flexible cancellation up to 24-48 hours before check-in.');
        } else if (lowerQuery.includes('host')) {
            alert('To become a host, click "Host with Us" in the menu and complete the listing process. It takes about 15-20 minutes.');
        } else {
            alert('I found several FAQ articles that might help. Check out the FAQ sections above or contact support@splitlease.com for more help.');
        }
    }

    // Hide tooltip after 10 seconds
    setTimeout(function() {
        if (chatTooltip) {
            chatTooltip.style.opacity = '0';
            chatTooltip.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                chatTooltip.style.display = 'none';
            }, 500);
        }
    }, 10000);

    // ==================== Smooth Scroll for Links ====================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==================== Footer Form Handlers ====================
    const shareBtn = document.querySelector('.share-btn');
    const submitBtn = document.querySelector('.submit-btn');

    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            const emailInput = this.previousElementSibling;
            const email = emailInput.value;
            const shareMethodRadio = document.querySelector('input[name="share-method"]:checked');
            const shareMethod = shareMethodRadio ? shareMethodRadio.value : 'email';

            if (email.trim() && validateEmail(email)) {
                alert(`Referral invitation will be sent via ${shareMethod} to ${email}`);
                emailInput.value = '';
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            const inputs = this.parentElement.querySelectorAll('.footer-input');
            const url = inputs[0].value;
            const email = inputs[1].value;

            if (url.trim() && email.trim() && validateEmail(email)) {
                alert('Your listing import request has been submitted! We will process it shortly.');
                inputs[0].value = '';
                inputs[1].value = '';
            } else {
                alert('Please fill in both URL and email address correctly.');
            }
        });
    }

    // Email validation helper
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // ==================== Scroll Effects ====================
    let lastScroll = 0;
    const header = document.querySelector('.main-header');

    if (header) {
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;

            // Add shadow to header on scroll
            if (currentScroll > 10) {
                header.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.15)';
            } else {
                header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            }

            lastScroll = currentScroll;
        });
    }

    // ==================== Hover Effects for Buttons ====================
    const allButtons = document.querySelectorAll('button, .btn-primary');

    allButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            if (!this.disabled) {
                this.style.transition = 'all 0.2s ease';
            }
        });
    });

    // ==================== Keyboard Accessibility ====================
    // Allow Enter/Space to trigger tabs
    tabs.forEach(tab => {
        tab.setAttribute('role', 'tab');
        tab.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    // ==================== Initialize ====================
    console.log('Split Lease FAQ Page Loaded Successfully!');

});
