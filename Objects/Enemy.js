function Enemy(x, y, c) {
	Sprite.apply(this, [x, y].concat([0, 0]));
	this.immovable = false;

	this.addImage(image);
	this.scale = 0.5;

	this.rotate = function() {
		var nextRot = map(noise(frameCount / 100), 0, 1, -1, 1);
		if(this.rotation + nextRot >= 30 || this.rotation + nextRot <= -30) {
			nextRot *= -1;
		}
		this.rotation += nextRot;
	}

	this.shoot = function() {
		gameControl.currentLevel.enemy_list.add(new Bullet(this.position.x, this.position.y + 10, 5, 20, [255, 0, 0], 7));
	}
	
	this.handleColor = function(c) {
	  this.colorOptions = [
	    ['pink_ship', 400, 8],
	    ['green_ship', 200, 5],
	    ['blue_ship', 800, 12],
	    ['yellow_ship', 100, 3],
	    ['beige_ship', 1000, 15]
	    ];
	    var newShip;
	}

	this.depth = allSprites.maxDepth() + 1;
	allSprites.add(this);
}

function Bullet(x, y, w, h, c, vY) {
	Sprite.apply(this, arguments);
	this.shapeColor = c;

	this.setVelocity(0, vY);

	this.depth = allSprites.maxDepth() + 1;
	allSprites.add(this);
}

Enemy.prototype = Object.create(Sprite.prototype);
Bullet.prototype = Object.create(Sprite.prototype);