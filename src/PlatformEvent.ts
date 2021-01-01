module es {
    /**
     * 这里存放专门处理平台用的事件
     */
    export class PlatformEvent {
        public static initialize() {
            Screen.width = Core.Instance.stage.stageWidth;
            Screen.height = Core.Instance.stage.stageHeight;

            Core.emitter.addObserver(CoreEvents.clearGraphics, this.clearGraphics, this);
            Core.emitter.addObserver(CoreEvents.addDefaultRender, this.addDefaultRenderer, this);
            Core.emitter.addObserver(CoreEvents.createRenderTarget, this.createRenderTarget, this);
            Core.emitter.addObserver(CoreEvents.disposeRenderTarget, this.disposeRenderTarget, this);
            Core.emitter.addObserver(CoreEvents.setRenderTarget, this.setRenderTarget, this);
            Core.emitter.addObserver(CoreEvents.resolutionOffset, this.setResolutionOffset, this);
            Core.emitter.addObserver(CoreEvents.resolutionScale, this.setResuolutionScale, this);
            Core.emitter.addObserver(CoreEvents.createCamera, this.createCamera, this);

            Framework.batcher = Graphics.instance.batcher;
        }

        private static addDefaultRenderer() {
            Core.scene.addRenderer(new DefaultRenderer());
        }

        private static clearGraphics() {

        }

        private static createRenderTarget(texture: Ref<egret.RenderTexture>, width: number, height: number) {
            texture.value = new egret.RenderTexture();
            texture.value.drawToTexture(Core.Instance, new egret.Rectangle(0, 0, width, height));
        }

        private static disposeRenderTarget(texture: Ref<egret.RenderTexture>) {
            if (!texture || !texture.value) return;
            texture.value.dispose();
            texture.value = null;
        }

        private static setRenderTarget(texture: Ref<egret.RenderTexture>) {
            if (!texture) texture = new Ref(null);
            texture.value = new egret.RenderTexture();
            texture.value.drawToTexture(Core.Instance);
        }

        private static setResolutionOffset(offset: Vector2) {
            
        }

        private static setResuolutionScale(scale: Vector2) {

        }

        private static createCamera(scene: Scene) {
            let cameraEntity = scene.createEntity("camera");
            scene.camera = cameraEntity.addComponent(new Camera());
        }
    }
}