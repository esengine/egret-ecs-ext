module es {
    export class ConstantBufferCollection {
        private readonly _buffer: ConstantBuffer[];

        private _stage: ShaderStage;
        private get stage() {
            return this._stage;
        }

        private _valid: number;

        constructor(stage: ShaderStage, maxBuffers: number) {
            this._stage = stage;
            this._buffer = new Array(maxBuffers);
            this._valid = 0;
        }

        public get(index: number) {
            return this._buffer[index];
        }

        public set(index: number, value: ConstantBuffer) {
            if (this._buffer[index] == value)
                return;

            if (value != null) {
                this._buffer[index] = value;
                this._valid |= 1 << index;
            } else {
                this._buffer[index] = null;
                this._valid &= ~(1 << index);
            }
        }

        public clear() {
            for (let i = 0; i < this._buffer.length; i++)
                this._buffer[i] = null;

            this._valid = 0;
        }

        public setConstantBuffers(device: GraphicsDevice, shaderProgram: ShaderProgram) {
            // 如果没有恒定的缓冲区，那么就跳过它
            if (this._valid == 0)
                return;

            let valid = this._valid;

            for (let i = 0; i < this._buffer.length; i++) {
                let buffer = this._buffer[i];
                if (buffer != null && !buffer.isDisposed) {
                    buffer.platformApply(device, shaderProgram);
                }

                // 如果这是最后一个的话，提前出
                valid &= ~(1 << i);
                if (valid == 0)
                    return;
            }
        }
    }
}