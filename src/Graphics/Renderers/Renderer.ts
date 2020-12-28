module es {
    /**
     * 渲染器被添加到一个场景中，并处理所有对RenderableComponent.render和Entity.debugRender的实际调用。
     * 一个简单的渲染器可以直接启动Batcher.instanceGraphics.batcher，也可以创建自己的本地Batcher实例
     */
    export abstract class Renderer implements IComparer<Renderer> {
        /** Batcher使用的材料。任何RenderableComponent都可以覆盖它 */
        public material: Material = Material.defaultMaterial;
        /** 
         * 渲染器用于渲染的Camera(实际上是它的transformMatrix和culling的边界)。
         * 这是一个方便的字段，不是必需的。
         * 渲染器子类可以在调用beginRender时选择使用的摄像机
         */
        public camera: Camera;
        /**
         * 指定场景调用渲染器的顺序
         */
        public renderOrder: number = 0;
        /**
         * 如果renderTarget不是空的，这个渲染器将渲染到RenderTarget中，而不是渲染到屏幕上
         */
        public renderTexture: egret.Texture;
        /**
         * 标志，决定是否要调试渲染。
         * 渲染方法接收一个bool(debugRenderEnabled)让渲染器知道全局调试渲染是否开启/关闭。
         * 然后渲染器使用本地的bool来决定是否应该调试渲染
         */
        public shouldDebugRender: boolean = true;
        /**
         * 如果为true，场景将使用场景RenderTarget调用SetRenderTarget。
         * 如果Renderer有一个renderTexture，默认的实现会返回true
         */
        public get wantsToRenderToSceneRenderTarget() {
            return this.renderTexture == null;
        }

        /**
         * 如果为true，场景将在所有后处理器完成后调用渲染方法。
         * 这必须在调用Scene.addRenderer生效之前设置为true，并且Renderer不应该有renderTexture。
         * 使用这种类型的渲染器的主要原因是为了让你可以在不进行后期处理的情况下，在Scene的其余部分上渲染你的UI。
         * ScreenSpaceRenderer是一个将此设置为真的Renderer例子
         */
        public wantsToRenderAfterPostProcessors: boolean;

        /**
         * 持有最后渲染的Renderable的当前材质（如果没有更改，则为Renderer.material）
         */
        protected _currentMaterial: Material;

        constructor(renderOrder: number, camera: Camera = null) {
            this.camera = camera;
            this.renderOrder = renderOrder;
        }

        /**
         * 当Renderer被添加到场景中时被调用
         * @param scene 
         */
        public onAddedToScene(scene: Scene) {

        }

        /**
         * 当场景结束或该渲染器从场景中移除时，调用该函数，用于清理
         */
        public unload() {
            this.renderTexture && this.renderTexture.dispose();
        }

        /**
         * 如果使用了RenderTarget，这将会对其进行设置。
         * Batcher也会被启动。传
         * 递进来的Camera将被用来设置ViewPort（如果有ViewportAdapter）和Batcher变换矩阵
         * @param cam 
         */
        protected beginRender(cam: Camera) {
            // 如果我们有一个renderTarget渲染进去
            if (this.renderTexture != null) {

            }
        }
    }
}