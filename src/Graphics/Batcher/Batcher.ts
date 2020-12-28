///<reference path="./GraphicsResource.ts" />
module es {
    export class Batcher extends GraphicsResource {
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
        private _textureInfo: egret.DisplayObject[];
        private _spriteEffect: SpriteEffect;
        // 跟踪开始/结束调用
        private _beginCalled: boolean;
        private _disableBatching: boolean;
        // 本批次有多少个精灵
        private _numSprites: number;

        // 创建投影矩阵时要使用的矩阵
        private _transformMatrix: Matrix;
        // 内部用于计算摄像机投影的矩阵
        private _projectionMatrix: Matrix;
        // 是计算出的sprite shaders中的MatrixTransform参数
        private _matrixTransformMatrix: Matrix;
        // 用户提供的效果
        private _customEffect: egret.CustomFilter;

        private readonly MAX_SPRITES = 2048;

        static readonly _cornerOffsetX: number[] = [0, 1, 0, 1];
        static readonly _cornerOffsetY: number[] = [0, 0, 1, 1];

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
        }

        protected dispose(disposing: boolean) {
            if (!this.isDisposed && disposing) {
                this._spriteEffect = null;
            }

            super.dispose(disposing);
        }

        public begin(effect: egret.CustomFilter, transformationMatrix: Matrix, disableBatching: boolean) {
            Insist.isFalse(this._beginCalled, "在最后一次调用Begin后，在调用End之前已经调用了Begin。在End被成功调用之前，不能再调用Begin");
            this._beginCalled = true;

            this._customEffect = effect;
            this._transformMatrix = transformationMatrix;
            this._disableBatching = disableBatching;

            if (this._disableBatching)
                this.prepRenderState();
        }

        public end() {
            Insist.isTrue(this._beginCalled, "End已经被调用，但Begin还没有被调用。在调用End之前，必须先成功调用Begin");
            this._beginCalled = false;

            if (!this._disableBatching)
                this.flushBatch();

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
            this.drawLineAngle(start, MathHelper.angleBetweenVectors(start, end), Vector2.distance(start, end), color, thickness);
        }

        public drawLineAngle(start: Vector2, radians: number, length: number, color: number, thickness: number) {

        }

        public draw(texture: egret.DisplayObject, position: Vector2) {
            this.checkBegin();
            this.pushSprite(texture, null, position.x, position.y, 1, 1,
                0xffffff, Vector2.zero, 0, 0, 0, false, 0, 0, 0, 0);
        }

        private checkBegin() {
            if (!this._beginCalled)
                throw new Error("Begin还没有被叫到。在你画画之前，必须先调用Begin");
        }

        private pushSprite(texture: egret.DisplayObject, sourceRectangle: Rectangle = null, destinationX: number, destinationY: number,
            destinationW: number, destinationH: number, color: number, origin: Vector2,
            rotation: number, depth: number, effects, destSizeInPixels: boolean, skewTopX: number,
            skewBottomX: number, skewLeftY: number, skewRightY: number) {
            if (this._numSprites >= this.MAX_SPRITES)
                this.flushBatch();

            if (!this._shouldIgnoreRoundingDestinations && this.shouldRoundDestinations) {
                destinationX = Math.round(destinationX);
                destinationY = Math.round(destinationY);
            }

            let sourceX: number, sourceY: number, sourceW: number, sourceH: number;
            let originX: number, originY: number;
            if (sourceRectangle) {
                let inverseTexW = 1 / texture.width;
                let inverseTexH = 1 / texture.height;

                sourceX = sourceRectangle.x * inverseTexW;
                sourceY = sourceRectangle.y * inverseTexH;
                sourceW = sourceRectangle.width * inverseTexW;
                sourceH = sourceRectangle.height * inverseTexH;

                originX = (origin.x / sourceW) * inverseTexW;
                originY = (origin.y / sourceH) * inverseTexH;

                if (!destSizeInPixels) {
                    destinationW *= sourceRectangle.width;
                    destinationH *= sourceRectangle.height;
                }
            } else {
                sourceX = 0;
                sourceY = 0;
                sourceW = 1;
                sourceH = 1;

                originX = origin.x * (1 / texture.width);
                originY = origin.y * (1 / texture.height);

                if (!destSizeInPixels) {
                    destinationW *= texture.width;
                    destinationH *= texture.height;
                }
            }

            let rotationMatrix1X: number;
            let rotationMatrix1Y: number;
            let rotationMatrix2X: number;
            let rotationMatrix2Y: number;
            if (!MathHelper.withinEpsilon(rotation)) {
                let sin = Math.sin(rotation);
                let cos = Math.cos(rotation);
                rotationMatrix1X = cos;
                rotationMatrix1Y = sin;
                rotationMatrix2X = -sin;
                rotationMatrix2Y = cos;
            } else {
                rotationMatrix1X = 1;
                rotationMatrix1Y = 0;
                rotationMatrix2X = 0;
                rotationMatrix2Y = 1;
            }

            // 如果我们有一个翻转的精灵，则翻转我们的倾斜值
            if (effects != 0) {
                skewTopX *= -1;
                skewBottomX *= -1;
                skewLeftY *= -1;
                skewRightY *= -1;
            }

            let cornerX = (Batcher._cornerOffsetX[0] - originX) * destinationW + skewTopX;
            let cornerY = (Batcher._cornerOffsetY[0] - originY) * destinationH - skewLeftY;

            if (this._disableBatching) {
                this.drawPrimitives(texture, 0, 1);
            } else {
                this._textureInfo[this._numSprites] = texture;
                this._numSprites += 1;
            }
        }

        public flushBatch() {
            if (this._numSprites == 0)
                return;

            let offset = 0;
            let curTexture: egret.DisplayObject = null;

            this.prepRenderState();

            curTexture = this._textureInfo[0];
            for (let i = 1; i < this._numSprites; i += 1) {
                if (this._textureInfo[i] != curTexture) {
                    this.drawPrimitives(curTexture, offset, i - offset);
                    curTexture = this._textureInfo[i];
                    offset = i;
                }
            }

            this.drawPrimitives(curTexture, offset, this._numSprites - offset);

            this._numSprites = 0;
        }

        public drawPrimitives(texture: egret.DisplayObject, baseSprite: number, batchSize: number) {
            let buffer = egret.sys.customHitTestBuffer;
            if (this._customEffect != null) {
                egret.sys.systemRenderer.render(texture, buffer,)
            } else {

            }
        }
    }
}