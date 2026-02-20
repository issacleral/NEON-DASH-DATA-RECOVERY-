import Boot from './scenes/Boot.js';
import GameScene from './scenes/GameScene.js';

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
            debug: false
        }
    },
    scene: [Boot, GameScene] 
};

const game = new Phaser.Game(config);