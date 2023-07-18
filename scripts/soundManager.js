class SoundManager {
	constructor() {
		this.clips = {} //Звуковые эффекты
		this.context = new AudioContext() //аудиоконтекст
		this.gainNode = this.context.createGain ? this.context.createGain() : this.context.createGainNode() // главный узел
		this.gainNode.connect(this.context.destination) // подключение к динамикам
	}

	async load(path, callback) {
		if (this.clips[path]) {
			callback(this.clips[path])
			return
		}
		let clip = { path: path, buffer: null, loaded: false } // клип, буфер
		// Загружен
		clip.play = (volume, loop) => {
			this.play(path, { looping: loop ? loop : false, volume: volume ? volume : 1 })
		}
		this.clips[path] = clip
		let request = new XMLHttpRequest()
		request.open('GET', path, true)
		request.responseType = 'arraybuffer'
		request.onload = () => {
			this.context.decodeAudioData(request.response, buffer => {
				clip.buffer = buffer
				clip.loaded = true
				callback(clip)
			})
		}
		request.send()
	}

	loadArray(array) {
		return new Promise((resolve, reject) => {
			for (let i = 0; i < array.length; i++) {
				this.load(array[i], () => {
					if (array.length === Object.keys(this.clips).length) {
						for (let sd in this.clips) if (!this.clips[sd].loaded) return
						resolve()
					}
				})
			}
		})
	}

	play(path, settings) {
		let looping = false
		let volume = 1
		if (settings) {
			if (settings.looping) looping = settings.looping
			if (settings.volume) volume = settings.volume
		}
		let sd = this.clips[path]
		if (sd === null) return false
		let sound = this.context.createBufferSource()
		sound.buffer = sd.buffer
		sound.connect(this.gainNode)
		sound.loop = looping
		this.gainNode.gain.value = volume
		sound.start(0)
		return true
	}
}
