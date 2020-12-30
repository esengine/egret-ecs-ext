///<reference path="./Renderer.ts" />
module es {
    export class DefaultRenderer extends Renderer {
        constructor(renderOrder: number = 0, camera: Camera = null) {
            super(renderOrder, camera);
        }

        public render(scene: Scene) {
            let cam = this.camera || (scene.camera as Camera);
            this.beginRender(cam);

            for (let i = 0; i < scene.renderableComponents.count; i++) {
                let renderable = scene.renderableComponents.get(i);
                if (renderable.enabled && renderable.isVisibleFromCamera(cam))
                    this.renderAfterStateCheck(renderable, cam);
            }

            if (this.shouldDebugRender && Core.debugRenderEndabled)
                this.debugRender(scene, cam);

            this.endRender();
        }
    }
}