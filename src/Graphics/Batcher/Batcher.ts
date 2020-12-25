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
        // 跟踪开始/结束调用
        private _beginCalled: boolean;
        private _disableBatching: boolean;
        // 本批次有多少个精灵
        private _numSprites: number;

        // 创建投影矩阵时要使用的矩阵
        private _transformMatrix: Matrix;
        // 内部用于计算摄像机投影的矩阵
        private _projectionMatrix: Matrix;
        // 用户提供的效果
        private _customEffect: egret.CustomFilter;

        constructor(graphicsDevice: GraphicsDevice) {
            super();
            Insist.isTrue(graphicsDevice != null);

            this.graphicsDevice = graphicsDevice;
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

        public prepRenderState() {

        }
    }
}