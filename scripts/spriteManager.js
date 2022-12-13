class SpriteManager {
    constructor() {
        this.image = new Image();
        this.sprites = [];
    }

    loadAtlas(atlasJson, atlasImg){
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();
            request.onreadystatechange = async () => {
                if (request.readyState === 4 && request.status === 200){
                    this.parseAtlas(request.responseText);
                    await this.loadImg(atlasImg);
                    resolve();
                }
            };
            request.open("GET", atlasJson, true);
            request.send();
        })
    }

    loadImg(imgName) {
        return new Promise((resolve) => {
            this.image.onload = async () => {
                resolve();
            };
            this.image.src = imgName;
        })
    }

    parseAtlas(atlasJSON){
        let atlas = JSON.parse(atlasJSON);
        for (let name in atlas.frames){
            let frame = atlas.frames[name].frame;
            this.sprites.push({name: name, x:frame.x, y:frame.y, w: frame.w, h:frame.h});
        }
    }

    getSprite(name){
        for (let i = 0; i < this.sprites.length; i++){
            if (this.sprites[i].name === name) {return this.sprites[i]; }
        }
        return null;
    }

    drawSprite(mapManager, ctx, name, x, y) {
        const sprite = this.getSprite(name);
        if (!mapManager.isVisible(x, y, sprite.w, sprite.h)) return;
        x -= mapManager.view.x;
        y -= mapManager.view.y;
        ctx.drawImage(this.image, sprite.x, sprite.y, sprite.w, sprite.h, x, y, sprite.w, sprite.h);
    }
}


