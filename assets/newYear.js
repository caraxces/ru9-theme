class NewYearEffect {
  constructor() {
    this.container = document.getElementById('newYearsEffects');
    this.flowerCount = 20;
    this.init();
  }

  init() {
    if (!this.container) {
      console.error('Could not find newYears-effects container');
      return;
    }
    this.createFlowers();
  }

  createFlowers() {
    for (let i = 0; i < this.flowerCount; i++) {
      const flower = document.createElement('div');
      flower.className = 'newYear';
      
      // Random vị trí
      flower.style.left = `${Math.random() * 100}vw`;
      
      // Random độ trễ
      flower.style.animationDelay = `${Math.random() * 10}s`;
      
      // Random kích thước
      const size = 15 + Math.random() * 15;
      flower.style.setProperty('--size', `${size}px`);
      
      // Random di chuyển
      const leftIni = -10 + Math.random() * 20;
      const leftEnd = -10 + Math.random() * 20;
      flower.style.setProperty('--left-ini', `${leftIni}vw`);
      flower.style.setProperty('--left-end', `${leftEnd}vw`);
      
      this.container.appendChild(flower);
    }
  }
}

// Khởi tạo khi DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  new NewYearEffect();
  console.log('NewYearEffect initialized'); // Debug log
}); 