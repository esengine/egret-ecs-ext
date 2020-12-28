module es {
    /**
     * 结构相同的顶点声明之间的数据共享
     */
    class Data implements IEquatable<Data> {
        private readonly _hashCode: number;
        public readonly vertexStride: number;
        public elements: VertexElement[];

        constructor(vertexStride: number, elements: VertexElement[]) {
            this.vertexStride = vertexStride;
            this.elements = elements;

            // 预先计算哈希码，以便在字典中进行快速比较和查找
            this._hashCode = elements[0].getHashCode();
            for (let i = 1; i < elements.length; i++)
                this._hashCode = (this._hashCode * 397) ^ elements[i].getHashCode();

            this._hashCode = (this._hashCode * 397) ^ elements.length;
            this._hashCode = (this._hashCode * 397) ^ vertexStride;
        }

        public equals(other: Data) {
            if (null == other)
                return false;
            if (this == other)
                return true;

            if (this._hashCode != other._hashCode
                || this.vertexStride != other.vertexStride
                || this.elements.length != other.elements.length) {
                return false;
            }

            for (let i = 0; i < this.elements.length; i++)
                if (!this.elements[i].equals(other.elements[i]))
                    return false;

            return true;
        }
    }

    /**
     * 定义顶点缓冲区的每顶点数据
     */
    export class VertexDeclaration extends GraphicsResource implements IEquatable<VertexDeclaration> {
        private static readonly _vertexDeclaretionCache: Map<Data, VertexDeclaration> = new Map();
        private readonly _shaderAttrbuteInfo: Map<number, VertexDeclarationAttributeInfo> = new Map();
        private readonly _data: Data;

        /**
         * 获取顶点的大小
         */
        public get vertexStride() {
            return this._data.vertexStride;
        }

        /**
         * 获取内部顶点元素数组
         */
        public get internalVertexElements(): VertexElement[] {
            return this._data.elements;
        }

        constructor(data: Data) {
            super();
            this._data = data;
        }

        public static getOrCreate(vertexStride: number, elements: VertexElement[]) {
            let data = new Data(vertexStride, elements);
            let vertexDeclaration: VertexDeclaration = this._vertexDeclaretionCache.get(data);
            if (!vertexDeclaration) {
                // Data.Elements已经在Data ctor中被设置。然而，顶点声明缓存中的条目必须是不可更改的。
                // 因此，我们创建一个数组的副本，用户不能访问它
                data.elements = elements.slice();

                vertexDeclaration = new VertexDeclaration(data);
                this._vertexDeclaretionCache.set(data, vertexDeclaration);
            }

            return vertexDeclaration;
        }

        public getAttributeInfo(shader: WebGLShader, programHash: number) {
            let attrInfo = this._shaderAttrbuteInfo.get(programHash);
            if (attrInfo)
                return attrInfo;

            // 获取顶点属性信息并进行缓存
            attrInfo = new VertexDeclarationAttributeInfo(this.graphicsDevice.maxVertexAttributes);

            for (let ve of this.internalVertexElements) {

            }
        }

        public equals(other: VertexDeclaration) {
            return other != null && this._data == other._data;
        }
    }

    /**
     * 特定着色器/顶点声明组合的顶点属性信息
     */
    export class VertexDeclarationAttributeInfo {
        public enabledAttributes: boolean[];

        public elements: Element[];

        constructor(maxVertexAttributes: number) {
            this.enabledAttributes = new Array(maxVertexAttributes);
            this.elements = [];
        }
    }

    export class Element {
        public offset: number;
        public attributeLocation: number;
        public numberOfElements: number;
        public vertexAttribPointerType: GLenum;
        public normalized: boolean;
    }
}