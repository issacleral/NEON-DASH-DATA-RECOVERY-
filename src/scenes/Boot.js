export default class Boot extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        this.load.image('fondo', 'assets/images/fondo.png');
        this.load.image('fondo1', 'assets/images/fondo1.png');
        this.load.image('fondo2', 'assets/images/fondo2.png')
        this.load.image('fondo3', 'assets/images/fondo3.png')
        this.load.image('fondo4', 'assets/images/fondo4.png')


    }

    create() {
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.scene.start('MainMenu');
    }
}