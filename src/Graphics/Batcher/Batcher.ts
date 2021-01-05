///<reference path="./GraphicsResource.ts" />
module es {
    export class Batcher extends GraphicsResource implements IBatcher {
        /**
         * 创建投影矩阵时要使用的矩阵
         */
        public get transformMatrix(): Matrix {
            return this._transformMatrix;
        }

        /**
         * 如果为true，则将在绘制目标位置之前将其四舍五入
         */
        public shouldRoundDestinations: boolean = true;

        private _shouldIgnoreRoundingDestinations: boolean;
        private _spriteEffect: SpriteEffect;
        // 跟踪开始/结束调用
        private _beginCalled: boolean;
        private _disableBatching: boolean;

        // 创建投影矩阵时要使用的矩阵
        private _transformMatrix: Matrix;
        // 内部用于计算摄像机投影的矩阵
        private _projectionMatrix: Matrix;
        // 是计算出的sprite shaders中的MatrixTransform参数
        private _matrixTransformMatrix: Matrix;
        // 用户提供的效果
        private _customEffect: egret.CustomFilter;
        private _displayObject: egret.DisplayObject;

        private readonly MAX_SPRITES = 2048;

        static readonly _cornerOffsetX: number[] = [0, 1, 0, 1];
        static readonly _cornerOffsetY: number[] = [0, 0, 1, 1];

        private idDisplayObjectDic: Map<number, egret.DisplayObject>;
        private _id: Ref<number>;

        constructor(graphicsDevice: GraphicsDevice) {
            super();
            Insist.isTrue(graphicsDevice != null);

            this.graphicsDevice = graphicsDevice;
            this._textureInfo = new Array(this.MAX_SPRITES);
            this._spriteEffect = new SpriteEffect();

            this._projectionMatrix = new Matrix();
            this._projectionMatrix.m11 = 0;
            this._projectionMatrix.m12 = 0;
            this._projectionMatrix.m13 = 0;
            this._projectionMatrix.m14 = 0;

            this._projectionMatrix.m21 = 0;
            this._projectionMatrix.m22 = 0;
            this._projectionMatrix.m23 = 0;
            this._projectionMatrix.m24 = 0;

            this._projectionMatrix.m31 = 0;
            this._projectionMatrix.m32 = 0;
            this._projectionMatrix.m33 = 1;
            this._projectionMatrix.m34 = 0;

            this._projectionMatrix.m41 = -1;
            this._projectionMatrix.m42 = 1;
            this._projectionMatrix.m43 = 0;
            this._projectionMatrix.m44 = 1;

            Core.Instance.stage.addChild(this);
            this.idDisplayObjectDic = new Map();
            // 预热displayobject对象
            Pool.warmCache(egret.DisplayObject, 3);

            Core.emitter.addObserver(CoreEvents.clearGraphics, this.clear, this);
        }

        public disposed() {
            this.dispose(true);
        }

        protected dispose(disposing: boolean) {
            if (!this.isDisposed && disposing) {
                this._spriteEffect = null;

                this.idDisplayObjectDic.forEach((displayObject, key)=>{
                    if (displayObject.parent)
                        displayObject.parent.removeChild(displayObject);
                    this.idDisplayObjectDic.delete(key);
                    Pool.free(displayObject);
                });
            }

            super.dispose(disposing);
        }

        /**
         * 移除所有显示对象
         */
        private clear() {
            this.idDisplayObjectDic.forEach((displayObject)=>{
                if (displayObject instanceof egret.Shape) {
                    displayObject.graphics.clear();
                } else if (displayObject instanceof egret.Bitmap) {
                    displayObject.texture = null;
                } else {
                    // unkown type
                }
            });
        }

