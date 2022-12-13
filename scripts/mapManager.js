class MapManager {
    constructor() {
        this.mapData = null; // переменная для хранения карты
        this.tLayer = null; // переменная для хранения ссылки на блоки карты
        this.xCount = 0; // количество блоков по горизонтали
        this.yCount = 0; // количество блоков по вертикали
        this.tSize = { x: 64, y: 64 }; // размер блока
        this.mapSize = { x: 64, y: 64 }; // размер карты в пикселах(вычисляется)
        this.tilesets = []; // массив описаний блоков карты
        this.imgLoadCount = 0; // количество загруженных изображений
        this.view = { x: 0, y: 0, w: 800, h: 600 }; // видимая область с координатами левого верхнего угла
    }

    parseMap(tilesJSON) {
        return new Promise((resolve) =>{
            this.mapData = tilesJSON; // разобрать JSON
            this.xCount = this.mapData.width; // сохранение ширины
            this.yCount = this.mapData.height; // сохранение высоты
            this.tSize.x = this.mapData.tilewidth; // сохранение размера блока
            this.tSize.y = this.mapData.tileheight; // сохранение размера блока
            this.mapSize.x = this.xCount * this.tSize.x; // вычисление размера карты
            this.mapSize.y = this.yCount * this.tSize.y; // вычисление размера карты
            for (let i = 0; i < this. mapData.tilesets.length; i++) {
                const img = new Image(); // создаем переменную для хранения изображений
                img.onload = () => { // при загрузке изображения
                    this.imgLoadCount++; // увеличиваем счетчик
                    if (this.imgLoadCount === this.mapData.tilesets.length) {
                        resolve(); // загружены все изображения
                    }
                }; // конец описания функции onload
                img.src = this.mapData.tilesets[i].image; // задание пути к изображению
                const t = this.mapData.tilesets[i]; // забирает tileset из карты
                const ts = { // создаем свой объект tileset
                    firstgid: t.firstgid, // firstgid - с него начинается нумерация в data
                    image: img, // объект рисунка
                    name: t.name, // имя элемента рисунка
                    xCount: Math.floor(t.imagewidth / this.tSize.x), // горизонталь
                    yCount: Math.floor(t.imageheight / this.tSize.y) // вертикаль
                }; // конец объявления объекта ts
                this.tilesets.push(ts); // сохраняем tilescet в массив
            }
        });

    }

    draw(ctx) { // нарисовать карту в контексте
        // если карта не загружена, то повторить прорисовку через 100 мс
            if (this.tLayer === null)  { // проверить, что tLayer настроен
                for (let id = 0; id < this.mapData.layers.length; id++) {
                    // проходим по всем layer карты
                    const layer = this.mapData.layers[id];
                    if (layer.type === "tilelayer") { // если не tilelayer - пропускаем
                        this.tLayer = layer;
                        break;
                    }
                }
            }
            for (let i = 0; i < this.tLayer.data.length; i++) { // пройти по всей карте
                if (this.tLayer.data[i] !== 0) { // если нет данных - пропускаем
                    const tile = this.getTile(this.tLayer.data[i]); // получение блока по индексу
                    // i проходит линейно по массиву, xCount - длина по x
                    let pX = (i % this.xCount) * this.tSize.x; // вычисляем x в пикселах
                    let pY = Math.floor(i / this.xCount) * this.tSize.y; // вычисляем y
                    // не рисуем за пределами видимой зоны
                    if (!this.isVisible(pX, pY, this.tSize.x, this.tSize.y)) {
                        continue;
                    }
                    // сдвигаем видимую зону
                    pX -= this.view.x;
                    pY -= this.view.y;
                    ctx.drawImage(tile.img, tile.px, tile.py, this.tSize.x, // рисуем контекст
                        this.tSize.y, pX, pY, this.tSize.x, this.tSize.y);
                }
            }
    }

    isVisible(x, y ,width, height) { // не рисуем за пределами видимой зоны
        return !(x + width < this.view.x || y + height < this.view.y ||
            x > this.view.x + this.view.w || y > this.view.y + this.view.h);
    }

    getTile(tilelndex) { // индекс блока
        const tile = {
            img: null, // изображение tileset
            px: 0, py: 0 // координаты блока в tileset
        }
        const tileset = this.getTileset(tilelndex);
        tile.img = tileset.image; // изображение искомого tileset
        const id = tilelndex - tileset.firstgid; // индекс блока в tileset
        // блок прямоугольный, остаток от деления на xCount дает x в tileset
        const x = id % tileset.xCount;
        // округление от деления на xCount дает y в tileset
        const y = Math.floor(id / tileset.xCount);
        // с учетом размера можно посчитать координаты блока в пикселях
        tile.px = x * this.tSize.x;
        tile.py = y * this.tSize.y;
        return tile; // возвращаем блока для отображения
    }

    getTileset(tileIndex) { // получения блока по индексу
        for (let i = this.tilesets.length-1; i >= 0; i--) {
            // в каждом tilesets[i].firstgrid записано число, с которого начинается нумерация блоков
            if (this.tilesets[i].firstgid <= tileIndex) {
                // если индекс первого блока меньше либо равен искомому, значит этот tileset и нужен
                return this.tilesets[i];
            }
        }
        return null; // возвращается найденный tileset
    }

     loadMap(path) {
        return new Promise(async (resolve) => {
            const res = await fetch(path);
            const data = await res.json();
            await this.parseMap(data);
            resolve();
        })
    }

    getEntities() {
        for (let j = 0; j < this.mapData.layers.length; j++) {
            // просмотр всех слоев
            if (this.mapData.layers[j].type === 'objectgroup') {
                return this.mapData.layers[j];
            }
        }

    }

    getTilesetIdx(x, y) {
        const wX = x;
        const wY = y;
        const idx = Math.floor(wY / this.tSize.y) * this.xCount + Math.floor(wX / this.tSize.x);
        return this.tLayer.data[idx]
    }

    centerAt(x, y) {
        if (x < this.view.w / 2) { // центрирование по горизонтали
            this.view.x = 0;
        } else if (x > this.mapSize.x - this.view.w / 2){
            this.view.x = this.mapSize.x - this.view.w;
        } else {
            this.view.x = x - (this.view.w / 2);
        }
        if (y < this.view.h / 2) { // центрирование по вертикали
            this.view.y = 0;
        } else if (y > this.mapSize.y - this.view.h / 2){
            this.view.y = this.mapSize.y - this.view.h;
        } else {
            this.view.y = y - (this.view.h / 2);
        }
    }
}









