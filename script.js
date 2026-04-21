/* ==========================================================
   CHINESE DRAGON RENDERER
   True East Asian serpentine dragon with claws, mane, scales,
   long whiskers — white/pearl tones to match the dark glass UI
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

    const SEG  = 80;
    const DIST = 16;

    const segs = Array.from({ length: SEG }, (_, i) => ({
        x: W * 0.5 - i * DIST,
        y: H * 0.5,
    }));

    let t = 0;
    const path = {
        x: () => W * 0.5 + Math.sin(t * 0.31) * W * 0.40 + Math.sin(t * 0.19) * W * 0.12,
        y: () => H * 0.5 + Math.cos(t * 0.23) * H * 0.36 + Math.cos(t * 0.14) * H * 0.11,
    };

    function segRadius(i) {
        const norm = i / SEG;
        if (norm < 0.05) return 11 + (1 - norm / 0.05) * 5;
        if (norm > 0.85) return Math.max(1.2, 8 * (1 - (norm - 0.85) / 0.15));
        return Math.max(3, 10 * Math.pow(1 - norm * 0.6, 0.9));
    }

    function segAngle(i) {
        const a = segs[Math.max(0, i - 1)];
        const b = segs[Math.min(SEG - 1, i + 1)];
        return Math.atan2(a.y - b.y, a.x - b.x);
    }

    function drawBody() {
        for (let i = SEG - 1; i >= 1; i--) {
            const s    = segs[i];
            const r    = segRadius(i);
            const norm = i / SEG;
            const angle = segAngle(i);
            const alpha = 0.50 - norm * 0.28;

            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(angle);

            ctx.beginPath();
            ctx.ellipse(0, 0, r, r * 0.68, 0, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(235,235,230,${alpha})`;
            ctx.shadowBlur  = 14;
            ctx.shadowColor = `rgba(255,255,255,${alpha * 0.45})`;
            ctx.fill();

            ctx.beginPath();
            ctx.ellipse(0, r * 0.15, r * 0.55, r * 0.28, 0, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${alpha * 0.35})`;
            ctx.shadowBlur = 0;
            ctx.fill();

            if (i > 5 && i < SEG - 8 && r > 4.5) {
                ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.35})`;
                ctx.lineWidth   = 0.65;
                ctx.beginPath();
                ctx.arc(0, -r * 0.12, r * 0.58, Math.PI * 0.18, Math.PI * 0.82);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(0, r * 0.1, r * 0.45, -Math.PI * 0.7, -Math.PI * 0.3);
                ctx.stroke();
            }

            ctx.restore();
        }
    }

    function drawMane() {
        for (let i = 4; i < SEG - 10; i += 2) {
            const s     = segs[i];
            const norm  = i / SEG;
            const r     = segRadius(i);
            const angle = segAngle(i);
            const alpha = (0.30 - norm * 0.18) * (r > 4 ? 1 : r / 4);
            if (alpha <= 0.01) continue;

            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(angle - Math.PI / 2);

            const h = (i % 4 === 0) ? r * 2.4 : r * 1.4;
            const w = r * 0.35;

            ctx.beginPath();
            ctx.moveTo(-w, 0);
            ctx.quadraticCurveTo(0 + Math.sin(t * 2 + i) * 2, -h, w, 0);
            ctx.fillStyle   = `rgba(220,218,210,${alpha})`;
            ctx.shadowBlur  = 8;
            ctx.shadowColor = `rgba(255,255,255,${alpha * 0.5})`;
            ctx.fill();

            ctx.restore();
        }
    }

    function drawClaws() {
        const clawSegs = [12, 22, 34, 46];
        clawSegs.forEach((ci, idx) => {
            if (ci >= segs.length - 1) return;
            const s     = segs[ci];
            const r     = segRadius(ci);
            const norm  = ci / SEG;
            const angle = segAngle(ci);
            const alpha = 0.45 - norm * 0.1;
            const side  = idx % 2 === 0 ? 1 : -1;

            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(angle);

            ctx.save();
            ctx.translate(side * r, 0);
            ctx.rotate(side * 0.4);

            const armLen = r * 2.8;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, armLen * 0.6);
            ctx.lineTo(armLen * 0.4 * side, armLen);
            ctx.strokeStyle = `rgba(235,232,225,${alpha})`;
            ctx.lineWidth   = r * 0.35;
            ctx.lineCap     = 'round';
            ctx.lineJoin    = 'round';
            ctx.shadowBlur  = 10;
            ctx.shadowColor = `rgba(255,255,255,${alpha * 0.4})`;
            ctx.stroke();

            const clawTipX = armLen * 0.4 * side;
            const clawTipY = armLen;
            [-0.5, -0.2, 0.15, 0.45].forEach(ca => {
                ctx.beginPath();
                ctx.moveTo(clawTipX, clawTipY);
                ctx.lineTo(clawTipX + Math.sin(ca) * r * 1.6, clawTipY + Math.cos(ca) * r * 1.6);
                ctx.strokeStyle = `rgba(245,243,238,${alpha * 0.85})`;
                ctx.lineWidth   = 0.9;
                ctx.shadowBlur  = 0;
                ctx.stroke();
            });

            ctx.restore();
            ctx.restore();
        });
    }

    function drawHead() {
        const h  = segs[0];
        const h1 = segs[2];
        const angle = Math.atan2(h.y - h1.y, h.x - h1.x);

        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(-8, -9);
        ctx.bezierCurveTo(-4, -13, 16, -12, 22, -6);
        ctx.bezierCurveTo(28, -2, 26, 7, 20, 9);
        ctx.bezierCurveTo(12, 13, -4, 10, -8, 4);
        ctx.closePath();
        ctx.fillStyle  = 'rgba(238,235,228,0.82)';
        ctx.shadowBlur  = 22;
        ctx.shadowColor = 'rgba(255,255,255,0.45)';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-5, 2);
        ctx.bezierCurveTo(4, 14, 18, 14, 20, 9);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth   = 1;
        ctx.shadowBlur  = 0;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.bezierCurveTo(8, -10, 18, -9, 22, -5);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth   = 0.8;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(9, -4, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(10,8,5,0.9)';
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(9, -4, 1.2, 3.2, 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,1)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(10.5, -5.5, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(21, 1, 2, 1.2, -0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(6, -9);
        ctx.bezierCurveTo(8, -22, 16, -26, 14, -9);
        ctx.fillStyle = 'rgba(210,208,200,0.75)';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255,255,255,0.3)';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-2, -7);
        ctx.bezierCurveTo(-1, -17, 5, -19, 5, -7);
        ctx.fillStyle = 'rgba(200,198,192,0.55)';
        ctx.fill();

        ctx.shadowBlur = 0;
        for (let m = 0; m < 5; m++) {
            const mx = -5 + m * 3;
            const my = -8 - m * 1.5;
            ctx.beginPath();
            ctx.moveTo(mx, my);
            ctx.quadraticCurveTo(mx - 6 + m, my - 10, mx - 8 + m * 2, my - 18);
            ctx.strokeStyle = `rgba(230,228,220,${0.25 - m * 0.03})`;
            ctx.lineWidth   = 1.2 - m * 0.15;
            ctx.lineCap = 'round';
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.moveTo(19, -4);
        ctx.bezierCurveTo(30, -14, 45, -18, 58, -10);
        ctx.strokeStyle = 'rgba(255,255,255,0.38)';
        ctx.lineWidth   = 1.1;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(20, 3);
        ctx.bezierCurveTo(32, 10, 46, 12, 60, 6);
        ctx.strokeStyle = 'rgba(255,255,255,0.32)';
        ctx.lineWidth   = 1.0;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(58, -10, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(60, 6, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fill();

        ctx.restore();
    }

    function drawTail() {
        const ti = SEG - 1;
        const tp = segs[ti];
        const tb = segs[ti - 3];
        const angle = Math.atan2(tp.y - tb.y, tp.x - tb.x);

        ctx.save();
        ctx.translate(tp.x, tp.y);
        ctx.rotate(angle);

        for (let f = 0; f < 4; f++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(4 + f*2, -(6+f*5), 10+f*3, -(10+f*4), 6+f*4, -(18+f*3));
            ctx.strokeStyle = `rgba(240,238,232,${0.20 - f * 0.04})`;
            ctx.lineWidth   = 1.2 - f * 0.2;
            ctx.lineCap     = 'round';
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawSpineGlow() {
        if (segs.length < 2) return;
        ctx.save();
        ctx.lineCap  = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur  = 32;
        ctx.shadowColor = 'rgba(255,255,255,0.12)';
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth   = 28;
        ctx.beginPath();
        ctx.moveTo(segs[0].x, segs[0].y);
        for (let i = 1; i < segs.length; i++) {
            const mx = (segs[i].x + segs[i-1].x) / 2;
            const my = (segs[i].y + segs[i-1].y) / 2;
            ctx.quadraticCurveTo(segs[i-1].x, segs[i-1].y, mx, my);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    function drawBreath() {
        const h     = segs[0];
        const h1    = segs[1];
        const angle = Math.atan2(h.y - h1.y, h.x - h1.x);
        const mx    = h.x + Math.cos(angle) * 30;
        const my    = h.y + Math.sin(angle) * 30;
        for (let p = 0; p < 4; p++) {
            const spread = (Math.random() - 0.5) * 24;
            const dist   = Math.random() * 50 + 8;
            const px     = mx + Math.cos(angle) * dist + Math.cos(angle + Math.PI / 2) * spread;
            const py     = my + Math.sin(angle) * dist + Math.sin(angle + Math.PI / 2) * spread;
            ctx.beginPath();
            ctx.arc(px, py, Math.random() * 3.5 + 0.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.07})`;
            ctx.fill();
        }
    }

    const DUST = 45;
    const dust = Array.from({ length: DUST }, () => ({
        x:  Math.random() * 1920,
        y:  Math.random() * 1080,
        r:  Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        a:  Math.random() * 0.28 + 0.04,
    }));

    function drawDust() {
        dust.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${p.a})`;
            ctx.fill();
        });
    }

    function update() {
        t += 0.007;
        segs[0].x = path.x();
        segs[0].y = path.y();
        for (let i = 1; i < SEG; i++) {
            const dx = segs[i].x - segs[i - 1].x;
            const dy = segs[i].y - segs[i - 1].y;
            const d  = Math.sqrt(dx * dx + dy * dy) || 1;
            segs[i].x = segs[i - 1].x + (dx / d) * DIST;
            segs[i].y = segs[i - 1].y + (dy / d) * DIST;
        }
    }

    function render() {
        ctx.clearRect(0, 0, W, H);
        drawDust();
        drawSpineGlow();
        drawMane();
        drawBody();
        drawClaws();
        drawTail();
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
            el.style.cssText = `position:absolute;width:${size}px;height:${size}px;left:${e.clientX-r.left-size/2}px;top:${e.clientY-r.top-size/2}px;border-radius:50%;background:rgba(255,255,255,0.1);transform:scale(0);animation:_rpl .55s ease-out forwards;pointer-events:none;z-index:99;`;
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
        gloss.style.background = `linear-gradient(90deg,transparent,rgba(255,255,255,${0.1 + xp * 0.002}),transparent)`;
    });
})();

/* ==========================================================
   FOCUS ACCESSIBILITY
========================================================== */
document.querySelectorAll('a').forEach(a => {
    a.addEventListener('focus',  function () { this.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.35)'; });
    a.addEventListener('blur',   function () { this.style.boxShadow = ''; });
});
