class EventsManager {
	constructor() {
		this.bind = {} // сопоставление клавиш действиям
		this.action = {} // действия
	}

	setup(canvas) {
		// настройка сопоставления
		this.bind[87] = 'up'
		this.bind[65] = 'left'
		this.bind[83] = 'down'
		this.bind[68] = 'right'
		this.bind[32] = 'fire'
		// контроль событий мыши
		canvas.addEventListener('mousedown', this.onMouseDown.bind(this))
		canvas.addEventListener('mouseup', this.onMouseUp.bind(this))
		// контроль событий клавиатуры
		document.body.addEventListener('keydown', this.onKeyDown.bind(this))
		document.body.addEventListener('keyup', this.onKeyUp.bind(this))
	}

	onMouseDown(event) {
		// нажатие на клавишу мыши
		this.action['fire'] = true
		// setTimeout(() => this.onMouseUp(event), 100);
	}

	onMouseUp(event) {
		// отпустили клавишу мыши
		this.action['fire'] = false
	}
	onKeyDown(event) {
		const action = this.bind[event.keyCode]
		if (action) {
			this.action[action] = true // согласились выполнять действие
		}
	}

	onKeyUp(event) {
		// на клавиатуре проверили, есть ли сопоставление действию для события с кодом keyCode
		const action = this.bind[event.keyCode]
		if (action) {
			this.action[action] = false // согласились выполнять действие
		}
	}
}
