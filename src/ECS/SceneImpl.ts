module es {
    export class SceneImpl extends Scene {
        /** 管理当前在场景中的所有RenderableComponents的列表 Entitys */
        public readonly renderableComponents: RenderableComponentList;
        /**
         * 特定场景的 ContentManager。用它来加载只有这个场景需要的任何资源。
         */
        public readonly content: AssetManager;

        constructor() {
            super();
            this.renderableComponents = new RenderableComponentList();
            this.content = new AssetManager();
        }

        public update() {
            super.update();

            // 我们在entity.update之后更新我们的renderables，以防止任何新的Renderables被添加
            this.renderableComponents.updateList();
        }
    }
}