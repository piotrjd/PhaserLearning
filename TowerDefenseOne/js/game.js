var config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 640,
    height: 512,
    physics: {
        default: 'arcade'
    },
    scene: {
        key: 'main',
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);    

var graphics;
var path;
var ENEMY_SPEED = 1/10000;
var BULLET_DAMAGE = 10;

var gold = 160;
var goldText;
var health = 10;
var healthText;

var map =     
       [[ 0,-1, 0, 0, 0, 0, 0, 0, 0, 0],
        [ 0,-1, 0, 0, 0, 0, 0, 0, 0, 0],
        [ 0,-1,-1,-1,-1,-1,-1,-1, 0, 0],
        [ 0, 0, 0, 0, 0, 0, 0,-1, 0, 0],
        [ 0, 0, 0, 0, 0, 0, 0,-1, 0, 0],
        [ 0, 0, 0, 0, 0, 0, 0,-1, 0, 0],
        [ 0, 0, 0, 0, 0, 0, 0,-1, 0, 0],
        [ 0, 0, 0, 0, 0, 0, 0,-1, 0, 0]];

function preload(){
            //this.load.atlas('sprites','assets/spritesheet.png','assets/spritesheet.json');
            this.load.spritesheet('enemy_AA','assets/enemy_AA.png',{ frameWidth: 64, frameHeight: 64 });
            this.load.spritesheet('enemy_BB','assets/enemy_BB.png',{ frameWidth: 64, frameHeight: 64 });

            this.load.image('bullet_A','assets/bullet_A.png');
            this.load.image('bullet_B','assets/bullet_B.png');
            this.load.image('bullet_C','assets/bullet_C.png');
            this.load.image('bullet_D','assets/bullet_D.png');

            this.load.image('tower_A','assets/tower_A.png');
            this.load.image('tower_B','assets/tower_B.png');
            this.load.image('tower_C','assets/tower_C.png');
            this.load.image('tower_D','assets/tower_D.png');

            this.load.image('board','assets/board.png');
        }

        function create(){
            this.cameras.main.setBackgroundColor('#fffff1')
            graphics = this.add.graphics();
            drawGrid(graphics);

            path = this.add.path(96, -32);
            path.lineTo(96, 164);
            path.lineTo(480, 164);
            path.lineTo(480, 544);
            
            graphics.lineStyle(3, 0xffff00, 1);

            path.draw(graphics);
            
            enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
	        this.nextEnemy = 0;
            turrets = this.add.group({ classType: Turret, runChildUpdate: true });
            this.input.on('pointerdown', placeTurret);
            bullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
            this.physics.add.overlap(enemies, bullets, damageEnemy);

            this.anims.create({
                key: 'move',
                frames: this.anims.generateFrameNumbers('enemy_AA', { start: 0, end: 4 }),
                frameRate: 20,
                repeat: -1
             });

            goldText = this.add.text(400, 16, 'Gold: ' + gold, { fontSize: '32px', fill: '#000' });
            healthText = this.add.text(400, 64, 'Health: ' + health, { fontSize: '32px', fill: '#000' });
        }

        function update(time, delta) {  
            // if its time for the next enemy
            if (time > this.nextEnemy)
            {        
                var enemy = enemies.get();
                if (enemy)
                {
                    enemy.setActive(true);
                    enemy.setVisible(true);
                    
                    // place the enemy at the start of the path
                    enemy.startOnPath();
                    
                    this.nextEnemy = time + 2000;
                }       
            }

            if(health == 0){
                this.physics.pause();
                this.add.text(60, 260, 'GAME OVER!', { fontSize: '120px', fill: '#ff0000' });
                gameOver = true;
            }
        }

        function drawGrid(graphics) {
            graphics.lineStyle(1, 0x0000ff, 0.2);
            for(var i = 0; i < 8; i++) {
                graphics.moveTo(0, i * 64);
                graphics.lineTo(640, i * 64);
            }
            for(var j = 0; j < 10; j++) {
                graphics.moveTo(j * 64, 0);
                graphics.lineTo(j * 64, 512);
            }
            graphics.strokePath();
        }

        function placeTurret(pointer) {
            var i = Math.floor(pointer.y/64);
            var j = Math.floor(pointer.x/64);
            if(canPlaceTurret(i, j) && gold >= 20) {
                var turret = turrets.get();
                if (turret)
                {
                    turret.setActive(true);
                    turret.setVisible(true);
                    turret.place(i, j);
                    spendGold(20);
                }   
            }
        }

        function canPlaceTurret(i, j) {
            return map[i][j] === 0;
        }

        function addBullet(x, y, angle) {
            var bullet = bullets.get();
            if (bullet)
            {
                bullet.fire(x, y, angle);
            }
        }

        function getEnemy(x, y, distance) {
            var enemyUnits = enemies.getChildren();
            for(var i = 0; i < enemyUnits.length; i++) {       
                if(enemyUnits[i].active && Phaser.Math.Distance.Between(x, y, enemyUnits[i].x, enemyUnits[i].y) <= distance)
                    return enemyUnits[i];
            }
            return false;
        }

        function damageEnemy(enemy, bullet) {  
            // only if both enemy and bullet are alive
            if (enemy.active === true && bullet.active === true) {
                // we remove the bullet right away
                bullet.setActive(false);
                bullet.setVisible(false);    
                
                // decrease the enemy hp with BULLET_DAMAGE
                enemy.receiveDamage(BULLET_DAMAGE);
            }
        }

        function spendGold(amount){
            gold -= amount;
            updateGold();
        }

        function updateGold(){
            goldText.setText("Gold: " + gold)
        }

        function updateHealth(){
            healthText.setText("Health: " + health)
        }

        function earnGold(amount){
            gold += amount;
            updateGold();
        }
