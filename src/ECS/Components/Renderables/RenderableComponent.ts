module es {
    /**
     * IRenderable的具体实现。包含方便的方法。
     * 非常重要！子类必须覆盖width/height或bounds! 子类必须覆盖width/height或bounds!
     */
    export abstract class RenderableComponent extends Component implements IRenderable, IComparer<RenderableComponent> {
        /**
         * 不重写bounds属性的子类必须实现这个！RenderableComponent的宽度。
         */
        public get width() {
            return this.bounds.width;
        }

        /**
         * 不重写bounds属性的子类必须实现这个!
         */
        public get height() {
            return this.bounds.height;
        }

        /**
         * 包裹此对象的AABB。用来进行相机筛选。
         */
        public get bounds(): Rectangle {
            if (this._areBoundsDirty) {
                this._bounds.calculateBounds(this.entity.transform.position, this._localOffset, Vector2.zero,
                    this.entity.transform.scale, this.entity.transform.rotation, this.width, this.height);
                this._areBoundsDirty = false;
            }

            return this._bounds;
        }

        /**
         * 标准的Batcher图层深度，0为前面，1为后面。
         * 改变这个值会触发场景中可渲染组件列表的排序。
         */
        public get layerDepth() {
            return this._layerDepth;
        }
        public set layerDepth(value: number) {
            this.setLayerDepth(value);
        }

        /**
         * 较低的renderLayers在前面，较高的在后面，就像layerDepth一樣，但不是限制在0-1。
         * 请注意，这意味着更高的renderLayers首先被发送到Batcher。
         */
        public get renderLayer() {
            return this._renderLayer;
        }
        public set renderLayer(value: number){
            this.setRenderLayer(value);
        }

        public debugRenderEnabled: boolean = true;
        protected _localOffset: Vector2;
        protected _layerDepth: number;
        protected _renderLayer: number;
        protected _bounds: Rectangle;
        protected _isVisble: boolean;
        protected _areBoundsDirty: boolean = true;

        public onEntityTransformChanged(comp: transform.Component) {
            this._areBoundsDirty = true;
        }

        /**
         * 被渲染器调用。摄像机可以用来进行裁剪，并使用Batcher实例进行绘制
         * @param batcher 
         * @param camera 
         */
        public abstract render(batcher: Batcher, camera: Camera);

        /**
         * 只有在没有对撞机的情况下才会渲染边界。始终在原点上渲染一个正方形
         * @param batcher 
         */
        public debugRender(batcher: Batcher) {
            if (!this.debugRenderEnabled)
                return;

            // 如果我们没有对撞机，我们就画出我们的范围
            if (this.entity.getComponent<Collider>(Collider) == null)
                batcher.drawHollowRect(this.bounds, 0xFFFF00);
        }

        /**
         * 标准的Batcher图层深度，0为前面，1为后面。
         * 改变这个值会触发一种类似于renderableComponents的方法
         * @param layerDepth 
         */
        public setLayerDepth(layerDepth: number): RenderableComponent {
            this._layerDepth = MathHelper.clamp01(layerDepth);

            if (this.entity != null && this.entity.scene != null)
                (this.entity.scene as SceneImpl).renderableComponents.setRenderLayerNeedsComponentSort(this.renderLayer);
            return this;
        }

        /**
        * 较低的渲染层在前面，较高的在后面
        * @param renderLayer
        */
        public setRenderLayer(renderLayer: number): RenderableComponent {
            if (renderLayer != this._renderLayer) {
                let oldRenderLayer = this._renderLayer;
                this._renderLayer = renderLayer;
                // 如果该组件拥有一个实体，那么是由ComponentList管理，需要通知它改变了渲染层
                if (this.entity && this.entity.scene)
                    (this.entity.scene as SceneImpl).renderableComponents.updateRenderableRenderLayer(this, oldRenderLayer, this._renderLayer);
            }

            return this;
        }
    }
}