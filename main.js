/* 
STATES:
	0 = PAUSED
	1 = RUNNING
	2 = WAITING (DEAD/NEXT LEVEL)
	3 = OUT OF LIVES
*/

function Menu(components) {
  
	this.addComponent = function(component) {
		this.components.add(component);
	}

	this.handleComponentParam = function(components) {
		var newComp = new Group();
		if(components instanceof Group) {
			return components;
		} else if(components instanceof Array) {
			components.forEach(function(c) {
				newComp.add(c);
			});
		} else if(components instanceof Sprite) {
		  newComp.add(components);
		}
		return newComp;
	}

	this.drawComponents = function() {
		drawSprites(this.components);
		this.components.forEach(function(c) {
		  c.handleTooltip();
		  if(c.tooltipActive) {
		    c.tooltip.draw();
		  }
		});
	}

	this.handleComponentCallbacks = function() {
	}
	
	this.scaleAll = function(scale) {
	  this.components.forEach(function(c) {
	    c.scale = scale;
	  });
	}

	this.components = this.handleComponentParam(components);
}

function Button(x, y, image, callback, tooltip) {
	Sprite.apply(this, [x, y].concat([0, 0]));

	this.mouseIsActive = true;
	this.tooltipActive = false;

	this.handleTooltip = function() {
		if(this.mouseIsOver) {
			this.tooltipActive = true;
		} else {
		  this.tooltipActive = false;
		}
	}
	this.addImage(image);
	
	this.depth = allSprites.maxDepth() + 1;
	allSprites.add(this);

	this.callback = callback;
	
}

function Tooltip(x, y, image) {
	Sprite.apply(this, [x, y].concat([0, 0]));

	this.depth = allSprites.maxDepth() + 1;
	allSprites.add(this);

	this.addImage(image);
}

Button.prototype = Object.create(Sprite.prototype);
Tooltip.prototype = Object.create(Sprite.prototype);


function Level(rows, cols, b_margin, offX, offY, filter, numcolors) {

	this.createLayout = function(rows, cols, b_margin, offX, offY, filter, colors) {
		for(var i = 0; i < rows; i++) {
			for(var j = 0; j < cols; j++) {
				if(filter(i, j)) {
					this.level_items.add(new Brick( offX + j * (40 + b_margin), offY + i * (20 + b_margin), 40, 20, this.chooseColor()));
				}
			}
		}

		this.level_items.add(new Wall(-20, 0, 20, height*2));
		this.level_items.add(new Wall(width+20, 0, 20, height*2));
		this.level_items.add(new Wall(0, -20, width*2, 20));
	}

	this.createLevelColors = function(numcolors) {
		var colors = [];
		for(var i = 0; i < numcolors; i++) {
			colors.push([randomGaussian(200, 55), randomGaussian(200, 55), randomGaussian(200, 55)]);
		}
		return colors;
	}
	
	this.bricksLeft = function() {
		return this.level_items.filter(function(s) {
			return !(s instanceof Powerup) && !(s instanceof Wall);
		}).length;
	}

	this.chooseColor = function() {
		return this.colors[Math.floor(Math.random() * this.colors.length)];
	}

	this.drawLevel = function() {
		drawSprites(this.level_items);
		drawSprites(this.ball_list);
	}
	
	this.getProperties = function() {
		return [this.rows, this.cols, this.b_margin, this.offX, this.offY, '' + this.filter, this.numcolors];
	}
	
	this.handleFilter = function(f) {
		if(typeof f === 'string') {
			return new Function('i', 'j', f.split('{')[1].split('}')[0]);
		} else {
			return f;
		}
	}
	
	this.rows = rows;
	this.cols = cols;this.b_margin = b_margin;
	this.offX = offX;
	this.offY = offY;
	this.filter = this.handleFilter(filter);
	this.numcolors = numcolors || 8;
	
	this.colors = this.createLevelColors(this.numcolors);

	this.level_items = new Group();
	this.ball_list = new Group();

	this.createLayout(rows, cols, b_margin, offX, offY, this.filter || function() { return true; }, this.colors);

	this.ball_list.add(new Ball(500, 400, 15, 15, 5, 5, this.chooseColor()));
}

