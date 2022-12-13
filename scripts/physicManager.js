class PhysicManager {
    constructor(mapManager, gameManager) {
        this.mapManager = mapManager;
        this.gameManager = gameManager;
    }

    update(obj) {
        if (obj.lifetime <= 0)
            obj.kill();
        if (obj.move_x === 0 && obj.move_y === 0) {
            return; // скорости движения нулевые
        }
        const newX = obj.pos_x + Math.floor(obj.move_x * obj.speed);
        const newY = obj.pos_y + Math.floor(obj.move_y * obj.speed);
        // анализ пространства на карте по направлению движения
        const ts = this.mapManager.getTilesetIdx(newX + obj.size_x/2, newY + obj.size_y/2);
        // console.log(obj.move_x, obj.move_y)
        // console.log(ts)
        const e = this.entityAtXY(obj, newX, newY); // объект на пути
        if (e !== null && obj.onTouchEntity) // если есть конфликт
            obj.onTouchEntity(e); //разбор конфликта внутри объекта
        if (ts !== 5 && obj.onTouchMap) // есть препятствие
            obj.onTouchMap(ts); // разбор конфликта с препятствием внутри объекта
        if (ts === 5 && e === null) { // перемещаем объект на свободное место
            obj.pos_x = newX;
            obj.pos_y = newY;
        }
    }

    entityAtXY(obj, x, y) { // поиск объекта по координатам
        for (let i = 0; i < this.gameManager.entities.length; i++) {
            const e = this.gameManager.entities[i]; // все объекты карты
            if (e.name !== obj.name) { // имя не совпадает(имена уникальны)
                if (x + obj.size_x < e.pos_x ||
                    y + obj.size_y < e.pos_y ||
                    x > e.pos_x + e.size_x ||
                    y > e.pos_y + e.size_y)
                    continue;
                return e; // найден объект
            }
        }
        return null; // объект не найден
    }
}