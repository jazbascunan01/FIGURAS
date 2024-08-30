class Rectangulo extends Figura {
    constructor(x, y, ancho, alto, color) {
        super(x, y);
        this.ancho = ancho;
        this.alto = alto;
        this.color = color;
    }

    contienePunto(x, y) {
        return x >= this.x && x <= this.x + this.ancho && y >= this.y && y <= this.y + this.alto;
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