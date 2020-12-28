module es {
    export class IndexBuffer extends GraphicsResource {
        private readonly _isDynamic: boolean;

        public bufferUsage: BufferUsage;
        public indexCount: number;
        public indexElementSize: IndexElementSize;

        constructor(graphicsDevice: GraphicsDevice, indexCount: number, usage: BufferUsage, dynamic: boolean) {
            super();
            this.indexBuffer(graphicsDevice, IndexBuffer.sizeForType(), indexCount, usage);
            this._isDynamic = dynamic;
        }

        private indexBuffer(graphicsDevice: GraphicsDevice, indexElementSize: IndexElementSize, indexCount: number, usage: BufferUsage) {
            if (graphicsDevice == null) {
                throw new Error("在创建新资源时，GraphicsDevice不能为空");
            }
            this.graphicsDevice = graphicsDevice;
            this.indexElementSize = indexElementSize;
            this.indexCount = indexCount;
            this.bufferUsage = usage;
        }

        static sizeForType(): IndexElementSize {
            return IndexElementSize.sixteenBits;
        }
    }
}