module es {
    /**
     * 代表纹理图谱中的单个元素，由纹理和帧的源矩形组成
     */
    export class Sprite {
        /** 实际的Texture2D */
        public texture2D: egret.Texture;
        /** 该元素的Texture2D中的矩形 */
        public readonly sourceRect: Rectangle;
        /** 纹理区域的UVs */
        public readonly uvs: Rectangle = new Rectangle();
        /** 如果它的原点是0,0，那么它就是sourceRect的中心 */
        public readonly center: Vector2;
        /** RenderableComponent在使用该Sprite时应该使用的原点。默认为中心 */
        public origin: Vector2;

        constructor(texture: egret.Texture,
            sourceRect: Rectangle = new Rectangle(0, 0, texture.textureWidth, texture.textureHeight),
            origin: Vector2 = sourceRect.getHalfSize()) {
            this.texture2D = texture;
            this.sourceRect = sourceRect;
            this.center = new Vector2(sourceRect.width * 0.5, sourceRect.height * 0.5);
            this.origin = origin;

            let inverseTexW = 1 / texture.textureWidth;
            let inverseTexH = 1 / texture.textureHeight;

            this.uvs.x = sourceRect.x * inverseTexW;
            this.uvs.y = sourceRect.y * inverseTexH;
            this.uvs.width = sourceRect.width * inverseTexW;
            this.uvs.height = sourceRect.height * inverseTexH;
        }

        public clone(): Sprite {
            return new Sprite(this.texture2D, this.sourceRect, this.origin);
        }

        /**
         * 提供一个Sprites列表，给定一个等行/等列的Sprites图集
         * @param texture
         * @param cellWidth
         * @param cellHeight
         * @param cellOffset 处理时要包含的第一个单元格。基于0的索引
         * @param maxCellsToInclude 包含的最大单元
         */
        public static spritesFromAtlas(texture: egret.Texture, cellWidth: number, cellHeight: number,
            cellOffset: number = 0, maxCellsToInclude: number = Number.MAX_VALUE) {
            let sprites: Sprite[] = [];
            let cols = texture.textureWidth / cellWidth;
            let rows = texture.textureHeight / cellHeight;
            let i = 0;
            let spriteSheet = new egret.SpriteSheet(texture);

            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    // 跳过第一个cellOffset之前的所有内容
                    if (i++ < cellOffset) continue;

                    let texture = spriteSheet.getTexture(`${y}_${x}`);
                    if (!texture)
                        texture = spriteSheet.createTexture(`${y}_${x}`, x * cellWidth, y * cellHeight, cellWidth, cellHeight);
                    sprites.push(new Sprite(texture));

                    if (sprites.length == maxCellsToInclude) return sprites;
                }
            }

            return sprites;
        }
    }
}