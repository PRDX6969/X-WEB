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
       ASTEROIDS
    ───────────────────────────── */
    function makeAsteroid() {
        const size = rand(8, 38);
        // random jagged polygon points
        const pts = [];
        const numPts = Math.floor(rand(7, 12));
        for (let i = 0; i < numPts; i++) {
            const a = (i / numPts) * TAU;
            const r = size * rand(0.55, 1.0);
            pts.push({ a, r });
        }
        return {
            x: W + size + 20,
            y: rand(20, H - 20),
            vx: -rand(0.3, 1.1),
            vy: rand(-0.15, 0.15),
            rot: 0,
            rotV: rand(-0.008, 0.008),
            size, pts,
            alpha: rand(0.35, 0.65),
        };
    }

    let asteroids = Array.from({ length: 6 }, () => {
        const a = makeAsteroid();
        a.x = rand(0, W);   // spread initial positions
        return a;
    });
    let asteroidTimer = 0;

    function drawAsteroids() {
        asteroidTimer++;
        if (asteroidTimer > rand(140, 300) && asteroids.length < 12) {
            asteroids.push(makeAsteroid());
            asteroidTimer = 0;
        }
        for (let i = asteroids.length - 1; i >= 0; i--) {
            const a = asteroids[i];
            a.x += a.vx; a.y += a.vy; a.rot += a.rotV;
            if (a.x < -a.size - 20) { asteroids.splice(i, 1); continue; }

            ctx.save();
            ctx.translate(a.x, a.y);
            ctx.rotate(a.rot);

            // draw jagged polygon
            ctx.beginPath();
            a.pts.forEach((p, j) => {
                const px = Math.cos(p.a) * p.r;
                const py = Math.sin(p.a) * p.r;
                j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
            });
            ctx.closePath();

            // rocky fill with subtle gradient
            const g = ctx.createRadialGradient(-a.size*0.2, -a.size*0.2, 0, 0, 0, a.size);
            g.addColorStop(0, `rgba(200,195,188,${a.alpha})`);
            g.addColorStop(0.5, `rgba(155,150,145,${a.alpha * 0.8})`);
            g.addColorStop(1, `rgba(90,85,80,${a.alpha * 0.5})`);
            ctx.fillStyle = g;
            ctx.shadowBlur = 6;
            ctx.shadowColor = `rgba(180,170,160,${a.alpha * 0.3})`;
            ctx.fill();

            // crater details on larger asteroids
            if (a.size > 18) {
                ctx.strokeStyle = `rgba(80,75,70,${a.alpha * 0.5})`;
                ctx.lineWidth = 0.6;
                ctx.shadowBlur = 0;
                ctx.beginPath();
                ctx.arc(a.size * 0.15, a.size * 0.1, a.size * 0.22, 0, TAU);
                ctx.stroke();
                if (a.size > 26) {
                    ctx.beginPath();
                    ctx.arc(-a.size * 0.25, -a.size * 0.15, a.size * 0.14, 0, TAU);
                    ctx.stroke();
                }
            }

            ctx.restore();
        }
    }

    /* ─────────────────────────────
       SPACESHIPS
    ───────────────────────────── */
    function makeShip() {
        const type = Math.floor(rand(0, 3)); // 0=fighter, 1=cruiser, 2=scout
        return {
            x: -120,
            y: rand(H * 0.05, H * 0.95),
            speed: rand(0.6, 1.8),
            type,
            scale: rand(0.7, 1.3),
            alpha: rand(0.55, 0.85),
            engineFlicker: 0,
            trail: [],
        };
    }

    let ships = [];
    let shipTimer = rand(200, 400);

    function drawShipFighter(scale, alpha) {
        // sleek angular fighter
        ctx.save();
        ctx.scale(scale, scale);
        ctx.fillStyle = `rgba(220,218,215,${alpha})`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = `rgba(255,255,255,${alpha * 0.4})`;

        // main body
        ctx.beginPath();
        ctx.moveTo(28, 0);
        ctx.lineTo(6, -7);
        ctx.lineTo(-20, -5);
        ctx.lineTo(-28, -3);
        ctx.lineTo(-28, 3);
        ctx.lineTo(-20, 5);
        ctx.lineTo(6, 7);
        ctx.closePath();
        ctx.fill();

        // wings
        ctx.fillStyle = `rgba(195,192,188,${alpha * 0.85})`;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.lineTo(-18, -22);
        ctx.lineTo(-24, -20);
        ctx.lineTo(-20, -5);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.lineTo(-18, 22);
        ctx.lineTo(-24, 20);
        ctx.lineTo(-20, 5);
        ctx.closePath();
        ctx.fill();

        // cockpit glass
        ctx.beginPath();
        ctx.ellipse(14, 0, 7, 4, 0, 0, TAU);
        ctx.fillStyle = `rgba(150,200,255,${alpha * 0.55})`;
        ctx.fill();

        ctx.restore();
    }

    function drawShipCruiser(scale, alpha) {
        // wide bulky cruiser
        ctx.save();
        ctx.scale(scale, scale);

        ctx.fillStyle = `rgba(200,198,194,${alpha})`;
        ctx.shadowBlur = 16;
        ctx.shadowColor = `rgba(255,255,255,${alpha * 0.35})`;

        // hull
        ctx.beginPath();
        ctx.moveTo(45, 0);
        ctx.lineTo(20, -12);
        ctx.lineTo(-30, -14);
        ctx.lineTo(-45, -8);
        ctx.lineTo(-45, 8);
        ctx.lineTo(-30, 14);
        ctx.lineTo(20, 12);
        ctx.closePath();
        ctx.fill();

        // upper bridge
        ctx.fillStyle = `rgba(215,213,210,${alpha * 0.9})`;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(20, -12);
        ctx.lineTo(30, -18);
        ctx.lineTo(5, -18);
        ctx.lineTo(-10, -12);
        ctx.closePath();
        ctx.fill();

        // engine pods
        ctx.fillStyle = `rgba(170,168,165,${alpha * 0.8})`;
        ctx.beginPath();
        ctx.roundRect(-48, -20, 20, 8, 3);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(-48, 12, 20, 8, 3);
        ctx.fill();

        // windows row
        for (let w = 0; w < 5; w++) {
            ctx.beginPath();
            ctx.rect(8 - w * 12, -5, 6, 4);
            ctx.fillStyle = `rgba(160,210,255,${alpha * 0.5})`;
            ctx.fill();
        }

        ctx.restore();
    }

    function drawShipScout(scale, alpha) {
        // small round scout / UFO-ish
        ctx.save();
        ctx.scale(scale, scale);

        ctx.fillStyle = `rgba(210,208,204,${alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(255,255,255,${alpha * 0.4})`;

        // saucer body
        ctx.beginPath();
        ctx.ellipse(0, 0, 22, 8, 0, 0, TAU);
        ctx.fill();

        // dome
        ctx.beginPath();
        ctx.ellipse(0, -4, 11, 7, 0, 0, TAU);
        ctx.fillStyle = `rgba(170,215,255,${alpha * 0.5})`;
        ctx.fill();

        // ring glow
        ctx.beginPath();
        ctx.ellipse(0, 0, 26, 10, 0, 0, TAU);
        ctx.strokeStyle = `rgba(200,240,255,${alpha * 0.25})`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(150,220,255,${alpha * 0.3})`;
        ctx.stroke();

        ctx.restore();
    }

    function drawEngineTrail(ship) {
        // add current pos to trail
        ship.trail.push({ x: ship.x, y: ship.y });
        if (ship.trail.length > 28) ship.trail.shift();

        if (ship.trail.length < 3) return;
        ship.engineFlicker = (ship.engineFlicker + 0.18) % TAU;
        const flicker = 0.85 + 0.15 * Math.sin(ship.engineFlicker);

        // engine glow at back
        const ex = ship.x - (ship.type === 1 ? 48 : ship.type === 0 ? 28 : 22) * ship.scale;
        const ey = ship.y;
        const engineCount = ship.type === 1 ? 3 : 1;
        const offsets = ship.type === 1 ? [-16, 0, 16] : [0];

        offsets.forEach(off => {
            const eyo = ey + off * ship.scale;
            // engine exhaust plume
            const g = ctx.createRadialGradient(ex, eyo, 0, ex - 18 * ship.scale, eyo, 30 * ship.scale);
            g.addColorStop(0, `rgba(180,220,255,${ship.alpha * 0.7 * flicker})`);
            g.addColorStop(0.3, `rgba(100,160,255,${ship.alpha * 0.35 * flicker})`);
            g.addColorStop(1, 'rgba(50,100,200,0)');
            ctx.beginPath();
            ctx.ellipse(ex - 10 * ship.scale, eyo, 22 * ship.scale, 5 * ship.scale, 0, 0, TAU);
            ctx.fillStyle = g;
            ctx.fill();
        });

        // draw trail
        ctx.beginPath();
        ship.trail.forEach((p, i) => {
            i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        });
        ctx.strokeStyle = `rgba(150,200,255,${ship.alpha * 0.08})`;
        ctx.lineWidth = 3 * ship.scale;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    function drawShips() {
        shipTimer--;
        if (shipTimer <= 0 && ships.length < 5) {
            ships.push(makeShip());
            shipTimer = rand(220, 500);
        }

        for (let i = ships.length - 1; i >= 0; i--) {
            const s = ships[i];
            s.x += s.speed;
            if (s.x > W + 150) { ships.splice(i, 1); continue; }

            drawEngineTrail(s);

            ctx.save();
            ctx.translate(s.x, s.y);
            if (s.type === 0) drawShipFighter(s.scale, s.alpha);
            else if (s.type === 1) drawShipCruiser(s.scale, s.alpha);
            else drawShipScout(s.scale, s.alpha);
            ctx.restore();
        }
    }

    /* ─────────────────────────────
       DISTANT PLANETS (static bg)
    ───────────────────────────── */
    const planets = [
        { x: W * 0.82, y: H * 0.18, r: 55, hue: 200, sat: 30, alpha: 0.12, ringAngle: 0.3 },
        { x: W * 0.12, y: H * 0.78, r: 30, hue: 25,  sat: 40, alpha: 0.09, ringAngle: -0.2 },
    ];

    function drawPlanets() {
        planets.forEach(p => {
            // planet body
            const g = ctx.createRadialGradient(p.x - p.r*0.3, p.y - p.r*0.3, p.r*0.1, p.x, p.y, p.r);
            g.addColorStop(0, `hsla(${p.hue},${p.sat}%,75%,${p.alpha * 1.5})`);
            g.addColorStop(0.6, `hsla(${p.hue},${p.sat}%,45%,${p.alpha})`);
            g.addColorStop(1, `hsla(${p.hue},${p.sat}%,20%,${p.alpha * 0.5})`);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, TAU);
            ctx.fillStyle = g;
            ctx.fill();

            // atmospheric rim glow
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r + 4, 0, TAU);
            ctx.strokeStyle = `hsla(${p.hue},60%,80%,${p.alpha * 0.5})`;
            ctx.lineWidth = 4;
            ctx.stroke();

            // rings
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.ringAngle);
            ctx.scale(1, 0.28);
            ctx.beginPath();
            ctx.arc(0, 0, p.r * 1.75, 0, TAU);
            ctx.strokeStyle = `hsla(${p.hue},30%,70%,${p.alpha * 0.6})`;
            ctx.lineWidth = p.r * 0.22 / 0.28;
            ctx.stroke();
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
        drawPlanets();
        drawStarLayer(stars1);
        drawStarLayer(stars2);
        drawStarLayer(stars3);
        drawShooters();
        drawAsteroids();
        drawShips();

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
