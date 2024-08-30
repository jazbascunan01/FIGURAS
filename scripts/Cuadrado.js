class Cuadrado extends Rectangulo {
    constructor(x, y, lado, color) {
        super(x, y, lado, lado, color);
    }
    dibujar(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.ancho, this.alto);
        if (this.seleccionada) {
            ctx.strokeStyle = 'white'; // Color del borde de selección
            ctx.lineWidth = 1; // Ancho del borde
            ctx.strokeRect(this.x, this.y, this.ancho, this.alto); // Dibujar borde
        }
    }
}