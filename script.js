/* ==========================================================
   DRAGON + BACKGROUND RENDERER
   Canvas-drawn Chinese/serpentine dragon that roams the screen
========================================================== */
(function () {

    const canvas = document.getElementById('bg-canvas');
    const ctx    = canvas.getContext('2d');
    let W, H;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    /* ── Dragon spine: chain of segments ── */
    const SEG  = 52;   // number of body segments
    const DIST = 18;   // distance between each segment

    // initialise segments along a horizontal path
    const segs = Array.from({ length: SEG }, (_, i) => ({
        x: W * 0.5 - i * DIST,
        y: H * 0.5,
    }));

    // dragon head movement — Lissajous-style roaming path
    let t = 0;

    // roam across the whole viewport
    const path = {
        // x oscillates across full width
        x: () => W * 0.5 + Math.sin(t * 0.38) * W * 0.42 + Math.sin(t * 0.21) * W * 0.15,
        // y oscillates across full height  
        y: () => H * 0.5 + Math.cos(t * 0.29) * H * 0.37 + Math.cos(t * 0.17) * H * 0.14,
    };

    /* ── Draw one body segment ── */
    function segRadius(i) {
        // head is biggest, tapers to thin tail
        const norm = i / SEG;                   // 0 = head, 1 = tail
        if (norm < 0.08) return 9 + (1-norm/0.08) * 4;   // head swell
        return Math.max(1.5, 13 * Math.pow(1 - norm, 1.6));
    }

    function drawSpine() {
        if (segs.length < 2) return;
        ctx.save();
        ctx.lineCap  = 'round';
        ctx.lineJoin = 'round';

        // glow pass (wide, very faint)
        ctx.shadowBlur  = 28;
        ctx.shadowColor = 'rgba(255,255,255,0.18)';
        ctx.strokeStyle = 'rgba(255,255,255,0.07)';
        ctx.lineWidth   = 26;
        ctx.beginPath();
        ctx.moveTo(segs[0].x, segs[0].y);
        for (let i = 1; i < segs.length; i++) {
            ctx.lineTo(segs[i].x, segs[i].y);
        }
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    function drawBody() {
        // draw segments back-to-front for proper layering
        for (let i = SEG - 1; i >= 0; i--) {
            const s  = segs[i];
            const r  = segRadius(i);
            const norm = i / SEG;

            // next segment for angle
            const nx = segs[Math.min(i + 1, SEG - 1)];
            const angle = Math.atan2(s.y - nx.y, s.x - nx.x);

            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(angle);

            // body circle
            const alpha = 0.55 - norm * 0.35;
            ctx.beginPath();
            ctx.ellipse(0, 0, r, r * 0.75, 0, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(220,220,220,${alpha})`;
            ctx.shadowBlur  = 12;
            ctx.shadowColor = `rgba(255,255,255,${alpha * 0.5})`;
            ctx.fill();

            // scale lines on body (not on head/tail ends)
            if (i > 3 && i < SEG - 4 && r > 4) {
                ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.4})`;
                ctx.lineWidth   = 0.7;
                ctx.shadowBlur  = 0;
                // arc scale
                ctx.beginPath();
                ctx.arc(0, -r * 0.15, r * 0.6, Math.PI * 0.2, Math.PI * 0.8);
                ctx.stroke();
            }

            ctx.restore();
        }
    }

    function drawHead() {
        const h  = segs[0];
        const h1 = segs[1];
        const angle = Math.atan2(h.y - h1.y, h.x - h1.x);

        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(angle);

        // snout
        ctx.beginPath();
        ctx.ellipse(12, 0, 14, 9, 0, 0, Math.PI * 2);
        ctx.fillStyle  = 'rgba(230,230,230,0.75)';
        ctx.shadowBlur  = 20;
        ctx.shadowColor = 'rgba(255,255,255,0.4)';
        ctx.fill();

        // eye
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(14, -4, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fill();
        // eye glow
        ctx.beginPath();
        ctx.arc(15, -4.8, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fill();

        // nostril
        ctx.beginPath();
        ctx.arc(24, 2, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fill();

        // horn
        ctx.beginPath();
        ctx.moveTo(10, -9);
        ctx.lineTo(18, -20);
        ctx.lineTo(14, -8);
        ctx.fillStyle = 'rgba(200,200,200,0.7)';
        ctx.fill();

        // whisker
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(22, -2);
        ctx.quadraticCurveTo(36, -10, 44, -4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(22, 2);
        ctx.quadraticCurveTo(36, 8, 44, 4);
        ctx.stroke();

        ctx.restore();
    }

    function drawFins() {
        // dorsal fins at intervals along the body
        const finPositions = [5, 11, 17, 23, 29];
        finPositions.forEach(i => {
            if (i >= segs.length - 1) return;
            const s     = segs[i];
            const snext = segs[i + 1];
            const angle = Math.atan2(s.y - snext.y, s.x - snext.x) - Math.PI / 2;
            const r     = segRadius(i);
            const norm  = i / SEG;
            const alpha = 0.3 - norm * 0.1;

            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(angle);

            ctx.beginPath();
            ctx.moveTo(-r * 0.3, 0);
            ctx.quadraticCurveTo(0, -r * 2.2, r * 0.3, 0);
            ctx.fillStyle   = `rgba(200,200,200,${alpha})`;
            ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.6})`;
            ctx.lineWidth   = 0.8;
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        });
    }

    function drawBreath() {
        // faint particle trail from mouth
        const h     = segs[0];
        const h1    = segs[1];
        const angle = Math.atan2(h.y - h1.y, h.x - h1.x);
        const mx    = h.x + Math.cos(angle) * 26;
        const my    = h.y + Math.sin(angle) * 26;

        for (let p = 0; p < 3; p++) {
            const spread = (Math.random() - 0.5) * 20;
            const dist   = Math.random() * 40 + 10;
            const px     = mx + Math.cos(angle) * dist + Math.cos(angle + Math.PI / 2) * spread;
            const py     = my + Math.sin(angle) * dist + Math.sin(angle + Math.PI / 2) * spread;
            const pr     = Math.random() * 3 + 1;
            const pa     = Math.random() * 0.08;

            ctx.beginPath();
            ctx.arc(px, py, pr, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${pa})`;
            ctx.fill();
        }
    }

    /* ── Background particles ── */
    const DUST = 40;
    const dust = Array.from({ length: DUST }, () => ({
        x:  Math.random() * 1920,
        y:  Math.random() * 1080,
        r:  Math.random() * 1.4 + 0.3,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        a:  Math.random() * 0.3 + 0.05,
    }));

    function drawDust() {
        dust.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = W;
            if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H;
            if (p.y > H) p.y = 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${p.a})`;
            ctx.fill();
        });
    }

    /* ── Update dragon position ── */
    function update() {
        t += 0.008;
        segs[0].x = path.x();
        segs[0].y = path.y();

        // chain follow
        for (let i = 1; i < SEG; i++) {
            const dx = segs[i].x - segs[i - 1].x;
            const dy = segs[i].y - segs[i - 1].y;
            const d  = Math.sqrt(dx * dx + dy * dy) || 1;
            segs[i].x = segs[i - 1].x + (dx / d) * DIST;
            segs[i].y = segs[i - 1].y + (dy / d) * DIST;
        }
    }

    /* ── Render loop ── */
    function render() {
        ctx.clearRect(0, 0, W, H);
        drawDust();
        drawSpine();
        drawFins();
        drawBody();
        drawHead();
        drawBreath();
        update();
        requestAnimationFrame(render);
    }

    render();

})();

/* ==========================================================
   RIPPLE EFFECT ON LINKS
========================================================== */
(function () {
    const style = document.createElement('style');
    style.textContent = `@keyframes _rpl{to{transform:scale(5);opacity:0;}}`;
    document.head.appendChild(style);

    document.querySelectorAll('.link-row').forEach(btn => {
        btn.addEventListener('click', e => {
            const r    = btn.getBoundingClientRect();
            const size = Math.max(r.width, r.height);
            const el   = document.createElement('span');
            el.style.cssText = `
                position:absolute;
                width:${size}px;height:${size}px;
                left:${e.clientX - r.left - size / 2}px;
                top:${e.clientY - r.top  - size / 2}px;
                border-radius:50%;
                background:rgba(255,255,255,0.1);
                transform:scale(0);
                animation:_rpl .55s ease-out forwards;
                pointer-events:none;z-index:99;
            `;
            btn.appendChild(el);
            setTimeout(() => el.remove(), 600);
        });
    });
})();

/* ==========================================================
   GLASS CARD GLOSS — follows mouse
========================================================== */
(function () {
    const gloss = document.querySelector('.card-gloss');
    const card  = document.querySelector('.card');
    if (!gloss || !card) return;
    document.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const xp = ((e.clientX - r.left) / r.width) * 100;
        gloss.style.background =
            `linear-gradient(90deg,transparent,rgba(255,255,255,${0.1 + xp * 0.002}),transparent)`;
    });
})();

/* ==========================================================
   FOCUS ACCESSIBILITY
========================================================== */
document.querySelectorAll('a').forEach(a => {
    a.addEventListener('focus',  function () { this.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.35)'; });
    a.addEventListener('blur',   function () { this.style.boxShadow = ''; });
});
