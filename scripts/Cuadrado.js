class Cuadrado extends Rectangulo {
    constructor(x, y, lado, color) {
        super(x, y, lado, lado, color);
    }
    dibujar(ctx) {
        this.ajustarEscala();
        ctx.save();

        ctx.translate(this.x + this.ancho / 2, this.y + this.alto / 2);
        ctx.scale(this.escala, this.escala);
        ctx.translate(-this.x - this.ancho / 2, -this.y - this.alto / 2);

        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.ancho, this.alto);
        if (this.seleccionada) {
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.ancho, this.alto);
        }
        ctx.restore();
    }
    toJSON() {
        return {
            tipo: 'Cuadrado',
            x: this.x,
            y: this.y,
            ancho: this.ancho,
            alto: this.alto,
            color: this.color,
            seleccionada: this.seleccionada
        };
    }
}