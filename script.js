/* ==========================================================
   SPACE SCENE RENDERER
   Spaceships, asteroids, stars, nebula clouds, shooting stars
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

    let t = 0;
    const rand = (a, b) => Math.random() * (b - a) + a;
    const TAU = Math.PI * 2;

    /* ─────────────────────────────
       STARS (3 layers for parallax)
    ───────────────────────────── */
    function makeStars(count, speed, minR, maxR, alpha) {
        return Array.from({ length: count }, () => ({
            x: rand(0, W), y: rand(0, H),
            r: rand(minR, maxR),
            vx: -speed * rand(0.6, 1.4),
            a: rand(alpha * 0.4, alpha),
            twinkle: rand(0, TAU),
            twinkleSpeed: rand(0.01, 0.04),
        }));
    }
    let stars1 = makeStars(180, 0.12, 0.3, 0.8, 0.7);   // far, dim
    let stars2 = makeStars(90,  0.28, 0.5, 1.2, 0.85);  // mid
    let stars3 = makeStars(35,  0.55, 0.8, 1.8, 1.0);   // near, bright

    function drawStarLayer(layer) {
        layer.forEach(s => {
            s.x += s.vx;
            s.twinkle += s.twinkleSpeed;
            if (s.x < -4) { s.x = W + 4; s.y = rand(0, H); }
            const a = s.a * (0.75 + 0.25 * Math.sin(s.twinkle));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, TAU);
            ctx.fillStyle = `rgba(255,255,255,${a})`;
            ctx.fill();
        });
    }

    /* ─────────────────────────────
       SHOOTING STARS
    ───────────────────────────── */
    const shooters = [];
    function spawnShooter() {
        shooters.push({
            x: rand(W * 0.2, W + 100),
            y: rand(-50, H * 0.6),
            len: rand(80, 200),
            speed: rand(8, 18),
            angle: rand(0.35, 0.65),   // downward-left diagonal
            alpha: rand(0.5, 0.9),
            life: 1,
        });
    }
    let shooterTimer = 0;

    function drawShooters() {
        shooterTimer++;
        if (shooterTimer > rand(90, 220)) { spawnShooter(); shooterTimer = 0; }
        for (let i = shooters.length - 1; i >= 0; i--) {
            const s = shooters[i];
            s.x -= Math.cos(s.angle) * s.speed;
            s.y += Math.sin(s.angle) * s.speed;
            s.life -= 0.025;
            if (s.life <= 0 || s.x < -200 || s.y > H + 50) { shooters.splice(i, 1); continue; }
            const grad = ctx.createLinearGradient(s.x, s.y, s.x + Math.cos(s.angle) * s.len, s.y - Math.sin(s.angle) * s.len);
            grad.addColorStop(0, `rgba(255,255,255,${s.alpha * s.life})`);
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s.x + Math.cos(s.angle) * s.len, s.y - Math.sin(s.angle) * s.len);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }

    /* ─────────────────────────────
       NEBULA CLOUDS (slow drifting)
    ───────────────────────────── */
    const nebulae = Array.from({ length: 5 }, () => ({
        x: rand(0, W), y: rand(0, H),
        rx: rand(120, 280), ry: rand(60, 140),
        angle: rand(0, TAU),
        vx: rand(-0.04, 0.04),
        vy: rand(-0.02, 0.02),
        hue: [220, 260, 190, 200, 240][Math.floor(rand(0, 5))],
        alpha: rand(0.018, 0.042),
    }));

    function drawNebulae() {
        nebulae.forEach(n => {
            n.x += n.vx; n.y += n.vy;
            if (n.x < -300) n.x = W + 300;
            if (n.x > W + 300) n.x = -300;
            if (n.y < -200) n.y = H + 200;
            if (n.y > H + 200) n.y = -200;
            ctx.save();
            ctx.translate(n.x, n.y);
            ctx.rotate(n.angle);
            const g = ctx.createRadialGradient(0, 0, 0, 0, 0, n.rx);
            g.addColorStop(0, `hsla(${n.hue},60%,75%,${n.alpha})`);
            g.addColorStop(0.5, `hsla(${n.hue},50%,60%,${n.alpha * 0.5})`);
            g.addColorStop(1, 'hsla(0,0%,0%,0)');
            ctx.scale(1, n.ry / n.rx);
            ctx.beginPath();
            ctx.arc(0, 0, n.rx, 0, TAU);
            ctx.fillStyle = g;
            ctx.fill();
            ctx.restore();
        });
    }



    /* ─────────────────────────────
       RENDER LOOP
    ───────────────────────────── */
    function render() {
        ctx.clearRect(0, 0, W, H);
        t += 0.012;

        drawNebulae();
        drawStarLayer(stars1);
        drawStarLayer(stars2);
        drawStarLayer(stars3);
        drawShooters();

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
