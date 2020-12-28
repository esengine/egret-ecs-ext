module es {
    /**
     * 存储要绑定到输入汇编器阶段的顶点缓冲区
     */
    export class VertexBufferBindings extends VertexInputLayout {
        private readonly _vertexBuffers: VertexBuffer[];
        private readonly _vertexOffsets: number[];

        constructor(maxVertexBufferSlots: number) {
            super(maxVertexBufferSlots);
            this._vertexBuffers = new Array<VertexBuffer>(maxVertexBufferSlots);
            this._vertexOffsets = new Array<number>(maxVertexBufferSlots);
        }

        /**
         * 清理顶点缓冲区插槽
         */
        public clear() {
            if (this.count == 0)
                return false;

            this.vertexDeclaretions.fill(null, 0, this.count);
            this.instanceFrequencies.fill(0, 0, this.count);
            this._vertexBuffers.fill(null, 0, this.count);
            this._vertexOffsets.fill(0, 0, this.count);
            this.count = 0;
            return true;
        }

        /**
         * 获取绑定到指定输入槽的顶点缓冲区
         * @param slot 
         */
        public get(slot: number): VertexBufferBinding {
            console.assert(0 <= slot && slot < this.count);

            return new VertexBufferBinding(
                this._vertexBuffers[slot],
                this._vertexOffsets[slot],
                this.instanceFrequencies[slot]
            )
        }
    }
}