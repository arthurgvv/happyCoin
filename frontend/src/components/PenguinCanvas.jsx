import { useEffect, useRef } from "react";

const CATCH_RADIUS = 70;
const CROP_RATIO = 1.0;

function buildPenguinSprite(img) {
  const oc = document.createElement("canvas");
  oc.width = img.naturalWidth;
  oc.height = Math.floor(img.naturalHeight * CROP_RATIO);
  const octx = oc.getContext("2d");
  octx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight * CROP_RATIO, 0, 0, oc.width, oc.height);

  const id = octx.getImageData(0, 0, oc.width, oc.height);
  const d = id.data;
  const w = oc.width;
  const h = oc.height;
  const visited = new Uint8Array(w * h);
  const stack = [];

  function tryPush(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const i = y * w + x;
    if (visited[i]) return;
    const p = i * 4;
    if (d[p] > 230 && d[p + 1] > 230 && d[p + 2] > 230) {
      visited[i] = 1;
      stack.push(i);
    }
  }

  // Seed flood fill from all edges
  for (let x = 0; x < w; x++) { tryPush(x, 0); tryPush(x, h - 1); }
  for (let y = 1; y < h - 1; y++) { tryPush(0, y); tryPush(w - 1, y); }

  while (stack.length > 0) {
    const i = stack.pop();
    d[i * 4 + 3] = 0;
    const x = i % w;
    const y = (i / w) | 0;
    tryPush(x + 1, y); tryPush(x - 1, y); tryPush(x, y + 1); tryPush(x, y - 1);
  }

  octx.putImageData(id, 0, 0);
  return oc;
}

function makeCoin(canvasWidth, overrideX, overrideY, overrideVy) {
  return {
    x: overrideX ?? 40 + Math.random() * (canvasWidth - 80),
    y: overrideY ?? -30,
    vy: overrideVy ?? 1.3 + Math.random() * 1.7,
    vx: (Math.random() - 0.5) * 0.8,
    size: 15 + Math.random() * 9,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.09,
    age: 0,
  };
}


function PenguinCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animId;
    let frame = 0;
    let catchAnim = 0;
    let shakeAnim = 0;
    let penguinSprite = null;
    let penguinCx = 0;
    let penguinCy = 0;
    let penguinHitR = 80;
    const coins = [];
    let mouseX = null;
    let mouseY = null;

    function resize() {
      const r = canvas.parentElement.getBoundingClientRect();
      const w = Math.max(Math.round(r.width), 1);
      const h = Math.max(Math.round(r.height), 200);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    function drawCoin(c) {
      ctx.save();
      ctx.translate(c.x, c.y);
      const g = ctx.createRadialGradient(-c.size * 0.3, -c.size * 0.3, 0, 0, 0, c.size);
      g.addColorStop(0, "#fff176");
      g.addColorStop(0.55, "#f4b91f");
      g.addColorStop(1, "#b87700");
      ctx.beginPath();
      ctx.arc(0, 0, c.size, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "rgba(140,70,0,0.9)";
      ctx.font = `bold ${Math.round(c.size * 0.9)}px Inter,sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("H", 0, 0);
      ctx.restore();
    }

    function loop() {
      frame++;
      resize();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      // Shift up so the penguin body is centered and the "happycoin" text shows below
      const penguinY = cy - 20 + Math.sin(frame * 0.04) * 7;
      const scale = Math.min(0.58, (canvas.height * 0.58) / (penguinSprite ? penguinSprite.height : 400));
      penguinCx = cx;
      penguinCy = penguinY;
      penguinHitR = penguinSprite ? (penguinSprite.height * scale * 0.38) : 80;

      // Update + draw coins
      for (let i = coins.length - 1; i >= 0; i--) {
        const c = coins[i];

        // Mouse attraction
        if (mouseX !== null) {
          const dx = mouseX - c.x;
          const dy = mouseY - c.y;
          const d = Math.hypot(dx, dy);
          if (d < 160 && d > 1) {
            c.vx += (dx / d) * 0.18;
            c.vy += (dy / d) * 0.18;
          }
        }

        c.age++;
        c.vx *= 0.98;
        c.vy = Math.min(c.vy + 0.04, 5);
        c.x += c.vx;
        c.y += c.vy;
        c.angle += c.spin;

        const dist = Math.hypot(c.x - cx, c.y - penguinY);
        if (c.age > 20 && dist < CATCH_RADIUS) {
          coins.splice(i, 1);
          catchAnim = 20;
          continue;
        }

        if (c.y - c.size > canvas.height) { coins.splice(i, 1); continue; }
        drawCoin(c);
      }

      // Penguin
      if (penguinSprite) {
        const pw = penguinSprite.width * scale;
        const ph = penguinSprite.height * scale;
        ctx.save();
        ctx.translate(cx, penguinY);
        if (shakeAnim > 0) {
          const t = shakeAnim / 30;
          ctx.rotate(Math.sin(shakeAnim * 0.9) * 0.18 * t);
          ctx.translate(Math.sin(shakeAnim * 1.2) * 6 * t, Math.sin(shakeAnim * 0.7) * 3 * t);
          shakeAnim--;
        } else if (catchAnim > 0) {
          ctx.rotate(Math.sin(catchAnim * 0.55) * 0.07);
          catchAnim--;
        }
        ctx.drawImage(penguinSprite, -pw / 2, -ph / 2, pw, ph);
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    }

    function onMouseMove(e) {
      const r = canvas.getBoundingClientRect();
      mouseX = (e.clientX - r.left) * (canvas.width / r.width);
      mouseY = (e.clientY - r.top) * (canvas.height / r.height);
      const overPenguin = Math.hypot(mouseX - penguinCx, mouseY - penguinCy) < penguinHitR;
      canvas.style.cursor = overPenguin ? "pointer" : "default";
    }
    function onMouseLeave() { mouseX = null; mouseY = null; }
    function onClick(e) {
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) * (canvas.width / r.width);
      const y = (e.clientY - r.top) * (canvas.height / r.height);
      if (Math.hypot(x - penguinCx, y - penguinCy) < penguinHitR) {
        shakeAnim = 30;
        const count = 6 + Math.floor(Math.random() * 5);
        for (let j = 0; j < count; j++) {
          const spread = ((j / count) * 2 - 1) * 1.1 + (Math.random() - 0.5) * 0.4;
          const speed = 2.5 + Math.random() * 2.5;
          const coin = makeCoin(canvas.width, penguinCx + (Math.random() - 0.5) * 16, penguinCy);
          coin.vx = spread * speed;
          coin.vy = -(speed * (0.6 + Math.random() * 0.6));
          coins.push(coin);
        }
      }
    }

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("click", onClick);

    resize();

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      penguinSprite = buildPenguinSprite(img);
      loop();
    };
    img.onerror = () => loop();
    img.src = "/assets/happycoin-logo.png";

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}

export default PenguinCanvas;
