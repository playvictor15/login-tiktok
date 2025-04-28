const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// Apenas um exemplo visual
ctx.fillStyle = 'lightblue';
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.fillStyle = 'black';
ctx.font = '30px Arial';
ctx.fillText('Bem-vindo ao Mundo dos Foquinhos!', 150, 300);
