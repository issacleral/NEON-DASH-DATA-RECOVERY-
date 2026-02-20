export default class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    create() {
        let fondo = this.add.image(960, 540, 'neonCity');
        fondo.setDisplaySize(1920, 1080);
        fondo.setAlpha(0.5); 

        this.add.text(960, 400, 'SISTEMA CORRUPTO', { 
            fontSize: '120px', 
            fill: '#f00',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 10
        }).setOrigin(0.5);

        this.add.text(960, 550, 'DATOS PERDIDOS', { 
            fontSize: '60px', 
            fill: '#fff' 
        }).setOrigin(0.5);

        // 3. Botón  REINTENTAR
        const botonReiniciar = this.add.text(960, 750, ' REINICIAR PROTOCOLO ', { 
            fontSize: '40px', 
            fill: '#0ff',
            backgroundColor: '#003333',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        // Evento al hacer clic en el botón
        botonReiniciar.on('pointerdown', () => {
            this.scene.start('GameScene'); // Vuelve a la escena del juego
        });

        // Efecto visual al pasar el ratón
        botonReiniciar.on('pointerover', () => botonReiniciar.setStyle({ fill: '#fff' }));
        botonReiniciar.on('pointerout', () => botonReiniciar.setStyle({ fill: '#0ff' }));
    }
}