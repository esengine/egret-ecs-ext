module es {
    /**
     * 定义一个顶点中的单个元素
     */
    export class VertexElement implements IEquatable<VertexElement> {
        private _offset: number;
        private _format: VertexElementFormat;
        private _usage: VertexElementUsage;
        private _usageIndex: number;

        constructor(offset: number, elementFormat: VertexElementFormat, elementUsage: VertexElementUsage, usageIndex: number) {
            this._offset = offset;
            this._format = elementFormat;
            this._usageIndex = usageIndex;
            this._usage = elementUsage;
        }

        /**
         * 返回该实例的哈希码
         */
        public getHashCode() {
            let hashCode = this._offset;
            hashCode ^= this._format << 9;
            hashCode ^= this._usage << (9 + 4);
            hashCode ^= this._usageIndex << (9 + 4 + 4);
            return hashCode;
        }

        public equals(other: VertexElement): boolean {
            return this._offset == other._offset
                && this._format == other._format
                && this._usage == other._usage
                && this._usageIndex == other._usageIndex;
        }
    }
}