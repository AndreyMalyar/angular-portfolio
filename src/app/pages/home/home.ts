import { Component, ViewChild, ElementRef, afterNextRender, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  @ViewChild('canvasBg', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private animationId?: number;
  private effect?: Effect

  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => {
        this.initCanvas();
      });
    }
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(0.5, 'rgb(152, 181, 205)');
    gradient.addColorStop(1, 'rgb(4, 76, 134)');
    ctx.fillStyle = gradient;

    this.effect = new Effect(canvas, ctx);

    const animate = () => {
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      this.effect!.handleParticles();
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
    this.radius = Math.floor(Math.random() * 10 + 1);
    this.x = this.radius + Math.random() * (canvasWidth - this.radius * 2);
    this.y = this.radius + Math.random() * (canvasHeight - this.radius * 2);
    this.vx = Math.random() * 1.2 - 0.5;
    this.vy = Math.random() * 1.2 - 0.5;
    this.pushX = 0;
    this.pushY = 0;
    this.friction = 0.95;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'white';
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
    radius: 200
  };

  constructor(
    private canvas: HTMLCanvasElement,
    private ctx: CanvasRenderingContext2D
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
      }
    });

    window.addEventListener('mouseup', () => {
      this.mouse.pressed = false;
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

    const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(0.5, 'rgb(152, 181, 205)');
    gradient.addColorStop(1, 'rgb(4, 76, 134)');
    this.ctx.fillStyle = gradient;

    this.particles.forEach(particle => particle.reset());
    this.particles = [];
    this.setParticleCount(this.canvas.width);
    this.createParticles();
  }
}
