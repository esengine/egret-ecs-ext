module es {
    export class SpriteRenderer extends RenderableComponent {
        public get bounds(): Rectangle {
            if (this._areBoundsDirty) {
                if (this._sprite != null)
                    this._bounds.calculateBounds(this.entity.transform.position, this._localOffset, this._origin,
                        this.entity.transform.scale, this.entity.transform.rotation, this._sprite.sourceRect.width,
                        this._sprite.sourceRect.height);
                this._areBoundsDirty = false;
            }

            return this._bounds;
        }

        public get width() {
            return this.bounds.width;
        }

        public get height() {
            return this._bounds.height;
        }

        constructor(sprite: Sprite | egret.Texture = null) {
            super();
            if (sprite instanceof Sprite)
                this.setSprite(sprite);
            else if (sprite instanceof egret.Texture)
                this.setSprite(new Sprite(sprite));
        }

        protected _origin: Vector2;

        /**
         * 精灵的原点。这是在设置精灵时自动设置的
         */
        public get origin(): Vector2 {
            return this._origin;
        }

        /**
         * 精灵的原点。这是在设置精灵时自动设置的
         * @param value
         */
        public set origin(value: Vector2) {
            this.setOrigin(value);
        }

        /**
         * 用于以规范化方式设置原点的辅助对象属性（0-1表示x和y）
         */
        public get originNormalized() {
            return new Vector2(this._origin.x / this.width * this.entity.transform.scale.x, 
                this._origin.y / this.height * this.entity.transform.scale.y);
        }

        public set originNormalized(value: Vector2) {
            this.setOrigin(new Vector2(value.x * this.width / this.entity.transform.scale.x,
                value.y * this.height / this.entity.transform.scale.y));
        }

        /**
         * 确定精灵是正常渲染还是垂直翻转
         */
        public get flipY(): boolean {
            return (this.spriteEffects & SpriteEffects.flipVertically) == SpriteEffects.flipHorizontally;
        }

        public set flipY(value: boolean) {
            this.spriteEffects = value ? (this.spriteEffects | SpriteEffects.flipVertically) : (this.spriteEffects & ~SpriteEffects.flipVertically);
        }

        public get flipX(): boolean {
            return (this.spriteEffects & SpriteEffects.flipHorizontally) == SpriteEffects.flipHorizontally;
        }

        public set flipX(value: boolean) {
            this.spriteEffects = value ? (this.spriteEffects | SpriteEffects.flipHorizontally) : (this.spriteEffects & ~SpriteEffects.flipHorizontally);
        }

        /**
         * 渲染时，批处理程序传递给批处理程序。flipX/flipY是设置此项的帮助程序
         */
        public spriteEffects: SpriteEffects = SpriteEffects.none;

        protected _sprite: Sprite;

        /**
         * 应该由这个精灵显示的精灵
         * 当设置时，精灵的原点也被设置为精灵的origin
         */
        public get sprite(): Sprite {
            return this._sprite;
        }

        /**
         * 应该由这个精灵显示的精灵
         * 当设置时，精灵的原点也被设置为精灵的origin
         * @param value
         */
        public set sprite(value: Sprite) {
            this.setSprite(value);
        }

        /**
         * 设置精灵并更新精灵的原点以匹配sprite.origin
         * @param sprite
         */
        public setSprite(sprite: Sprite): SpriteRenderer {
            this._sprite = sprite;
            if (this._sprite) {
                this._origin = this._sprite.origin;
                this._areBoundsDirty = true;
            }

            return this;
        }

        /**
         * 设置可渲染的原点
         * @param origin
         */
        public setOrigin(origin: Vector2): SpriteRenderer {
            if (!this._origin.equals(origin)) {
                this._origin = origin;
            }

            return this;
        }

        /**
         * 用于以规范化方式设置原点的辅助对象（0-1表示x和y）
         * @param value 
         */
        public setOriginNormalized(value: Vector2) {
            this.setOrigin(new Vector2(value.x * this.width / this.entity.transform.scale.x, value.y * this.height / this.entity.transform.scale.y));
        }

        /**
         * 用轮廓绘制可渲染对象。请注意，这应该在禁用的可渲染对象上调用，因为如果它们需要一个ouline，就不应该参与默认渲染
         * @param batcher 
         * @param camera 
         * @param outlineColor 
         * @param offset 
         */
        public drawOutline(batcher: Batcher, camera: Camera, outlineColor: number = 0x000000, offset: number = 1) {
            let originalPosition = this._localOffset.clone();
            let originalColor = this.color;
            let originalLayerDepth = this._layerDepth;

            this.color = outlineColor;
            this._layerDepth += 0.01;

            for (let i = -1; i < 2; i++)
                for (let j = -1; j < 2; j++)
                    if (i != 0 || j != 0) {
                        this._localOffset = Vector2.add(originalPosition, new Vector2(i * offset, j * offset));
                        this.render(batcher, camera);
                    }

            this._localOffset = originalPosition;
            this.color = originalColor;
            this._layerDepth = originalLayerDepth;
        }

        /**
         * @override
         * @param batcher 
         * @param camera 
         */
        public render(batcher: Batcher, camera: Camera) {
            batcher.draw(this.sprite.texture2D, Vector2.add(this.entity.transform.position, this.localOffset), this.color,
                this.entity.transform.rotation, this.origin, this.entity.transform.scale, this.spriteEffects, this._layerDepth);
        }
    }
}