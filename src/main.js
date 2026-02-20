import Boot from './scenes/Boot.js';
import MainMenu from './scenes/MainMenu.js';
import GameScene from './scenes/GameScene.js';
import GameOver from './scenes/GameOver.js'; 

const config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    parent: 'game-container',
    render: {
        pixelArt: true,
        antialias: false
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1200 },
            debug: true //acuerdate de cambiar esto si no quiero ver la colision 
        }
    },
    scene: [Boot, MainMenu, GameScene, GameOver]
};

const game = new Phaser.Game(config);