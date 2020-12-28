module es {
    export class VertexBuffer extends GraphicsResource {
        private readonly _isDynamic: boolean;
        public vertexCount: number;
        public vertexDeclaration: VertexDeclaration;
        public bufferUsage: BufferUsage;

        public vbo: WebGLBuffer;

        constructor(graphicsDevice: GraphicsDevice, vertexDeclaration: VertexDeclaration, vertexCount: number, bufferUsage: BufferUsage, dynamic: boolean) {
            super();
            if (graphicsDevice == null) {
                throw new Error("在创建新资源时，GraphicsDevice不能为空");
            }
            this.graphicsDevice = graphicsDevice;
            this.vertexDeclaration = vertexDeclaration;
            this.vertexCount = vertexCount;
            this.bufferUsage = bufferUsage;

            // 确保在顶点声明中分配了图形设备
            if (vertexDeclaration.graphicsDevice != graphicsDevice)
                vertexDeclaration.graphicsDevice = graphicsDevice;

            this._isDynamic = dynamic;

            if (this.vbo == null) {
                this.vbo = GraphicsDevice.gl.createBuffer();
                GraphicsExtensions.checkGLError();
                GraphicsDevice.gl.bindBuffer(GraphicsDevice.gl.ARRAY_BUFFER, this.vbo);
                GraphicsExtensions.checkGLError();
                GraphicsDevice.gl.bufferData(GraphicsDevice.gl.ARRAY_BUFFER,
                    this.vertexDeclaration.vertexStride * vertexCount,
                    this._isDynamic ? GraphicsDevice.gl.STREAM_DRAW : GraphicsDevice.gl.STATIC_DRAW);
                GraphicsExtensions.checkGLError();
            }
        }
    }
}