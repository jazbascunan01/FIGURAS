class Figura {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.seleccionada = false;
    }

    // Método base para verificar si un punto está dentro de la figura
    contienePunto(x, y) {
        return false;
    }
    ajustarPosicionFigura(figura) {
        // Ajustar posición en X
        if (figura.x > canvas.width) {
            figura.x = 0;
        } else if (figura.x + (figura.ancho || figura.radio) < 0) {
            figura.x = canvas.width;
        }
        // Ajustar posición en Y
        if (figura.y > canvas.height) {
            figura.y = 0;
        } else if (figura.y + (figura.alto || figura.radio) < 0) {
            figura.y = canvas.height;
        }
    }
    // Método base para dibujar la figura (se implementará en las subclases)
    dibujar(ctx) {}
    toJSON() {
        return {
            tipo: this.constructor.name,
            x: this.x,
            y: this.y,
            color: this.color,
            seleccionada: this.seleccionada
        };
    }
    ajustarEscala() {
        this.escala = this.seleccionada ? 1.2 : 1; // Agranda la figura un 10% si está seleccionada
    }
}