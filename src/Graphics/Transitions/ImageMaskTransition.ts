///<reference path="./SceneTransition.ts" />
module es {
    /**
     * 使用图像来遮蔽部分场景，从最大到最小，然后通过旋转从最小到最大。
     * 过渡将为你卸载它。
     * Texture应该在应该遮蔽的地方是透明的，在应该遮蔽的地方是白色的
     */
    export class ImageMaskTransition extends SceneTransition {
        /**
         * 出入时间
         */
        public duration: number = 1;
        /**
         * 遮罩后，在标记开始前的延迟时间
         */
        public delayBeforeMaskOut: number = 0.2;
        /**
         * 遮罩的最小比例
         */
        public minScale: number = 0.01;
        /**
         * 遮罩的最大比例
         */
        public maxScale: number = 10;
        /**
         * 用来制作比例动画的简易公式
         */
        public scaleEaseType: EaseType = EaseType.expoOut;
        /**
         * 遮罩动画的最小旋转次数
         */
        public minRotation: number = 0;
        /**
         * 遮罩动画的最大旋转次数
         */
        public maxRotation: number = Math.PI * 2;
        /**
         * 用于旋转动画的简易方程
         */
        public rotationEaseType: EaseType = EaseType.linear;

        private _renderScale: number;
        private _renderRotation: number;
        /**
         * 用作遮罩的纹理。在遮罩显示底层场景的地方应该是白色的，其他地方应该是透明的
         */
        private _maskTexture: egret.Texture;
        /**
         * 遮罩的位置，屏幕的中心
         */
        private _maskPosition: Vector2;
        /**
         * 遮罩的原点，纹理的中心
         */
        private _maskOrigin: Vector2;
        /**
         * 遮罩首先被渲染成一个RenderTarget
         */
        private _maskRenderTarget: egret.RenderTexture;

        constructor(sceneLoadAction: () => Scene, maskTexture: egret.Texture) {
            super(sceneLoadAction, true);
            let stage = Core.Instance.stage;
            this._maskPosition = new Vector2(stage.stageWidth / 2, stage.stageHeight / 2);
            this._maskTexture = maskTexture;
            this._maskOrigin = new Vector2(this._maskTexture.textureWidth / 2, this._maskTexture.textureHeight / 2);
        }

        public * onBeginTransition(): any {
            yield null;

            let elapsed = 0;
            while (elapsed < this.duration) {
                elapsed += Time.deltaTime;
                this._renderScale = Lerps.ease(this.scaleEaseType, this.maxScale, this.minScale, elapsed, this.duration);
                this._renderRotation = Lerps.ease(this.rotationEaseType, this.minRotation, this.maxRotation, elapsed, this.duration);

                yield null;
            }

            // 装入新的场景
            yield Core.startCoroutine(this.loadNextScene());

            // 处理掉我们之前的SceneRender。我们不再需要它了
            this.previousSceneRender.dispose();
            this.previousSceneRender = null;

            yield Coroutine.waitForSeconds(this.delayBeforeMaskOut);

            elapsed = 0;
            while (elapsed < this.duration) {
                elapsed += Time.deltaTime;
                this._renderScale = Lerps.ease(EaseHelper.oppositeEaseType(this.scaleEaseType), this.minScale, this.maxScale, elapsed, this.duration);
                this._renderRotation = Lerps.ease(EaseHelper.oppositeEaseType(this.rotationEaseType), this.maxRotation, this.minRotation, elapsed, this.duration);

                yield null;
            }

            this.transitionComplete();
        }

        public preRender(batcher: Batcher) {
            batcher.begin(null);
            batcher.draw(this._maskTexture, this._maskPosition, 0xffffff, this._renderRotation, this._maskOrigin,
                new Vector2(this._renderScale), SpriteEffects.none);
            batcher.end();
        }

        protected transitionComplete() {
            super.transitionComplete();

            this._maskTexture.dispose();
            this._maskRenderTarget.dispose();
        }

        public render(batcher: Batcher) {
            // 如果我们要放大，我们就不需要再渲染之前的场景，因为我们希望新的场景是可见的
            if (!this._isNewSceneLoaded) {
                batcher.begin(null);
                batcher.draw(this.previousSceneRender, Vector2.zero);
                batcher.end();
            }

            batcher.begin(null);
            batcher.draw(this._maskRenderTarget, Vector2.zero);
            batcher.end();
        }
    }
}