        public begin(id: Ref<number>, effect: egret.CustomFilter, transformationMatrix: Matrix = Matrix2D.toMatrix(Matrix2D.identity), disableBatching: boolean = false) {
            Insist.isFalse(this._beginCalled, "在最后一次调用Begin后，在调用End之前已经调用了Begin。在End被成功调用之前，不能再调用Begin");
            this._id = id;
            this._beginCalled = true;

            this._customEffect = effect;
            this._transformMatrix = transformationMatrix;
            this._disableBatching = disableBatching;

            if (this._disableBatching)
                this.prepRenderState();

            if (id.value == null){
                id.value = RenderableComponent.renderIdGenerator++;
                this._displayObject = Pool.obtain(egret.DisplayObject);
                this.idDisplayObjectDic.set(id.value, this._displayObject);
            } else {
                this._displayObject = this.idDisplayObjectDic.get(id.value);
            }
        }

        public end() {
            Insist.isTrue(this._beginCalled, "End已经被调用，但Begin还没有被调用。在调用End之前，必须先成功调用Begin");
            this._beginCalled = false;

            this._displayObject.cacheAsBitmap = this._disableBatching;
            if (this._displayObject.parent == null)
                this.addChild(this._displayObject);

            this._customEffect = null;
        }

        public prepRenderState() {
            let viewport = this.graphicsDevice.viewport;
            this._projectionMatrix.m11 = 2 / viewport.width;
            this._projectionMatrix.m22 = -2 / viewport.height;

            this._projectionMatrix.m41 = -1 - 0.5 * this._projectionMatrix.m11;
            this._projectionMatrix.m42 = 1 - 0.5 * this._projectionMatrix.m22;

            Matrix.multiply(this._transformMatrix, this._projectionMatrix, this._matrixTransformMatrix);
            this._spriteEffect.setMatrixTransform(this._matrixTransformMatrix);
        }

        /**
         * 设置是否应忽略位置舍入。在为调试绘制基元时很有用
         * @param shouldIgnore 
         */
        public setIgnoreRoundingDestinations(shouldIgnore: boolean) {
            this._shouldIgnoreRoundingDestinations = shouldIgnore;
        }

        public drawHollowRect(rect: Rectangle, color: number, thickness: number = 1) {
            this.drawHollowBounds(rect.x, rect.y, rect.width, rect.height, color, thickness);
        }

        public drawHollowBounds(x: number, y: number, width: number, height: number, color: number, thickness: number = 1) {
            let tl = Vector2Ext.round(new Vector2(x, y));
            let tr = Vector2Ext.round(new Vector2(x + width, y));
            let br = Vector2Ext.round(new Vector2(x + width, y + height));
            let bl = Vector2Ext.round(new Vector2(x, y + height));

            this.setIgnoreRoundingDestinations(true);
            this.drawLine(tl, tr, color, thickness);
            this.drawLine(tr, br, color, thickness);
            this.drawLine(br, bl, color, thickness);
            this.drawLine(bl, tl, color, thickness);
            this.setIgnoreRoundingDestinations(false);
        }

        public drawLine(start: Vector2, end: Vector2, color: number, thickness) {
            let shape = this._displayObject as egret.Shape;
            shape.graphics.lineStyle(thickness, color);
            shape.graphics.moveTo(start.x, start.y);
            shape.graphics.lineTo(end.x, end.y);
            shape.graphics.endFill();
        }

        public drawPixel(position: Vector2, color: number, size: number = 1) {
            let destRect = new Rectangle(position.x, position.y, size, size);
            if (size != 1) {
                destRect.x -= size * 0.5;
                destRect.y -= size * 0.5;
            }

            let shape = this._displayObject as egret.Shape;
            shape.graphics.lineStyle(size, color);
            shape.graphics.drawRect(destRect.x, destRect.y, destRect.width, destRect.height);
            shape.graphics.endFill();
        }

        public drawPolygon(position: Vector2, points: Vector2[], color: number,
            closePoly: boolean = true, thickness: number = 1) {
            if (points.length < 2)
                return;

            this.setIgnoreRoundingDestinations(true);
            for (let i = 1; i < points.length; i++)
                this.drawLine(Vector2.add(position, points[i - 1]), Vector2.add(position, points[i]), color, thickness);

            if (closePoly)
                this.drawLine(Vector2.add(position, points[points.length - 1]), Vector2.add(position, points[0]), color, thickness);
            this.setIgnoreRoundingDestinations(false);
        }

