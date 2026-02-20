export default class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        let bg = this.add.image(960, 540, 'fondo1').setAlpha(0.6);
        bg.setDisplaySize(1920, 1080);

        this.add.text(960, 350, 'NEON DASH\nDATA RECOVERY', {
            fontSize: '120px',
            fill: '#0ff',
            fontStyle: 'bold',
            align: 'center',
            stroke: '#ff0066',
            strokeThickness: 10
        }).setOrigin(0.5);

        const btnStart = this.add.text(960, 650, '[ START SYSTEM ]', {
            fontSize: '60px',
            fill: '#fff',
            backgroundColor: '#ff0066',
            padding: { x: 30, y: 15 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        btnStart.on('pointerover', () => btnStart.setTint(0x00ffff).setScale(1.1));
        btnStart.on('pointerout', () => btnStart.clearTint().setScale(1));
        btnStart.on('pointerdown', () => this.scene.start('GameScene'));
    }
}