function GameControl() {

	this.createLevelList = function() {
		return [
		[9, 16, 4, (width / 2) - 15 * (40 + 4) / 2, 80, function(i, j) { return i === 0; }, 8],
		[9, 16, 4, (width / 2) - 15 * (40 + 4) / 2, 80, function(i, j) { return j === 0; }, 8],
		];
	}

	this.draw = function() {
	  this.formatText(32, 'future', [255, 255, 255]);
		if(this.state === 1) {
			this.player.position.x = constrain(mouseX, this.player.width/2, windowWidth - this.player.width/2);
			
			this.player.handlePowerupTimers();

			this.checkBallHits();
			this.garbageCollection();

			this.player_list.collide(this.currentLevel.level_items, this.player.triggerPowerup);
		} else if(this.state === 0) {
			text('PAUSED', (width / 2) - 32 * 2, (height / 2));
		} else if(this.state === 2) {
			text('Click to Begin', (width / 2) - 32 * 4, (height / 2));
		} else if(this.state === 3) {
			text('Game Over! \nPress \'R\' to Restart!', (width / 2) - 32 * 4, (height / 2));
		}
		this.currentLevel.drawLevel();
		
		drawSprites(this.player_list);
		
		this.drawText();
		
		this.menu_list.forEach(function(m) {
		  m.drawComponents();
		});
		
		if(frameCount % 360 === 0 && this.state === 1) {
			this.currentLevel.level_items.add(this.generatePowerup());
		}

	}
	
	this.generatePowerup = function() {
		var powerups = [
		[ [255, 0, 0], function(level) { level.ball_list.add(new Ball(random(width), 400, 15, 15, 5, random(4, 10), level.chooseColor())) }],
		[ [0, 255, 0], function(level) { gameControl.player.lives++; } ],
		[ [0, 0, 255], function(level) { gameControl.score += 5; } ],
		[ [255, 0, 255], function(level) { gameControl.player.timers['large'][0] += 500; } ],
		[ [128, 128, 255], function(level) { gameControl.player.timers['ycontrol'][0] += 500; } ],
		[ [128, 60, 0], function(level) { gameControl.player.timers['large'][0] = 0; if(gameControl.player_list.length === 1) { gameControl.player_list.add(new Paddle(gameControl.player.position.x, gameControl.player.position.y, 150, gameControl.player.height)); } gameControl.player.timers['splitpaddle'][0] += 500; } ]
		];
		var newPowerup = powerups[Math.floor(Math.random() * powerups.length)];
		return new Powerup(random(width), random(250), newPowerup[0], newPowerup[1], random(4, 10));
	}

	this.garbageCollection = function() {
		this.currentLevel.level_items.forEach(function(s) {
			if(s instanceof Powerup && s.position.y >= width + 16) {
				s.remove();
			}
		});
	}

	this.checkBallHits = function() {
		this.currentLevel.ball_list.forEach(function(b) {
			b.bounce(this.currentLevel.level_items, b.itemHit);
			b.bounce(this.player_list, function(b, p) {
				var swing = (b.position.x - p.position.x) / 3;
				b.setSpeed(9, b.getDirection() + swing);
				sounds['paddlehit'].play();
			});

			if(b.position.y >= height + b.height) {
				this.loseBall(b);
			}

		}, this);
	}

	this.nextLevel = function() {
		this.currentLevel.level_items.forEach(function(s) {
			s.remove();
		});
		this.levelList.shift();
		if(this.levelList.length === 0) {
			this.levelList.push(this.createLevel('random'));
		}
		this.currentLevel = this.createLevel(this.levelList[0]);
		this.changeState(2);
		this.level++;
		
		this.saveGame();
	}

	this.handlePause = function() {
		this.state === 0 ? this.changeState(1) : this.changeState(0);
	}

	this.clearPowerups = function() {
		this.currentLevel.level_items.forEach(function(spr) {
			if(spr instanceof Powerup) {
				spr.remove();
			}
		});
		var timerKeys = Object.keys(gameControl.player.timers);
		for(var i = 0; i < timerKeys.length; i++) {
			gameControl.player.timers[timerKeys[i]][0] = [0];
		}
	}

	this.loseBall = function(b) {
		if(this.currentLevel.ball_list.length === 1) {
			if(this.player.lives > 0) {
				this.clearPowerups();
				this.player.lives--;

				b.position.x = 500;
				b.position.y = 400;

				this.player.position.x = 500;
				this.changeState(2);
			} else {
				this.changeState(3);
			}
		} else {
			b.remove();
		}
		sounds['death'].play();	
	}

	this.changeState = function(s) {
		if(s === 0 || s === 2 || s === 3) {
			updateSprites(false);
			sounds['beat'].pause();
		} else {
			sounds['beat'].loop();
			updateSprites(true);
		}
		this.state = s;
	}

	this.drawText = function() {
	  this.formatText(32, 'blocks', [255, 255, 255]);
		text('Score: '.concat(this.score), (width / 2) - (32 * 2), 32 * 1.5);
		text('Level: '.concat(this.level), 0 + (32 / 2), 32 * 1.5);
		text('Lives: '.concat(this.player.lives), width - (32 * 6), 32 * 1.5);
	}
	
	this.formatText = function(size, font, nfill) {
	  textSize(size);
	  textFont(fonts[font]);
	  fill(nfill);
	}

	this.createLevel = function(args) {
		if(args === 'random') {
			return [random(4, 15), random(4, 15), random(3, 10), random(100, (width / 2) - 15 * (40) / 2), random(100, 150), function(i, j) { return i % Math.floor(Math.random() * 4) === 0 || j % Math.floor(Math.random() * 4) === 0}, Math.ceil(random(4, 16))];
		} else {
			return new Level(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
		}
	}
	
	this.loadGame = function() {
		var userSave = window.localStorage.getItem('save');
		if(userSave !== undefined) {
			var info = JSON.parse(userSave);
			if(info['level'] > this.levelList.length) {
				this.levelList = new Group();
				this.currentLevel = this.createLevel(info['layout']);
			} else {
				this.levelList.splice(0, info['level']-1);
				this.currentLevel = this.createLevel(this.levelList[0]);
			}
			this.level = info['level'];
			this.score = info['score'];
			this.lives = info['lives'];

		}
	}
	
	this.saveGame = function() {
		window.localStorage.setItem('save', JSON.stringify({level: this.level, score: this.score, layout: this.currentLevel.getProperties(), lives: this.lives}));
	}

	this.levelList = this.createLevelList();
	this.currentLevel = this.createLevel(this.levelList[0]);
	this.player_list = new Group();
	
	this.menu_list = [];

	this.player = new Paddle(100, (windowHeight - 35), 150, 40);
	this.player_list.add(this.player);

	this.score = 0;
	this.level = 1;

	this.state = 2;
	
	updateSprites(false);
	
	setFrameRate(60);

	sounds['beat'].amp(0.4);
	// this.grey_panel = loadImage('assets/grey_panel.png');
	// this.menu_list.push(new Menu([new Button(100, 100, this.grey_panel)]));
}

var gameControl;
var sounds = {};
var fonts = {};
function preload() {
	sounds['paddlehit'] = loadSound('assets/paddlehit.ogg');
	sounds['brickhit'] = loadSound('assets/brickhit.ogg');
	sounds['beat'] = loadSound('assets/beat.ogg');
	sounds['death'] = loadSound('assets/death.ogg');
	for(var i = 1; i < 8; i++) {
		sounds['powerUp'+i] = loadSound('assets/powerUp'+i+'.ogg');
	}
	
	fonts['blocks'] = loadFont('assets/blocks.ttf');
	fonts['future'] = loadFont('assets/future.ttf');
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	gameControl = new GameControl();
}

function draw() {
	background(50);
	gameControl.draw();
}

function keyPressed() {
	switch(keyCode) {
		case 27: gameControl.handlePause(); break;
		case 82: allSprites.clear(); gameControl = new GameControl(); break;
		case 78: gameControl.nextLevel(); break;
		case 76: gameControl.loadGame(); break;
	}
}

function mousePressed() {
	if(gameControl.state === 2) {
		gameControl.changeState(1);
	}
}