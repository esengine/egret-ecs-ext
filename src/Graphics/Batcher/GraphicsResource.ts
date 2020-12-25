module es {
    /**
     * 这个类的存在只是为了让我们可以偷偷地把Batcher带过去
     */
    export abstract class GraphicsResource {
        public get graphicsDevice() {
            return this._graphicsDevice;
        }

        public set graphicsDevice(value) {
            Insist.isTrue(value != null);

            if (this._graphicsDevice == value)
                return;

            if (this._graphicsDevice != null) {
                this.updateResourceReference(false);
                this._selfReference.delete(this);
            }

            this._graphicsDevice = value;
            this._selfReference.add(this);
            this.updateResourceReference(true);
        }

        public isDisposed: boolean;
        private _graphicsDevice: GraphicsDevice;
        private _selfReference: WeakSet<GraphicsResource> = new WeakSet();

        protected dispose(disposing: boolean) {
            if (!this.isDisposed) {
                if (disposing) {
                    // 释放被管理对象
                }

                // 从全局图形资源列表中删除
                if (this.graphicsDevice != null)
                    this.updateResourceReference(false);

                this._selfReference.delete(this);
                this._graphicsDevice = null;
                this.isDisposed = true;
            }
        }

        public updateResourceReference(shouldAdd: boolean) {
            if (shouldAdd) {
                this.graphicsDevice.addResourceReference(this._selfReference);
            } else {
                this.graphicsDevice.removeResourceReference(this._selfReference);
            }
        }
    }
}