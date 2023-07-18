class Entity {
	constructor(mapManager, spriteManager, gameManager, soundManager) {
		this.mapManager = mapManager
		this.spriteManager = spriteManager
		this.gameManager = gameManager
		this.soundManager = soundManager
		this.physicManager = new PhysicManager(mapManager, gameManager)
		this.pos_x = 0
		this.pos_y = 0
		this.size_x = 0
		this.size_y = 0
	}

	kill() {
		this.gameManager.laterKill.push(this)
	}
}

class Player extends Entity {
	constructor(mapManager, spriteManager, gameManager, soundManager) {
		super(mapManager, spriteManager, gameManager, soundManager)
		this.lifetime = 100
		this.ammuniton = 100
		this.damage = 5
		this.move_x = 0 // направления движения
		this.move_y = 0
		this.speed = 2
	}

	draw(ctx) {
		let move = 'right'
		if (this.move_x === -1 && this.move_y === 0) {
			move = 'left'
		} else if (this.move_x === 0 && this.move_y === 1) {
			move = 'down'
		} else if (this.move_x === 0 && this.move_y === -1) {
			move = 'up'
		}
		this.spriteManager.drawSprite(this.mapManager, ctx, `player_${move}`, this.pos_x, this.pos_y)
	}

	update() {
		this.physicManager.update(this)
	}

	onTouchEntity(obj) {
		if (obj.name === 'medkit') {
			this.lifetime += 50
			if (this.lifetime > 100) this.lifetime = 100
			this.soundManager.play('assets/sounds/pick_up_medkit.mp3', {
				volume: 0.2
			})
			obj.kill()
		}
		if (obj.name === 'ammo') {
			this.ammuniton += 50
			if (this.ammuniton > 100) this.ammuniton = 100
			this.soundManager.play('assets/sounds/pick_up_ammo.mp3', {
				volume: 0.2
			})
			obj.kill()
		}
		if (obj.name === 'portal') {
			this.soundManager.play('assets/sounds/teleport.mp3', { volume: 1 })
			obj.kill()
		}
		if (obj.name === 'spider') {
			this.soundManager.play('assets/sounds/spider_bite.mp3', {
				volume: 0.2
			})
		}
	}

	fire() {
		if (this.ammuniton <= 0) return
		const b = new Bullet(this.mapManager, this.spriteManager, this.gameManager, this.soundManager)
		this.ammuniton--
		b.size_x = 14 // необходимо задать размеры создаваемому объекту
		b.size_y = 14
		b.name = 'gun' // используется счетчик выстрелов
		if (!(this.move_x === 0 && this.move_y === 0)) {
			b.move_x = this.move_x
			b.move_y = this.move_y
		}
		switch (b.move_x + 2 * b.move_y) {
			case -1: // выстрел влево
				b.pos_x = this.pos_x - b.size_x // появиться слева от игрока
				b.pos_y = this.pos_y
				break
			case 1: // выстрел вправо
				b.pos_x = this.pos_x + this.size_x // появиться справа от игрока
				b.pos_y = this.pos_y
				break
			case -2: // выстрел вверх
				b.pos_x = this.pos_x // появиться сверху от игрока
				b.pos_y = this.pos_y - b.size_y
				break
			case 2: // выстрел вниз
				b.pos_x = this.pos_x // появиться снизу от игрока
				b.pos_y = this.pos_y + this.size_y
				break
			case 3: // выстрел вниз
				b.pos_x = this.pos_x // появиться снизу от игрока
				b.pos_y = this.pos_y + this.size_y
				break
			case -3: // выстрел вниз
				b.pos_x = this.pos_x + this.size_x // появиться справа от игрока
				b.pos_y = this.pos_y
				break
			default:
				this.ammuniton++
				return
		}
		this.gameManager.entities.push(b)
		this.soundManager.play('assets/sounds/shot.mp3', { volume: 0.2 })
	}
}

