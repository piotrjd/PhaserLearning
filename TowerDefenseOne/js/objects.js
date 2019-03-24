var Enemy = new Phaser.Class({

            Extends: Phaser.GameObjects.Image,

            initialize: function Enemy(scene){
                Phaser.GameObjects.Image.call(this, scene, 0, 0, 'enemy_AA');
                this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
            },
            update: function (time,delta){
                 // move the t point along the path, 0 is the start and 0 is the end
                this.follower.t += ENEMY_SPEED * delta;
                
                // get the new x and y coordinates in vec
                path.getPoint(this.follower.t, this.follower.vec);
                
                // update enemy x and y to the newly obtained x and y
                this.setPosition(this.follower.vec.x, this.follower.vec.y);
                
                //this.anims.play('move');
                // if we have reached the end of the path, remove the enemy
                if (this.follower.t >= 1)
                {
                    this.setActive(false);
                    this.setVisible(false);
                    health -= 1;
                    updateHealth();
                }
            },
            startOnPath: function ()
            {
                // set the t parameter at the start of the path
                this.follower.t = 0;
                
                // get x and y of the given t point            
                path.getPoint(this.follower.t, this.follower.vec);
                
                // set the x and y of our enemy to the received from the previous step
                this.setPosition(this.follower.vec.x, this.follower.vec.y);  
                this.hp = 100;           
            },
            receiveDamage: function(damage) {
                this.hp -= damage;         
                //this.setTint(0xff0000 * (100-this.hp))

                // if hp drops below 0 we deactivate this enemy
                if(this.hp <= 0) {
                    this.setActive(false);
                    this.setVisible(false);      
                    earnGold(5);
                }
            },

            
});

var Turret = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize: function Turret (scene)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'tower_A');
        this.nextTic = 0;
    },
    // we will place the turret according to the grid
    place: function(i, j) {            
        this.y = i * 64 + 64/2;
        this.x = j * 64 + 64/2;
        map[i][j] = 1;            
    },
    fire: function() {
        var enemy = getEnemy(this.x, this.y, 100);
        if(enemy) {
            var angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
            addBullet(this.x, this.y, angle);
            this.angle = (angle + Math.PI/2) * Phaser.Math.RAD_TO_DEG;
        }
    },
    update: function (time, delta)
    {
        // time to shoot
        if(time > this.nextTic) {
            this.fire();                
            this.nextTic = time + 1000;
        }
    }
});

var Bullet = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize: function Bullet (scene)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet_A');

        this.dx = 0;
        this.dy = 0;
        this.lifespan = 0;

        this.speed = Phaser.Math.GetSpeed(600, 1);
    },

    fire: function (x, y, angle)
    {
        this.setActive(true);
        this.setVisible(true);

        //  Bullets fire from the middle of the screen to the given x/y
        this.setPosition(x, y);

        //  we don't need to rotate the bullets as they are round
        //  this.setRotation(angle);
        this.dx = Math.cos(angle);
        this.dy = Math.sin(angle);

        this.lifespan = 300;
    },

    update: function (time, delta)
    {
        this.lifespan -= delta;

        this.x += this.dx * (this.speed * delta);
        this.y += this.dy * (this.speed * delta);

        if (this.lifespan <= 0)
        {
            this.setActive(false);
            this.setVisible(false);
        }
    }

});