module es {
    export class GraphicsDevice {
        private _viewport: Viewport;
        private _isDisposed: boolean;

        /**
         * 从唯一的字节流中缓存效果
         */
        public effectCache: Map<number, egret.CustomFilter>;
        /**
         * 对全局资源列表使用WeakReference，因为我们不知道资源何时会被处置和收集。
         * 我们不希望通过在该列表中持有强引用来阻止资源被收集
         */
        private readonly _resources: WeakSet<any> = new WeakSet();

        constructor(width: number, height: number) {
            this.setup(width, height);
        }

        private setup(width: number, height: number) {
            this._viewport = new Viewport(0, 0, width, height);
            this._viewport.maxDepth = 1;
            this.effectCache = new Map();
        }

        protected dispose(disposing: boolean) {
            if (!this._isDisposed) {
                if (disposing) {
                    this.effectCache.clear();
                }

                this._isDisposed = true;
            }
        }

        public get viewport() {
            return this._viewport;
        }

        public set viewport(value: Viewport) {
            this._viewport = value;
        }

        public addResourceReference(resourceReference) {
            this._resources.add(resourceReference);
        }

        public removeResourceReference(resourceReference) {
            this._resources.delete(resourceReference);
        }

        public static getTitleSafeArea(x: number, y: number, width: number, height: number) {
            return this.platformGetTitleSafeArea(x, y, width, height);
        }

        private static platformGetTitleSafeArea(x: number, y: number, width: number, height: number) {
            return new Rectangle(x, y, width, height);
        }
    }
}