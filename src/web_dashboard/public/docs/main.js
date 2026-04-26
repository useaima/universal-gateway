document.addEventListener('DOMContentLoaded', () => {
    // 1. OS Switching Logic
    const osBtns = document.querySelectorAll('.os-btn');
    const codeTabs = document.querySelectorAll('.code-tab');

    function switchOS(selectedOS) {
        // Update Buttons
        osBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.os === selectedOS);
        });

        // Update Code Blocks
        codeTabs.forEach(tab => {
            if (tab.classList.contains(selectedOS)) {
                tab.classList.add('visible');
            } else if (tab.classList.contains('windows') || tab.classList.contains('mac') || tab.classList.contains('linux')) {
                // Only hide OS-specific tabs
                tab.classList.remove('visible');
            }
        });
    }

    osBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchOS(btn.dataset.os);
        });
    });

    // 2. Automatic OS Detection
    function detectOS() {
        const platform = navigator.platform.toLowerCase();
        if (platform.includes('win')) return 'windows';
        if (platform.includes('mac')) return 'mac';
        if (platform.includes('linux')) return 'linux';
        return 'windows'; // Default
    }

    switchOS(detectOS());

    // 3. Copy to Clipboard
    const copyBtns = document.querySelectorAll('.copy-btn');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const pre = btn.closest('.code-container').querySelector('code');
            const textToCopy = pre.innerText;

            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = btn.innerText;
                btn.innerText = 'Copied!';
                btn.style.color = '#7ee787';
                
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.color = '#8b949e';
                }, 2000);
            });
        });
    });

    // 4. Smooth Anchor Scrolling
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetContent = document.querySelector(targetId);
            if (!targetContent) return;
            
            // Update active link
            document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
            this.classList.add('active');

            window.scrollTo({
                top: targetContent.offsetTop - 100,
                behavior: 'smooth'
            });
        });
    });

    // 5. Scroll Spy for Sidebar
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('.doc-section');
        const navLinks = document.querySelectorAll('nav a[href^="#"]');

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });
});
