function Ball(x, y, w, h, vX, vY, c) {
	Sprite.apply(this, arguments);
	this.shapeColor = c;
	this.damage = 1;
  
	this.itemHit = function(t, i) {
		if(i instanceof Brick) {
			if(i.shapeColor === this.shapeColor) {
				gameControl.currentLevel.level_items.forEach(function(b) {
					if(b.shapeColor === this.shapeColor) {
						b.remove();
						gameControl.score += 1;
					}
				}, this);
				gameControl.currentLevel.removeColor(this.shapeColor);
			} else {
				i.remove();
				gameControl.score += 1;
			}
			sounds['brickhit'].play();

			var newColor = gameControl.currentLevel.chooseColor();
			
			this.shapeColor = newColor;
			gameControl.player.shapeColor = newColor;
			
			if(gameControl.currentLevel.bricksLeft() === 0) {
				gameControl.nextLevel();
			}
		}
	}
	
	this.reset = function(x, y) {
	  this.lives--;
		this.position.x = x;
		this.position.y = y;
	}

	this.depth = allSprites.maxDepth() + 1;
	allSprites.add(this);

	this.setVelocity(vX, vY);
}

Ball.prototype = Object.create(Sprite.prototype);