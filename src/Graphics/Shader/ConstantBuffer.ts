module es {
    export class ConstantBuffer extends GraphicsResource {
        private readonly _buffer: number[];
        private readonly _parameters: number[];
        private readonly _offsets: number[];
        private readonly _name: string;
        private _stateKey: number;
        private _dirty: boolean;
        private get dirty() {
            return this._dirty;
        }

        private _shaderProgram: ShaderProgram = null;
        private _location: WebGLUniformLocation;

        static _lastConstantBufferApplied: ConstantBuffer = null;
        /** 一个可以用来比较常量缓冲区的哈希值 */
        public hashKey: number;

        constructor(cloneSource: ConstantBuffer) {
            super();
            this.graphicsDevice = cloneSource.graphicsDevice;

            this._name = cloneSource._name;
            this._parameters = cloneSource._parameters;
            this._offsets = cloneSource._offsets;

            this._buffer = cloneSource._buffer.slice();
            let data = [];
            for (let i = 0; i < this._parameters.length; i++) {
                data[i] = this._parameters[i] | this._offsets[i];
            }

            this.hashKey = Hash.computeHash(...data);
        }

        private platformClear() {
            // 强制再次查询统一位置
            this._shaderProgram = null;
        }

        public platformApply(device: GraphicsDevice, program: ShaderProgram) {
            if (this._shaderProgram != program) {
                let location = program.getUniformLocation(this._name);
                if (location == -1)
                    return;

                this._shaderProgram = program;
                this._location = location;
                this._dirty = true;
            }

            // 如果着色器程序相同，效果可能仍然不同，缓冲区中的数值也不同
            if (this != ConstantBuffer._lastConstantBufferApplied)
                this._dirty = true;

            // 如果缓冲区的内容没有变化，那么我们就完成了......使用之前设置的统一状态
            if (!this._dirty)
                return;

            // 我们需要知道buffer float/int/bool的类型，并正确地选择，否则它就不能工作，因为我猜GL是在检查统一的类型
            GraphicsDevice.gl.uniform4f(this._location, this._buffer[0], this._buffer[1], this._buffer[2], this._buffer[3]);
            GraphicsExtensions.checkGLError();

            this._dirty = false;
            ConstantBuffer._lastConstantBufferApplied = this;
        }
    }
}