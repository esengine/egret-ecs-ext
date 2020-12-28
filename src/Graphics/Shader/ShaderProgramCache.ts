module es {
    export class ShaderProgram {
        public readonly program: number;
        private readonly _uniformLocations: Map<string, WebGLUniformLocation> = new Map();

        constructor(program: number) {
            this.program = program;
        }

        public getUniformLocation(name: string) {
            if (this._uniformLocations.has(name))
                return this._uniformLocations.get(name);

            let location = GraphicsDevice.gl.getUniformLocation(this.program, name);
            GraphicsExtensions.checkGLError();
            this._uniformLocations.set(name, location);
            return location;
        }
    }
}