module es {
    export class GraphicsDevice {
        private _viewport: Viewport;
        private _isDisposed: boolean;

        private _vertexBuffers: VertexBufferBindings;
        private readonly _vertexConstantBuffers: ConstantBufferCollection = new ConstantBufferCollection(ShaderStage.vertex, 16);
        private readonly _pixelConstantBuffers: ConstantBufferCollection = new ConstantBufferCollection(ShaderStage.pixel, 16);
        private _maxVertexBufferSlots: number = 0;
        public maxVertexAttributes: number = 0;
        /**
         * 从唯一的字节流中缓存效果
         */
        public effectCache: Map<number, egret.CustomFilter>;
        /**
         * 对全局资源列表使用WeakReference，因为我们不知道资源何时会被处置和收集。
         * 我们不希望通过在该列表中持有强引用来阻止资源被收集
         */
        private readonly _resources: WeakSet<any> = new WeakSet();
        private _indexBuffer: IndexBuffer;
        public static gl: WebGL2RenderingContext;

        /** 活动顶点着色器 */
        private _vertexShader: WebGLShader;
        private _vetexShaderDirty: boolean;
        public get vertexShader() {
            return this._vertexShader;
        }

        public set vertexShader(value: WebGLShader) {
            if (this._vertexShader == value)
                return;

            this._vertexShader = value;
            this._vetexShaderDirty = true;
        }

        private static _bufferBindingInfos: BufferBindingInfo[];
        public static _attribsDirty: boolean;
        /** 活动的像素着色器 */
        private _pixelShader: WebGLShader;
        private _pixelShaderDirty: boolean;
        public get pixelShader() {
            return this._pixelShader;
        }

        public set pixelShader(value: WebGLShader) {
            if (this._vertexShader == value)
                return;

            this._pixelShader = value;
            this._vetexShaderDirty = true;
        }

        constructor(width: number, height: number) {
            this.setup(width, height);
            this.initialize();
        }

        private setup(width: number, height: number) {
            const web = egret['web'];
            const context = web.WebGLRenderContext.getInstance();
            GraphicsDevice.gl = context.context;

            this._viewport = new Viewport(0, 0, width, height);
            this._viewport.maxDepth = 1;
            this.effectCache = new Map();
        }

        private initialize() {
            this._vertexConstantBuffers.clear();
            this._pixelConstantBuffers.clear();

            // 在下次调用ApplyState()时强制设置缓冲区和着色器
            this._vertexBuffers = new VertexBufferBindings(this._maxVertexBufferSlots);
            this._vetexShaderDirty = true;
            this._pixelShaderDirty = true;
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

        /**
         * 通过索引到顶点缓冲区绘制几何体
         * @param primitiveType 
         * @param baseVertex 
         * @param startIndex 
         * @param primiveCount 
         */
        public drawIndexedPrimitives(primitiveType: PrimitiveType, baseVertex: number, startIndex: number, primiveCount: number) {
            if (this._vertexBuffers == null)
                throw new Error("必须在调用 DrawIndexedPrimitives 之前设置顶点着色器");

            if (this._vertexBuffers.count == 0)
                throw new Error("在调用DrawIndexedPrimitives之前必须设置顶点缓冲区");

            const shortIndices = this._indexBuffer.indexElementSize == IndexElementSize.sixteenBits;

            const indexElementType = shortIndices ? GraphicsDevice.gl.UNSIGNED_SHORT : GraphicsDevice.gl.UNSIGNED_INT;
            const indexElementSize = shortIndices ? 2 : 4;
            const indexOffsetInBytes = startIndex * indexElementSize;
            const indexElementCount = GraphicsDevice.getElementCountArray(primitiveType, primiveCount);
            const target = GraphicsDevice.primitiveTypeGL(primitiveType);

            this.applyAttribs(this._vertexShader, baseVertex);
            GraphicsDevice.gl.drawElements(target, indexElementCount, indexElementType, indexOffsetInBytes);
            GraphicsExtensions.checkGLError();
        }

        private applyAttribs(shader: WebGLShader, baseVertex: number) {
            let bindingsChanged = false;

            for (let slot = 0; slot < this._vertexBuffers.count; slot++) {
                let vertexBufferBinding = this._vertexBuffers.get(slot);
                let vertexDeclaration = vertexBufferBinding.vertexBuffer.vertexDeclaration;
                // let attrInfo = vertexDeclaration.getAttributeInfo(shader, pr)

                let vertexStride = vertexDeclaration.vertexStride;
                let offset = vertexDeclaration.vertexStride * (baseVertex + vertexBufferBinding.vertexOffset);

            }
        }

        private static primitiveTypeGL(primitiveType: PrimitiveType): GLenum {
            switch (primitiveType) {
                case PrimitiveType.lineList:
                    return this.gl.LINES;
                case PrimitiveType.lineStrip:
                    return this.gl.LINE_STRIP;
                case PrimitiveType.triangleList:
                    return this.gl.TRIANGLES;
                case PrimitiveType.triangleStrip:
                    return this.gl.TRIANGLE_STRIP;
            }
        }

        private static getElementCountArray(primitiveType: PrimitiveType, primitiveCount: number) {
            switch (primitiveType) {
                case PrimitiveType.lineList:
                    return primitiveCount * 2;
                case PrimitiveType.lineStrip:
                    return primitiveCount + 1;
                case PrimitiveType.triangleList:
                    return primitiveCount * 3;
                case PrimitiveType.triangleStrip:
                    return primitiveCount + 2;
            }
        }

        public static getTitleSafeArea(x: number, y: number, width: number, height: number) {
            return this.platformGetTitleSafeArea(x, y, width, height);
        }

        private static platformGetTitleSafeArea(x: number, y: number, width: number, height: number) {
            return new Rectangle(x, y, width, height);
        }
    }

    // 保存缓存信息
    class BufferBindingInfo {
        public attributeInfo: VertexDeclarationAttributeInfo;
        public vertexOffset: number;
        public instanceFrequency: number;
        public vbo: number;

        constructor(attributeInfo: VertexDeclarationAttributeInfo, vertexOffset: number, instanceFrequency: number, vbo: number) {
            this.attributeInfo = attributeInfo;
            this.vertexOffset = vertexOffset;
            this.instanceFrequency = instanceFrequency;
            this.vbo = vbo;
        }
    }
}