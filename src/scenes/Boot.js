export default class Boot extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    create() {
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.scene.start('GameScene');
    }
}