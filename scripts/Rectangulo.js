class Rectangulo extends Figura {
    constructor(x, y, ancho, alto, color) {
        super(x, y);
        this.ancho = ancho;
        this.alto = alto;
        this.color = color;

        // Generar y almacenar dos colores aleatorios para el gradiente en el constructor
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
    }

    contienePunto(x, y) {
        return x >= this.x && x <= this.x + this.ancho && y >= this.y && y <= this.y + this.alto;
    }

    dibujar(ctx) {
        // Verificar que las coordenadas y dimensiones sean válidas
        if (!isFinite(this.x) || !isFinite(this.y) || !isFinite(this.ancho) || !isFinite(this.alto)) {
            console.error("Valores no finitos para el gradiente:", this.x, this.y, this.ancho, this.alto);
            return;
        }

        // Crear un objeto ImageData para el rectángulo
        const imageData = ctx.createImageData(this.ancho, this.alto);

        // Llenar pixel por pixel el gradiente usando los colores almacenados
        for (let y = 0; y < this.alto; y++) {
            for (let x = 0; x < this.ancho; x++) {
                const ratio = x / this.ancho; // Ratio para el gradiente horizontal

                // Calcular colores interpolados para el gradiente
                const r = Math.round(this.colorInicio.r * (1 - ratio) + this.colorFin.r * ratio);
                const g = Math.round(this.colorInicio.g * (1 - ratio) + this.colorFin.g * ratio);
                const b = Math.round(this.colorInicio.b * (1 - ratio) + this.colorFin.b * ratio);

                this.setPixel(imageData, x, y, r, g, b);
            }
        }

        // Poner los datos de imagen en el contexto
        ctx.putImageData(imageData, this.x, this.y);

        // Dibuja el borde si la figura está seleccionada
        if (this.seleccionada) {
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.ancho, this.alto);
        }
    }

    setPixel(imageData, x, y, r, g, b) {
        const index = (x + y * imageData.width) * 4;
        imageData.data[index] = r;      // Red
        imageData.data[index + 1] = g;  // Green
        imageData.data[index + 2] = b;  // Blue
        imageData.data[index + 3] = 255; // Opacidad completa
    }

}