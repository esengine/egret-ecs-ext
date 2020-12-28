module es {
    export class GraphicsExtensions {
        public static checkGLError() {
            let error = GraphicsDevice.gl.getError();
            if (error != GraphicsDevice.gl.NO_ERROR) {
                throw new Error("GL.GetError() returned " + error);
            }
        }
    }
}