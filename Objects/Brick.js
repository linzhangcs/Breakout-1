function Brick(x, y, w, h, c) {
	Sprite.apply(this, arguments);
	this.immovable = true;

	this.shapeColor = c;
}

Brick.prototype = Object.create(Sprite.prototype);
