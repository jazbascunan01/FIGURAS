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
        // Ajustar la escala
        const escala = this.seleccionada ? 1.1 : 1;

        // Guardar el estado del contexto
        ctx.save();

        // Aplicar la transformación
        ctx.translate(this.x, this.y);
        ctx.scale(escala, escala);
        ctx.translate(-this.x, -this.y);

        // Dibujar el círculo
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Dibujar el borde si está seleccionado
        if (this.seleccionada) {
            ctx.strokeStyle = 'white'; // Color del borde de selección
            ctx.lineWidth = 2; // Ancho del borde
            ctx.stroke(); // Dibujar borde
        }

        // Restaurar el estado del contexto
        ctx.restore();
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
    clonar() {
        return new Circulo(this.x, this.y, this.radio, this.color, this.ctx, this.seleccionada);
    }
    toJSON() {
        return {
            ...super.toJSON(),
            radio: this.radio,
        };
    }
}