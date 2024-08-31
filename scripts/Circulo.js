// Clase para círculos
class Circulo extends Figura {
    constructor(x, y, radio, color) {
        super(x, y);
        this.radio = radio;
        this.color = color;
    }

    contienePunto(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return (dx * dx + dy * dy) <= this.radio * this.radio;
    }

    dibujar(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        if (this.seleccionada) {
            ctx.strokeStyle = 'white'; // Color del borde de selección
            ctx.lineWidth = 2; // Ancho del borde
            ctx.stroke(); // Dibujar borde
        }
    }
    mover(x, y, arrastrando) {
        if (arrastrando) {
            this.x = Math.max(this.radio, Math.min(canvas.width - this.radio, x));
            this.y = Math.max(this.radio, Math.min(canvas.height - this.radio, y));
        } else {
            this.x = x;
            this.y = y;
            this.ajustarPosicionFigura();
        }
    }
}