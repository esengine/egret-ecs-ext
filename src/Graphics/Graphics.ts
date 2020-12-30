module es {
    /**
     * 封装类，它拥有Batcher的实例和助手，因此它可以被传来传去，绘制任何东西
     */
    export class Graphics {
        public static instance: Graphics;
        /**
         * 所有的2D渲染都是通过这个Batcher实例完成的
         */
        public batcher: Batcher;
        /**
         *  用于绘制矩形、线条、圆形等的精灵。将在启动时生成，但你可以用你的图集中的精灵代替，以减少纹理交换。应该是一个1x1的白色像素
         */
        public pixelTexture: Sprite;

        public static gl: WebGLRenderingContext;

        constructor() {
            const web = egret['web'];
            const context = web.WebGLRenderContext.getInstance();
            Graphics.gl = context.context;

            this.batcher = new Batcher(Core.graphicsDevice);
            let tex = new egret.Texture();
            this.pixelTexture = new Sprite(tex, new Rectangle(0, 0, 1, 1));
        }

        public unload() {
            this.batcher.disposed();
            this.batcher = null;
        }
    }
}