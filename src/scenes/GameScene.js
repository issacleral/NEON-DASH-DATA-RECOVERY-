export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init() {
        this.score = 0;
        this.archivoCount = 0;
        this.isPaused = false;

    }

    preload() {
        this.load.image('plataforma', 'assets/images/plataforma.png');
        this.load.image('archivo', 'assets/images/archivo.png');
        this.load.image('virus', 'assets/sprites/virus.png');
        this.load.image('btnPausa', 'assets/images/btnPausa.png');
        this.load.image('moneda', 'assets/sprites/moneda.png');
        this.load.spritesheet('robot_idle', 'assets/sprites/IdleRobot.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('robot_run', 'assets/sprites/correrDerechaRobot.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('robot_jump', 'assets/sprites/saltoRobot.png', { frameWidth: 64, frameHeight: 64   });
    }

    create() {
        this.bgImage = this.add.image(960, 540, 'fondo1');
        this.bgImage.setDisplaySize(1920, 1080).setAlpha(0.9);

        // --- CREACIÓN DE ANIMACIONES ---
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('robot_idle', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('robot_run', { start: 0, end: 4 }),
            frameRate: 12,
            repeat: -1
        });
        this.anims.create({
            key: 'jump',
            frames: [{ key: 'robot_jump', frame: 1 }],
            frameRate: 1
        });


        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(960, 1070, 'plataforma').setDisplaySize(1920, 80).refreshBody();
        this.movingPlatforms = this.physics.add.group({ allowGravity: false, immovable: true });

        const alturas = [850, 650, 450, 250];
        alturas.forEach(y => {
            let randomX = Phaser.Math.Between(300, 1600);
            let randomVel = Phaser.Math.Between(100, 300) * (Math.random() > 0.5 ? 1 : -1);
            this.crearPlataformaMovil(randomX, y, randomVel);

        });
        this.player = this.physics.add.sprite(200, 900, 'robot_idle');
        this.player.setCollideWorldBounds(true).setBounce(0.1).setScale(1.5); // Ajusta la escala según necesites
        this.archivos = this.physics.add.group();
        this.monedas = this.physics.add.group();
        this.enemies = this.physics.add.group();
        this.time.addEvent({ delay: 3000, callback: this.generarArchivo, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 2000, callback: this.generarMoneda, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 5000, callback: this.generarVirus, callbackScope: this, loop: true });

        // HUD
        this.add.image(110, 75, 'moneda').setScale(1.2);
        this.scoreText = this.add.text(150, 50, '00000', { fontSize: '45px', fill: '#0ff', fontStyle: 'bold', backgroundColor: 'rgba(0,0,0,0.5)', padding: 5 });
        this.add.image(110, 145, 'archivo').setScale(0.8);
        this.countText = this.add.text(150, 120, 'x 0', { fontSize: '45px', fill: '#fff', fontStyle: 'bold' });
        this.btnIconoPausa = this.add.image(1850, 70, 'btnPausa').setInteractive({ useHandCursor: true }).setScale(0.8);
        this.btnIconoPausa.on('pointerdown', () => this.togglePause());

        // FÍSICAS
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.movingPlatforms);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.enemies, this.movingPlatforms);
        this.physics.add.collider(this.archivos, this.platforms);
        this.physics.add.collider(this.archivos, this.movingPlatforms);
        this.physics.add.collider(this.monedas, this.platforms);
        this.physics.add.collider(this.monedas, this.movingPlatforms);
        this.physics.add.overlap(this.player, this.archivos, this.recolectarArchivo, null, this);
        this.physics.add.overlap(this.player, this.monedas, this.recolectarMoneda, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hitVirus, null, this);
        this.crearCartelPausa();
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on('keydown-ESC', () => this.togglePause());
    }

    update() {
        if (this.isPaused || this.physics.world.isPaused) return;
        // LÓGICA DE MOVIMIENTO Y ANIMACIONES
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-500);
            this.player.flipX = true;
            if (this.player.body.touching.down) this.player.anims.play('run', true);
        }
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(500);
            this.player.flipX = false;
            if (this.player.body.touching.down) this.player.anims.play('run', true);
        }
        else {
            this.player.setVelocityX(0);
            if (this.player.body.touching.down) this.player.anims.play('idle', true);
        }
        
        if (!this.player.body.touching.down) {
            this.player.anims.play('jump', true);
        }
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-1000);
        }
        this.enemies.children.iterate((v) => {
            if (v && v.body && (v.body.blocked.left || v.body.blocked.right)) { v.setVelocityX(v.body.velocity.x * -1); }
        });
        if (this.player.y > 1075) this.hitVirus();

    }

    recolectarArchivo(player, archivo) {
        archivo.destroy();
        this.archivoCount++;
        this.countText.setText('x ' + this.archivoCount);
        if (this.archivoCount > 0 && this.archivoCount % 10 === 0) {
            let nKey = this.bgImage.texture.key === 'fondo1' ? 'fondo2' : 'fondo1';
            this.bgImage.setTexture(nKey);
            this.cameras.main.flash(500, 255, 255, 255);
        }
    }

    recolectarMoneda(player, moneda) {
        moneda.destroy();
        this.score += 100;
        this.scoreText.setText(this.score.toString().padStart(5, '0'));
    }

    generarVirus() {
        if (this.isPaused) return;
        let x = Phaser.Math.Between(100, 1800);
        let virus = this.enemies.create(x, 0, 'virus').setScale(0.4).setBounce(1).setCollideWorldBounds(true);
        virus.setVelocityX(Phaser.Math.Between(150, 350) * (Math.random() > 0.5 ? 1 : -1));
    }

    generarArchivo() {
        if (this.isPaused) return;
        let x = Phaser.Math.Between(100, 1800);
        this.archivos.create(x, 0, 'archivo').setScale(0.6).setBounce(0.4).setCollideWorldBounds(true);
    }

    generarMoneda() {
        if (this.isPaused) return;
        let x = Phaser.Math.Between(100, 1800);
        this.monedas.create(x, 0, 'moneda').setScale(1.1).setBounce(0.6).setCollideWorldBounds(true);
    }

    crearPlataformaMovil(x, y, velX) {
        let p = this.movingPlatforms.create(x, y, 'plataforma');
        p.setDisplaySize(400, 40);
        p.body.setVelocityX(velX);
        p.setCollideWorldBounds(true).setBounce(1);
    }

    crearCartelPausa() {
        this.pausaContainer = this.add.container(960, 540).setDepth(100).setVisible(false);
        const bg = this.add.graphics();
        bg.fillStyle(0x1a252c, 0.95); bg.lineStyle(6, 0x00ffff, 1);
        bg.fillRoundedRect(-300, -200, 600, 400, 20); bg.strokeRoundedRect(-300, -200, 600, 400, 20);
        const t = this.add.text(0, -80, 'PAUSED', { fontSize: '70px', fill: '#0ff', fontStyle: 'bold' }).setOrigin(0.5);
        const b = this.add.text(0, 50, ' RESUME ', { fontSize: '40px', fill: '#000', backgroundColor: '#0ff', padding: 10 }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.pausaContainer.add([bg, t, b]);
        b.on('pointerdown', () => this.togglePause());
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) { this.physics.pause(); this.time.paused = true; this.pausaContainer.setVisible(true); }
        else { this.physics.resume(); this.time.paused = false; this.pausaContainer.setVisible(false); }
    }

    hitVirus() {
       this.scene.start('GameOver', { score: this.score, files: this.archivoCount });
    }

}