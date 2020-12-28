module es {
    /**
     * 存储输入汇编器阶段的顶点布局（输入元素）
     */
    export abstract class VertexInputLayout implements IEquatable<VertexInputLayout> {
        protected vertexDeclaretions: VertexDeclaration[];
        protected instanceFrequencies: number[];
        /**
         * 获取或设置已使用的输入槽数
         */
        public count;

        constructor(maxVertexBufferSlots: number) {
            this.vertexInputLayout(new Array<VertexDeclaration>(maxVertexBufferSlots), new Array<number>(maxVertexBufferSlots), 0);
        }

        protected vertexInputLayout(vertexDeclarations: VertexDeclaration[], instanceFrquencies: number[], count: number) {
            console.assert(vertexDeclarations != null);
            console.assert(instanceFrquencies != null);
            console.assert(count >= 0);
            console.assert(vertexDeclarations.length >= count);
            console.assert(vertexDeclarations.length == instanceFrquencies.length);

            this.count = count;
            this.vertexDeclaretions = vertexDeclarations;
            this.instanceFrequencies = instanceFrquencies;
        }

        public equals(other: VertexInputLayout) {
            if (null == other)
                return false;

            if (this == other)
                return true;

            if (this.count != other.count)
                return false;

            for (let i = 0; i < this.count; i++) {
                console.assert(this.vertexDeclaretions[i] != null);
                if (!this.vertexDeclaretions[i].equals(other.vertexDeclaretions[i]))
                    return false;
            }

            for (let i = 0; i < this.count; i++) {
                if (this.instanceFrequencies[i] != other.instanceFrequencies[i])
                    return false;
            }

            return true;
        }
    }
}