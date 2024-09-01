class Cuadrado extends Rectangulo {
    constructor(x, y, lado, color) {
        super(x, y, lado, lado, color);
    }
    dibujar(ctx) {
        this.ajustarEscala(); // Aplicar escalado basado en la selección
        ctx.save(); // Guardar el estado actual del contexto

        ctx.translate(this.x + this.ancho / 2, this.y + this.alto / 2); // Mover el punto de origen al centro
        ctx.scale(this.escala, this.escala); // Aplicar escalado
        ctx.translate(-this.x - this.ancho / 2, -this.y - this.alto / 2); // Mover el punto de origen de vuelta

        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.ancho, this.alto);
        if (this.seleccionada) {
            ctx.strokeStyle = 'white'; // Color del borde de selección
            ctx.lineWidth = 2; // Ancho del borde
            ctx.strokeRect(this.x, this.y, this.ancho, this.alto); // Dibujar borde
        }
        ctx.restore(); // Restaurar el estado del contexto
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