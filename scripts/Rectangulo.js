class Rectangulo extends Figura {
    constructor(x, y, ancho, alto, color, colorInicio = null, colorFin = null) {
        super(x, y);
        this.ancho = ancho;
        this.alto = alto;
        this.color = color;

        // Si no viene por parametro color de degradado, generarlos aleatoriamente (por si en un futuro se quiere hacer con un color dado)
        if (!colorInicio || !colorFin) {
            this.colorInicio = {
                r: Math.floor(Math.random() * 256),
                g: Math.floor(Math.random() * 256),
                b: Math.floor(Math.random() * 256)
            };

            this.colorFin = {
                r: Math.floor(Math.random() * 256),
                g: Math.floor(Math.random() * 256),
                b: Math.floor(Math.random() * 256)
            };
        } else {
            this.colorInicio = colorInicio;
            this.colorFin = colorFin;
        }
    }

    contienePunto(x, y) {
        return x >= this.x && x <= this.x + this.ancho && y >= this.y && y <= this.y + this.alto;
    }


    dibujar(ctx) {
        if (!isFinite(this.x) || !isFinite(this.y) || !isFinite(this.ancho) || !isFinite(this.alto)) {
            console.error("Valores no finitos para el gradiente:", this.x, this.y, this.ancho, this.alto);
            return;
        }

        const escala = this.seleccionada ? 1.2 : 1;
        const anchoEscalado = this.ancho * escala;
        const altoEscalado = this.alto * escala;

        // Crear el degradado
        const imageData = ctx.createImageData(anchoEscalado, altoEscalado);
        for (let y = 0; y < altoEscalado; y++) {
            for (let x = 0; x < anchoEscalado; x++) {
                const ratioX = x / anchoEscalado;
                const ratioY = y / altoEscalado;
                const r = Math.round(this.colorInicio.r * (1 - ratioX) + this.colorFin.r * ratioX);
                const g = Math.round(this.colorInicio.g * (1 - ratioX) + this.colorFin.g * ratioX);
                const b = Math.round(this.colorInicio.b * (1 - ratioX) + this.colorFin.b * ratioX);
                this.setPixel(imageData, x, y, r, g, b);
            }
        }

        // Ajustar la posición considerando la escala
        ctx.putImageData(imageData, this.x - (anchoEscalado - this.ancho) / 2, this.y - (altoEscalado - this.alto) / 2);

        // Dibujar el borde si está seleccionado
        if (this.seleccionada) {
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x - (anchoEscalado - this.ancho) / 2, this.y - (altoEscalado - this.alto) / 2, anchoEscalado, altoEscalado);
        }
    }

    setPixel(imageData, x, y, r, g, b) {
        const index = (x + y * imageData.width) * 4;
        imageData.data[index] = r;
        imageData.data[index + 1] = g;
        imageData.data[index + 2] = b;
        imageData.data[index + 3] = 255;
    }

    mover(x, y, arrastrando) {
        if (arrastrando) {
            this.x = Math.max(0, Math.min(canvas.width - this.ancho, x));
            this.y = Math.max(0, Math.min(canvas.height - this.alto, y));
        } else {
            this.x = x;
            this.y = y;
            this.ajustarPosicionFigura();
        }
    }

    clonar() {
        return new Rectangulo(
            this.x, this.y, this.ancho, this.alto, this.color,
            this.colorInicio, this.colorFin
        );
    }

    toJSON() {
        return {
            tipo: 'Rectangulo',
            x: this.x,
            y: this.y,
            ancho: this.ancho,
            alto: this.alto,
            color: this.color,
            colorInicio: this.colorInicio,
            colorFin: this.colorFin,
            seleccionada: this.seleccionada
        };
    }
}