class Spider extends Entity {
	constructor(mapManager, spriteManager, gameManager, soundManager) {
		super(mapManager, spriteManager, gameManager, soundManager)
		this.lifetime = 100
		this.damage = 1
		this.move_x = 0 // направления движения
		this.move_y = 0
		this.speed = 1
	}

	draw(ctx) {
		let move = 'right'
		if (this.move_x === 1 && this.move_y === 1) {
			move = 'down'
		} else if (this.move_x === 1 && this.move_y === -1) {
			move = 'up'
		} else if (this.move_x === -1 && this.move_y === 1) {
			move = 'down'
		} else if (this.move_x === -1 && this.move_y === -1) {
			move = 'left'
		}
		this.spriteManager.drawSprite(this.mapManager, ctx, `spider_${move}`, this.pos_x, this.pos_y)
	}

	update() {
		if (this.lifetime <= 0) {
			this.kill()
			this.soundManager.play('assets/sounds/spider_dead.mp3', {
				volume: 0.2
			})
			return
		}
		this.move_x = this.pos_x < this.gameManager.player.pos_x ? 1 : -1
		this.move_y = this.pos_y < this.gameManager.player.pos_y ? 1 : -1
		// this.pos_x += Math.floor(this.speed) * (this.pos_x < this.gameManager.player.pos_x ? 1 : -1)
		// this.pos_y += Math.floor(this.speed) * (this.pos_y < this.gameManager.player.pos_y ? 1 : -1)
		this.physicManager.update(this)
	}

	onTouchEntity(obj) {
		if (obj.name === 'player') {
			obj.lifetime -= this.damage
			this.gameManager.player.lifetime -= this.damage
		}
		if (obj.name === 'bullet') {
			this.lifetime -= this.gameManager.player.damage
		}
	}
}

class Bullet extends Entity {
	constructor(mapManager, spriteManager, gameManager, soundManager) {
		super(mapManager, spriteManager, gameManager, soundManager)
		this.move_x = 1 // направления движения
		this.move_y = 0
		this.speed = 35
	}

	draw(ctx) {
		let move = 'right'
		if (this.move_x === -1 && this.move_y === 0) {
			move = 'left'
		} else if (this.move_x === 0 && this.move_y === 1) {
			move = 'down'
		} else if (this.move_x === 0 && this.move_y === -1) {
			move = 'up'
		} else if (this.move_x === 1 && this.move_y === 1) {
			move = 'downright'
		} else if (this.move_x === 1 && this.move_y === -1) {
			move = 'upright'
		} else if (this.move_x === -1 && this.move_y === 1) {
			move = 'downleft'
		} else if (this.move_x === -1 && this.move_y === -1) {
			move = 'dowbright'
		}
		this.spriteManager.drawSprite(this.mapManager, ctx, `bullet_${move}`, this.pos_x, this.pos_y)
	}

	update() {
		this.physicManager.update(this)
	}

	onTouchEntity(obj) {
		if (obj.name === 'spider') {
			obj.lifetime -= this.gameManager.player.damage
		}
		this.kill()
	}

	onTouchMap(idx) {
		this.kill()
	}
}

class Medkit extends Entity {
	constructor(mapManager, spriteManager, gameManager, soundManager) {
		super(mapManager, spriteManager, gameManager, soundManager)
	}

	draw(ctx) {
		this.spriteManager.drawSprite(this.mapManager, ctx, 'medkit', this.pos_x, this.pos_y)
	}
}

class Ammo extends Entity {
	constructor(mapManager, spriteManager, gameManager, soundManager) {
		super(mapManager, spriteManager, gameManager, soundManager)
	}

	draw(ctx) {
		this.spriteManager.drawSprite(this.mapManager, ctx, 'ammo', this.pos_x, this.pos_y)
	}
}

class Portal extends Entity {
	constructor(mapManager, spriteManager, gameManager, soundManager) {
		super(mapManager, spriteManager, gameManager, soundManager)
	}

	draw(ctx) {
		this.spriteManager.drawSprite(this.mapManager, ctx, 'portal', this.pos_x, this.pos_y)
	}
}
