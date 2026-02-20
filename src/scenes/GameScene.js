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
        // Assets de ambiente y juego
        this.load.image('neonCity', 'assets/images/fondo1.png');
        this.load.image('plataforma', 'assets/images/plataforma.png');
        this.load.image('archivo', 'assets/images/archivo.png'); 
        this.load.image('virus', 'assets/sprites/virus1.png'); 
        this.load.image('btnPausa', 'assets/images/btnPausa.png');
        this.load.image('moneda', 'assets/sprites/moneda.png'); 
        
        this.load.spritesheet('robot', 'assets/sprites/Robot.png', { 
            frameWidth: 32, frameHeight: 32 
        });
    }

    create() {
        // 1. FONDO
        let fondo = this.add.image(960, 540, 'neonCity');
        fondo.setDisplaySize(1920, 1080).setAlpha(0.9);

        // 2. PLATAFORMAS (Suelo móviles)
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(960, 1070, 'plataforma').setDisplaySize(1920, 80).refreshBody();
        this.movingPlatforms = this.physics.add.group({ allowGravity: false, immovable: true });
        this.crearPlataformaMovil(400, 850, 150);
        this.crearPlataformaMovil(1500, 850, -150);
        this.crearPlataformaMovil(960, 650, 200);

        // 3. JUGADOR
        this.player = this.physics.add.sprite(200, 900, 'robot');
        this.player.setCollideWorldBounds(true).setBounce(0.1).setScale(3);

        // 4. GRUPOS Y GENERADORES ALEATORIOS
        this.archivos = this.physics.add.group();
        this.enemies = this.physics.add.group();
        this.time.addEvent({ delay: 3000, callback: this.generarArchivo, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 5000, callback: this.generarVirus, callbackScope: this, loop: true });

        // --- 5. HUD (INTERFAZ DE USUARIO) ---
        
        // MARCADOR DE MONEDA 
        this.add.image(110, 75, 'moneda').setScale(1.2); 
        this.scoreText = this.add.text(150, 50, '00000', { 
            fontSize: '45px', 
            fill: '#0ff', 
            fontStyle: 'bold',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: { x: 10, y: 5 }
        });

        // MARCADOR DE ARCHIVOS
        this.add.image(110, 145, 'archivo').setScale(0.8); 
        this.countText = this.add.text(150, 120, 'x 0', { 
            fontSize: '45px', 
            fill: '#fff', 
            fontStyle: 'bold' 
        });

        // BOTÓN PAUSA
        this.btnIconoPausa = this.add.image(1850, 70, 'btnPausa').setInteractive({ useHandCursor: true }).setScale(0.8);
        this.btnIconoPausa.on('pointerdown', () => this.togglePause());
        this.input.keyboard.on('keydown-ESC', () => this.togglePause());

        // CARTELES
        this.crearCartelPausa();

        // 6. FÍSICAS Y COLISIONES
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.movingPlatforms);
        this.physics.add.collider(this.archivos, this.platforms);
        this.physics.add.collider(this.archivos, this.movingPlatforms);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.overlap(this.player, this.archivos, this.recolectar, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hitVirus, null, this);

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (this.isPaused || this.physics.world.isPaused) return;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-500);
            this.player.flipX = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(500);
            this.player.flipX = false;
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-1000);
        }

        this.enemies.children.iterate((v) => {
            if (v && v.body && (v.body.blocked.left || v.body.blocked.right)) {
                v.setVelocityX(v.body.velocity.x * -1);
            }
        });

        if (this.player.y > 1075) this.hitVirus();
    }

    // MÉTODOS DE APOYO
    crearPlataformaMovil(x, y, velX) {
        let p = this.movingPlatforms.create(x, y, 'plataforma');
        p.setDisplaySize(400, 40);
        p.body.setVelocityX(velX);
        p.setCollideWorldBounds(true).setBounce(1);
    }

    generarArchivo() {
        if (this.isPaused) return;
        let x = Phaser.Math.Between(100, 1800);
        let archivo = this.archivos.create(x, 0, 'archivo').setScale(0.6).setBounceY(0.3).setCollideWorldBounds(true);
        archivo.body.setGravityY(-900);
        this.time.delayedCall(7000, () => { if (archivo.active) archivo.destroy(); });
    }

    generarVirus() {
        if (this.isPaused) return;
        let x = Phaser.Math.Between(100, 1800);
        let virus = this.enemies.create(x, 0, 'virus').setScale(0.4).setBounce(1).setCollideWorldBounds(true);
        virus.setVelocityX(Phaser.Math.Between(150, 350) * (Math.random() > 0.5 ? 1 : -1));
    }

    recolectar(player, archivo) {
        archivo.destroy();
        this.score += 100;
        this.archivoCount++;
        this.scoreText.setText(this.score.toString().padStart(5, '0'));
        this.countText.setText('x ' + this.archivoCount);
        player.setTint(0x00ff00);
        this.time.delayedCall(100, () => player.clearTint());
    }

    // CARTELES PROFESIONALES
    crearCartelPausa() {
        this.pausaContainer = this.add.container(960, 540).setDepth(100).setVisible(false);
        const bg = this.add.graphics();
        bg.fillStyle(0x1a252c, 0.95);
        bg.lineStyle(6, 0x00ffff, 1);
        bg.fillRoundedRect(-300, -200, 600, 400, 20);
        bg.strokeRoundedRect(-300, -200, 600, 400, 20);
        
        const txtPausa = this.add.text(0, -120, 'PAUSED', { fontSize: '70px', fill: '#0ff', fontStyle: 'bold' }).setOrigin(0.5);
        const btnResume = this.add.text(0, 0, ' RESUME ', { fontSize: '40px', fill: '#000', backgroundColor: '#0ff', padding: 10 }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        const btnRestart = this.add.text(0, 100, ' RESTART ', { fontSize: '40px', fill: '#000', backgroundColor: '#ff0066', padding: 10 }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.pausaContainer.add([bg, txtPausa, btnResume, btnRestart]);
        btnResume.on('pointerdown', () => this.togglePause());
        btnRestart.on('pointerdown', () => this.scene.restart());
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.physics.pause();
            this.time.paused = true;
            this.pausaContainer.setVisible(true);
        } else {
            this.physics.resume();
            this.time.paused = false;
            this.pausaContainer.setVisible(false);
        }
    }

    hitVirus() {
        this.physics.pause();
        this.time.paused = true;
        this.isPaused = true;
        this.player.setTint(0xff0000);

        // Cartel Game Over mas profesional
        const goContainer = this.add.container(960, 540).setDepth(200);
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.9);
        bg.lineStyle(6, 0xff0066, 1);
        bg.fillRoundedRect(-350, -250, 700, 500, 20);
        bg.strokeRoundedRect(-350, -250, 700, 500, 20);

        const t1 = this.add.text(0, -150, 'GAME OVER', { fontSize: '80px', fill: '#ff0066', fontStyle: 'bold' }).setOrigin(0.5);
        const t2 = this.add.text(0, -30, `FINAL SCORE: ${this.score}`, { fontSize: '45px', fill: '#0ff' }).setOrigin(0.5);
        const t3 = this.add.text(0, 50, `FILES COLLECTED: ${this.archivoCount}`, { fontSize: '45px', fill: '#fff' }).setOrigin(0.5);
        
        const btnRetry = this.add.text(0, 170, ' TRY AGAIN ', { fontSize: '40px', fill: '#000', backgroundColor: '#0ff', padding: 15 }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        goContainer.add([bg, t1, t2, t3, btnRetry]);
        btnRetry.on('pointerdown', () => this.scene.restart());
    }
}