function Wall(x, y, w, h) {
	Sprite.apply(this, arguments);
	this.immovable = true;

	this.depth = allSprites.maxDepth() + 1;
	allSprites.add(this);
}

Wall.prototype = Object.create(Sprite.prototype);