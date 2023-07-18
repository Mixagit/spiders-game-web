class GameManager {
	constructor() {
		this.mapManager = new MapManager()
		this.spriteManager = new SpriteManager()
		this.eventsManager = new EventsManager()
		this.soundManager = new SoundManager()
		this.scoreTime = 0
		this.forScore = 1000
		this.tick = 20 // кадры
		this.curLevel = 1
		this.finalLevel = 2
		this.entities = [] //объекты на карте
		this.player = null // указатель на объект игрока
		this.laterKill = [] // отложенное уничтожение объектов
	}

	createObjects() {
		const entities = this.mapManager.getEntities()
		for (let i = 0; i < entities.objects.length; i++) {
			const e = entities.objects[i]
			try {
				let obj
				if (e.name === 'player') {
					obj = new Player(this.mapManager, this.spriteManager, this, this.soundManager)
					this.player = obj
				} else if (e.name === 'spider') {
					obj = new Spider(this.mapManager, this.spriteManager, this, this.soundManager)
				} else if (e.name === 'medkit') {
					obj = new Medkit(this.mapManager, this.spriteManager, this, this.soundManager)
				} else if (e.name === 'ammo') {
					obj = new Ammo(this.mapManager, this.spriteManager, this, this.soundManager)
				} else if (e.name === 'portal') {
					obj = new Portal(this.mapManager, this.spriteManager, this, this.soundManager)
				}
				obj.name = e.name
				obj.pos_x = e.x
				obj.pos_y = e.y
				obj.size_x = e.width
				obj.size_y = e.height
				this.entities.push(obj)
			} catch (ex) {
				console.log('Error while creating: [' + e.gid + ']' + e.type + ',' + ex) // сообщение об ошибке
			}
		}
	}

	async update(ctx) {
		if (this.player === null) return

		if (this.player.lifetime <= 0) {
			this.gameOver()
		}
		if (!this.entities.find(e => e.name === 'portal')) {
			// условие перехода на следующий уровень
			clearInterval(this.idInterval)
			this.curLevel += 1
			await this.level_up()
			this.idInterval = setInterval(() => this.update(this.ctx), this.tick)
		}
		// по умолчанию игрок никуда не двигается
		this.player.move_x = 0
		this.player.move_y = 0
		// поймали событие - обрабатываем
		if (this.eventsManager.action['up']) this.player.move_y = -1
		if (this.eventsManager.action['down']) this.player.move_y = 1
		if (this.eventsManager.action['left']) this.player.move_x = -1
		if (this.eventsManager.action['right']) this.player.move_x = 1
		// стреляем
		if (this.eventsManager.action['fire']) this.player.fire()
		// обновление информации по всем объектам на карте
		this.entities.forEach(e => {
			try {
				// защита от ошибок при выполнении update
				e.update()
			} catch (ex) {}
		})
		// удаление всех объектов, попавших в laterKill
		for (let i = 0; i < this.laterKill.length; i++) {
			const idx = this.entities.indexOf(this.laterKill[i])
			if (idx > -1) {
				this.entities.splice(idx, 1) // удаление из массива 1 объекта
			}
		}
		if (this.laterKill.length > 0) {
			// очистка массива laterKill
			this.laterKill.length = 0
		}
		this.mapManager.draw(ctx)
		this.mapManager.centerAt(this.player.pos_x, this.player.pos_y)
		// console.log(this.entities)
		this.drawEntities(ctx)
		this.drawPlayerParams(ctx)
	}

	drawPlayerParams(ctx) {
		// HP
		ctx.beginPath()
		ctx.rect(10, 10, this.player.lifetime, 25)
		ctx.closePath()
		ctx.strokeStyle = 'blue'
		ctx.fillStyle = 'red'
		ctx.fill()
		ctx.stroke()
		//
		// ctx.fillStyle = "#00F";
		// ctx.font = "italic 15pt Arial";
		// ctx.fillText(`Time: ${this.player.lifetime}`, 100, 30);
		// ammo
		ctx.beginPath()
		ctx.rect(10, 50, this.player.ammuniton, 25)
		ctx.closePath()
		ctx.strokeStyle = 'blue'
		ctx.fillStyle = 'green'
		ctx.fill()
		ctx.stroke()

		// ctx.fillStyle = "#00F";
		// ctx.font = "italic 15pt Arial";
		// ctx.fillText(`Time: ${this.player.ammuniton}`, 100, 70);
		// score
		this.forScore -= 20
		if (this.forScore === 0) {
			this.scoreTime += 1
			this.forScore = 1000
		}
		ctx.fillStyle = '#00F'
		ctx.font = 'italic 15pt Arial'
		ctx.fillText(`Time: ${this.scoreTime}`, 10, 110)
	}

	drawEntities(ctx) {
		for (let e = 0; e < this.entities.length; e++) {
			this.entities[e].draw(ctx)
		}
	}

	async init() {
		this.canvas = document.getElementById('canvasId')
		this.ctx = this.canvas.getContext('2d')
		await this.spriteManager.loadAtlas('assets/data/atlas.json', 'assets/images/entities.png')
		this.eventsManager.setup(this.canvas)
		await this.soundManager.loadArray([
			'assets/sounds/soundtrack_level_1.mp3',
			'assets/sounds/soundtrack_level_2.mp3',
			'assets/sounds/level_up.mp3',
			'assets/sounds/teleport.mp3',
			'assets/sounds/pick_up_ammo.mp3',
			'assets/sounds/pick_up_medkit.mp3',
			'assets/sounds/spider_bite.mp3',
			'assets/sounds/spider_dead.mp3',
			'assets/sounds/shot.mp3',
			'assets/sounds/game_over.mp3'
		])
	}

	async loadLevel() {
		await this.mapManager.loadMap(`assets/data/level_${this.curLevel}.json`)
		this.mapManager.draw(this.ctx)
		this.entities = []
		this.drawEntities(this.ctx)
		this.createObjects()
		this.soundManager.play('assets/sounds/soundtrack_level_1.mp3', { volume: 0.00005 })
	}

	async level_up() {
		if (this.finalLevel + 1 === this.curLevel) {
			this.gameOver()
		}
		this.soundManager.play('assets/sounds/level_up.mp3', { volume: 1 })
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
		this.mapManager = new MapManager()
		await this.loadLevel()
	}

	gameOver() {
		if (this.player.lifetime <= 0) {
			window.location.href = 'gameover.html'
			return
		}
		this.soundManager.play('assets/sounds/game_over.mp3', { volume: 0.2 })
		clearInterval(this.idInterval)
		updateLeaderboard(this.scoreTime)
		window.location.href = 'leaderboard.html'
	}

	async play() {
		await this.init()
		await this.loadLevel()
		this.idInterval = setInterval(() => this.update(this.ctx), this.tick)
	}
}