        public drawCircle(position: Vector2, radius: number, color: number, thickness: number = 1, resolution: number = 12) {
            let last = Vector2.unitX.multiply(new Vector2(radius));
            let lastP = Vector2Ext.perpendicularFlip(last);

            this.setIgnoreRoundingDestinations(true);
            for (let i = 1; i <= resolution; i++) {
                let at = MathHelper.angleToVector(i * MathHelper.PiOver2 / resolution, radius);
                let atP = Vector2Ext.perpendicularFlip(at);

                this.drawLine(Vector2.add(position, last), Vector2.add(position, at), color, thickness);
                this.drawLine(Vector2.subtract(position, last), Vector2.subtract(position, at), color, thickness);
                this.drawLine(Vector2.add(position, lastP), Vector2.add(position, atP), color, thickness);
                this.drawLine(Vector2.subtract(position, lastP), Vector2.subtract(position, atP), color, thickness);

                last = at;
                lastP = atP;
            }

            this.setIgnoreRoundingDestinations(false);
        }

        /**
         * 传入需要绘制的组件或图形ID
         * @param texture 
         * @param position 
         * @param color 
         * @param rotation 
         * @param origin 
         * @param scale 
         * @param effects 
         * @param layerDepth 
         */
        public draw(texture: egret.Texture,
            position: Vector2,
            color: number = 0xffffff,
            rotation: number = 0,
            origin: Vector2 = Vector2.zero,
            scale: Vector2 = Vector2.one,
            effects: SpriteEffects = 0,
            layerDepth: number = 0
        ) {
            this.checkBegin();
            this.pushSprite(texture, null, position.x, position.y, scale.x, scale.y,
                color, origin, rotation, layerDepth, effects & 0x03, 0, 0, 0, 0);
        }

        private checkBegin() {
            if (!this._beginCalled)
                throw new Error("Begin还没有被叫到。在你画画之前，必须先调用Begin");
        }

        private pushSprite(texture: egret.Texture, sourceRectangle: Rectangle = null, destinationX: number, destinationY: number,
            destinationW: number, destinationH: number, color: number, origin: Vector2,
            rotation: number, depth: number, effects: SpriteEffects, skewTopX: number,
            skewBottomX: number, skewLeftY: number, skewRightY: number) {

            if (!this._shouldIgnoreRoundingDestinations && this.shouldRoundDestinations) {
                destinationX = Math.round(destinationX);
                destinationY = Math.round(destinationY);
            }

            let sourceX: number, sourceY: number, sourceW: number, sourceH: number;
            let originX: number, originY: number;
            if (sourceRectangle) {
                let inverseTexW = 1 / texture.textureWidth;
                let inverseTexH = 1 / texture.textureHeight;

                sourceX = sourceRectangle.x * inverseTexW;
                sourceY = sourceRectangle.y * inverseTexH;
                sourceW = sourceRectangle.width * inverseTexW;
                sourceH = sourceRectangle.height * inverseTexH;

                originX = (origin.x / sourceW) * inverseTexW;
                originY = (origin.y / sourceH) * inverseTexH;
            } else {
                sourceX = 0;
                sourceY = 0;
                sourceW = 1;
                sourceH = 1;

                originX = origin.x * (1 / texture.textureWidth);
                originY = origin.y * (1 / texture.textureHeight);
            }

            if (effects != 0) {
                skewTopX *= -1;
                skewBottomX *= -1;
                skewLeftY *= -1;
                skewRightY *= -1;
            }

            let bitmap = this._displayObject as egret.Bitmap;
            bitmap.texture = texture;

            this._displayObject.x = destinationX;
            this._displayObject.y = destinationY;
            this._displayObject.width = destinationW;
            this._displayObject.height = destinationH;
            this._displayObject.rotation = rotation;
            this._displayObject.skewX = skewTopX;
            this._displayObject.skewY = skewLeftY;
            this._displayObject.anchorOffsetX = originX;
            this._displayObject.anchorOffsetY = originY;
        }
    }
}