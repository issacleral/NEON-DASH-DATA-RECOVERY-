const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 }, // Gravedad para el salto del robot
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    // Aquí cargarás tus recursos (sprites, fondos, música)
    // Ejemplo: this.load.image('background', 'assets/images/background.png');
    //this.load.image('robot', 'C:\Users\rodri\Desktop\DAM2\AD\NEON-DASH-DATA-RECOVERY-\assets\sprites'); // Temporal
    this.load.image('neonCity', '../assets/images/fondo.png');
}

function create() {
    console.log("Neon Dash: Sistema iniciado...");
    
    // Texto de bienvenida (Escena de inicio)
    this.add.text(400, 100, 'NEON DASH', { fontSize: '64px', fill: '#0ff' }).setOrigin(0.5);
    this.add.text(400, 200, 'DATA RECOVERY', { fontSize: '32px', fill: '#f0f' }).setOrigin(0.5);
    this.add.image(400, 300, 'neonCity');

    // Personaje básico con físicas
    this.player = this.physics.add.sprite(100, 450, 'robot');
    this.player.setCollideWorldBounds(true);

    // Controles
    this.cursors = this.input.keyboard.createCursorKeys();
    this.load.spritesheet('robot', './assets/sprites/Robot.png', { 
    frameWidth: 32,
    frameHeight: 32 

    
});
}

function update() {
    // Lógica de movimiento básica
    if (this.cursors.left.isDown) {
        this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(160);
    } else {
        this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown && this.player.body.onFloor()) {
        this.player.setVelocityY(-330);
    }
}