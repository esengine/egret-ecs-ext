module es {
    /**
     * SceneTransition用于从一个场景过渡到另一个场景或在一个场景内用效果过渡。
     * 如果 sceneLoadAction 为空，框架 将执行场景内的转换，而不是在转换过程中加载一个新的场景。
     * 
     * 过渡的一般要领如下。
     * - onBeginTransition将被调用，允许你为多部分转换让步。
     * - 对于带有效果的两部分过渡，你可以在调用TickEffectProgressProperty时让位于第一部分，以遮挡屏幕。
     * - 产生调用loadNextScene来加载新的Scene。
     * - 在TickEffectProgressProperty上再次屈服，以解除对屏幕的遮挡并显示新的场景。
     */
    export abstract class SceneTransition {
        /**
         * 包含上一个场景的最后渲染。可以用来在加载新场景时遮挡屏幕
         */
        public previousSceneRender: egret.RenderTexture;
        /**
         * 如果为真，框架将把前一个场景渲染到 previousSceneRender 中，这样你就可以用它来做过渡。
         */
        public wantsPreviousSceneRender: boolean;
        /**
         * 如果为true，下一个场景将在后台线程上加载
         */
        public loadSceneOnBackgroundThread: boolean;
        /**
         * 应该返回新加载的场景的函数
         */
        protected sceneLoadAction: () => Scene;
        /**
         * 在内部用于决定前一个场景是否应该渲染到 previousSceneRender 中。
         * 做双重任务，确保渲染只发生一次。
         */
        public get hasPreviousSceneRender(): boolean {
            if (!this._hasPreviousSceneRender) {
                this._hasPreviousSceneRender = true;
                return false;
            }

            return true;
        }

        /**
         * 在执行loadNextScene时被调用。
         * 这在进行场景间转换时非常有用，这样你就可以知道何时可以增加相机或重置任何实体
         */
        public onScreenObscured: Function;
        /**
         * 当Transition完成执行后被调用，这样就可以调用其他工作，如启动另一个过渡
         */
        public onTransitionCompleted: Function;
        /** 标志，表示这个过渡是否会加载新的场景 */
        public _loadsNewScene: boolean;

        private _hasPreviousSceneRender: boolean;
        /**
         * 用来做两部分过渡。
         * 例如，淡入会先淡入黑色，然后当 _isNewSceneLoaded 变为 true 时，它会淡入。
         * 对于场景内的转场，_isNewSceneLoaded应该在中间点设置为true，就像加载了一个新的场景一样
         */
        public _isNewSceneLoaded: boolean;

        constructor(sceneLoadAction: () => Scene = null, wantsPreviousSceneRender: boolean = true) {
            this.sceneLoadAction = sceneLoadAction;
            this.wantsPreviousSceneRender = wantsPreviousSceneRender;
            this._loadsNewScene = sceneLoadAction != null;

            // 如果我们需要，可以创建一个RenderTexture，以备以后使用
            if (wantsPreviousSceneRender) {
                this.previousSceneRender = new egret.RenderTexture();
                this.previousSceneRender.drawToTexture(Core.Instance);
            }
        }

        protected * loadNextScene() {
            this.onScreenObscured && this.onScreenObscured();

            // 如果我们没有加载一个新的场景，我们只需要设置标志，就像我们做了一样，这样2个阶段的转换就完成了
            if (!this._loadsNewScene) {
                this._isNewSceneLoaded = true;
                yield 'break';
            }

            if (this.loadSceneOnBackgroundThread) {
                Promise.resolve(() => {
                    let scene = this.sceneLoadAction();
                    Core.schedule(0, false, null, timer => {
                        Core.scene = scene;
                        this._isNewSceneLoaded = true;
                    });
                })
            } else {
                Core.scene = this.sceneLoadAction();
                this._isNewSceneLoaded = true;
            }

            while (!this._isNewSceneLoaded)
                yield null;
        }

        /**
         * 这时你可以在产生一帧后加载你的新场景（所以第一次渲染调用发生在场景加载之前）
         */
        public * onBeginTransition(): any {
            yield null;
            yield Core.startCoroutine(this.loadNextScene());

            this.transitionComplete();
        }

        /**
         * 在渲染场景之前被调用
         * @param batcher 
         */
        public preRener(batcher: Batcher) {

        }

        /**
         * 在这里做所有的渲染.static 这是一个基本的实现。任何特殊的渲染都应该覆盖这个方法。
         * @param batcher 
         */
        public render(batcher: Batcher) {
            batcher.begin(null, Matrix2D.toMatrix(Matrix2D.identity), false);
            batcher.draw(this.previousSceneRender, Vector2.zero);
            batcher.end();
        }

        /**
         * 当你的转换完成并且新的场景被设置后，这个函数将被调用。
         */
        protected transitionComplete() {
            Core._instance._sceneTransition = null;

            if (this.previousSceneRender != null) {
                this.previousSceneRender.dispose();
                this.previousSceneRender = null;
            }

            this.onTransitionCompleted && this.onTransitionCompleted();
        }

        /**
         * 最常见的过渡类型似乎是将进度从0-1，如果你的过渡需要在场景加载后有一个_progress属性，这个方法就能帮你解决这个问题
         * @param effect 
         * @param duration 
         * @param easeType 
         * @param reverseDirection 
         */
        public * tickEffectProgressProperty(effect: egret.CustomFilter, duration: number, easeType: EaseType = EaseType.expoOut, reverseDirection: boolean = false) {
            let start = reverseDirection ? 1 : 0;
            let end = reverseDirection ? 0 : 1;

            let elapsed = 0;
            while (elapsed < duration) {
                elapsed += Time.deltaTime;
                let step = Lerps.ease(easeType, start, end, elapsed, duration);
                effect.uniforms['_progress'] = step;

                yield null;
            }
        }
    }
}