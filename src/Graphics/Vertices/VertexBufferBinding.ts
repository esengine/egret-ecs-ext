module es {
    /**
     * 定义顶点缓冲区如何绑定到图形设备上进行渲染
     */
    export class VertexBufferBinding {
        private readonly _vertexBuffer: VertexBuffer;
        private readonly _vertexOffset: number;
        private readonly _instanceFrequency: number;

        /**
         * 获取顶点缓冲区
         */
        public get vertexBuffer(): VertexBuffer {
            return this._vertexBuffer;
        }

        /**
         * 获取顶点缓冲区中要使用的第一个顶点的索引
         */
        public get vertexOffset(): number {
            return this._vertexOffset;
        }

        /**
         * 获取在缓冲区中前进一个元素之前，使用相同的每个实例数据绘制的实例数量
         */
        public get instanceFrequency() {
            return this._instanceFrequency;
        }

        constructor(vertexBuffer: VertexBuffer, vertexOffset: number = 0, instanceFrequency: number) {
            if (vertexBuffer == null)
                throw new Error("vertexBuffer");
            if (vertexOffset < 0 || vertexOffset >= vertexBuffer.vertexCount)
                throw new Error("vertexOffset");
            if (instanceFrequency < 0)
                throw new Error("instanceFrequency");

            this._vertexBuffer = vertexBuffer;
            this._vertexOffset = vertexOffset;
            this._instanceFrequency = instanceFrequency;
        }
    }
}