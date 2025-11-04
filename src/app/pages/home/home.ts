import { Component, ViewChild, ElementRef, afterNextRender, PLATFORM_ID, inject, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Theme } from '../../core/services/theme';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  @ViewChild('canvasBg', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private canvasEffect?: Effect;
  private animationId?: number;

  private platformId = inject(PLATFORM_ID);
  private themeService = inject(Theme)

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => {
        this.initCanvas();
      });
      // Отслеживаем изменение темы
      effect(() => {
        const isDark = this.themeService.theme() === 'dark';
        // Проверяем что canvas уже инициализирован
        if (this.canvasEffect) {
          this.updateCanvasTheme(isDark);
        }
      });
    }
  }

  private updateCanvasTheme(isDark: boolean) {
    if (!this.canvasEffect) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Обновляем градиент для частиц
    initGradient(canvas, ctx, isDark);

    // Обновляем isDark в Effect
    this.canvasEffect.updateTheme(isDark);
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const isDark = this.themeService.theme() === 'dark';
    initGradient(canvas, ctx, isDark)

    this.canvasEffect = new Effect(canvas, ctx, isDark);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.canvasEffect!.handleParticles();


      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }
}

class Particle {
  radius: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  pushX: number;
  pushY: number;
  friction: number;

  constructor(private effect: Effect, private canvasWidth: number, private canvasHeight: number) {
    this.radius = this.random(5, 9); //Math.floor(Math.random() * 10 + 1)
    this.x = this.radius + Math.random() * (canvasWidth - this.radius * 2);
    this.y = this.radius + Math.random() * (canvasHeight - this.radius * 2);
    this.vx = Math.random() * 1.2 - 0.5;
    this.vy = Math.random() * 1.2 - 0.5;
    this.pushX = 0;
    this.pushY = 0;
    this.friction = 0.95;
  }

  private random (min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  update() {
    if (this.effect.mouse.pressed) {
      const dx = this.x - this.effect.mouse.x;
      const dy = this.y - this.effect.mouse.y;
      const distance = Math.hypot(dx, dy);
      const force = this.effect.mouse.radius / distance;

      if (distance < this.effect.mouse.radius) {
        const angle = Math.atan2(dy, dx);
        this.pushX += Math.cos(angle) * force;
        this.pushY += Math.sin(angle) * force;
      }
    }

    this.x += (this.pushX *= this.friction) + this.vx;
    this.y += (this.pushY *= this.friction) + this.vy;

    if (this.x < this.radius) {
      this.x = this.radius;
      this.vx *= -1;
    } else if (this.x > this.canvasWidth - this.radius) {
      this.x = this.canvasWidth - this.radius;
      this.vx *= -1;
    }

    if (this.y < this.radius) {
      this.y = this.radius;
      this.vy *= -1;
    } else if (this.y > this.canvasHeight - this.radius) {
      this.y = this.canvasHeight - this.radius;
      this.vy *= -1;
    }
  }

  reset() {
    this.x = this.radius + Math.random() * (this.canvasWidth - this.radius * 2);
    this.y = this.radius + Math.random() * (this.canvasHeight - this.radius * 2);
  }
}

class Effect {
  particles: Particle[] = [];
  numberOfParticles: number = 0;
  mouse = {
    x: 0,
    y: 0,
    pressed: false,
    radius: 0
  };

  constructor(
    private canvas: HTMLCanvasElement,
    private ctx: CanvasRenderingContext2D,
    private isDark: boolean
  ) {
    this.setParticleCount(window.innerWidth);
    this.createParticles();
    this.setupEventListeners();
  }

  private setParticleCount(width: number) {
    if (width > 1399) {
      this.numberOfParticles = 250;
    } else if (width > 1199) {
      this.numberOfParticles = 200;
    } else if (width > 991) {
      this.numberOfParticles = 150;
    } else if (width > 700) {
      this.numberOfParticles = 100;
    } else if (width > 600) {
      this.numberOfParticles = 70;
    } else {
      this.numberOfParticles = 50;
    }
  }

  updateTheme(isDark: boolean) {
    this.isDark = isDark;
    initGradient(this.canvas, this.ctx, isDark);
  }

  private createParticles() {
    for (let i = 0; i < this.numberOfParticles; i++) {
      this.particles.push(new Particle(this, this.canvas.width, this.canvas.height));
    }
  }

  private setupEventListeners() {
    window.addEventListener('mousedown', () => {
      this.mouse.pressed = true;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.mouse.pressed) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.mouse.radius = 200
      }
    });

    window.addEventListener('mouseup', () => {
      this.mouse.pressed = false;
      this.mouse.x = 0;
      this.mouse.y = 0;
      this.mouse.radius = 0
    });

    window.addEventListener('resize', () => {
      this.resize();
    });
  }

  handleParticles() {
    this.particles.forEach(particle => {
      particle.draw(this.ctx);
      particle.update();
    });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    initGradient(this.canvas, this.ctx, this.isDark);

    this.particles.forEach(particle => particle.reset());
    this.particles = [];
    this.setParticleCount(this.canvas.width);
    this.createParticles();
  }
}

// создает градиент
const initGradient = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, isDark :boolean) => {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);

  if (isDark) {
    // Темная тема - темные частицы
    gradient.addColorStop(0, '#1e293b'); // slate-800
    gradient.addColorStop(0.5, '#334155'); // slate-700
    gradient.addColorStop(1, '#475569'); // slate-600
  } else {
    // Светлая тема - светлые частицы
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(0.5, 'rgb(152, 181, 205)');
    gradient.addColorStop(1, 'rgb(74,137,182)');
  }

  ctx.fillStyle = gradient;
}
