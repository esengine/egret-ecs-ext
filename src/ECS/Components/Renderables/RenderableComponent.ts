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

        }

        public debugRenderEnabled: boolean = true;
        protected _localOffset: Vector2;
        protected _layerDepth: number;
        protected _renderLayer: number;
        protected _bounds: Rectangle;
        protected _isVisble: boolean;
        protected _areBoundsDirty: boolean = true;

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