declare module es {
    /**
     *  全局核心类
     */
    class Core extends egret.DisplayObjectContainer {
        /**
         * 对图形设备的全局访问
         */
        static graphicsDevice: GraphicsDevice;
        /**
         * 核心发射器。只发出核心级别的事件
         */
        static emitter: Emitter<CoreEvents>;
        /**
         * 启用/禁用焦点丢失时的暂停。如果为真，则不调用更新或渲染方法
         */
        static pauseOnFocusLost: boolean;
        /**
         * 是否启用调试渲染
         */
        static debugRenderEndabled: boolean;
        /**
         * 简化对内部类的全局内容实例的访问
         */
        static _instance: Core;
        /**
         * 用于确定是否应该使用EntitySystems
         */
        static entitySystemsEnabled: boolean;
        private _scene;
        private _nextScene;
        _sceneTransition: SceneTransition;
        /**
         * 用于凝聚GraphicsDeviceReset事件
         */
        private _graphicsDeviceChangeTimer;
        /**
         * 全局访问系统
         */
        private _globalManagers;
        private _coroutineManager;
        private _timerManager;
        width: number;
        height: number;
        constructor(width: number, height: number, enableEntitySystems?: boolean);
        /**
         * 提供对单例/游戏实例的访问
         * @constructor
         */
        static readonly Instance: Core;
        private _frameCounterElapsedTime;
        private _frameCounter;
        private _totalMemory;
        _titleMemory: (totalMemory: number, frameCounter: number) => void;
        /**
         * 当前活动的场景。注意，如果设置了该设置，在更新结束之前场景实际上不会改变
         */
        /**
        * 当前活动的场景。注意，如果设置了该设置，在更新结束之前场景实际上不会改变
        * @param value
        */
        static scene: Scene;
        /**
         * 添加一个全局管理器对象，它的更新方法将调用场景前的每一帧。
         * @param manager
         */
        static registerGlobalManager(manager: es.GlobalManager): void;
        /**
         * 删除全局管理器对象
         * @param manager
         */
        static unregisterGlobalManager(manager: es.GlobalManager): void;
        /**
         * 获取类型为T的全局管理器
         * @param type
         */
        static getGlobalManager<T extends es.GlobalManager>(type: any): T;
        /**
         * 启动一个coroutine。Coroutine可以将number延时几秒或延时到其他startCoroutine.Yielding
         * null将使coroutine在下一帧被执行。
         * @param enumerator
         */
        static startCoroutine(enumerator: any): ICoroutine;
        /**
         * 调度一个一次性或重复的计时器，该计时器将调用已传递的动作
         * @param timeInSeconds
         * @param repeats
         * @param context
         * @param onTime
         */
        static schedule(timeInSeconds: number, repeats: boolean, context: any, onTime: (timer: ITimer) => void): Timer;
        onOrientationChanged(): void;
        startDebugDraw(): void;
        /**
         * 在一个场景结束后，下一个场景开始之前调用
         */
        onSceneChanged(): void;
        /**
         * 暂时运行SceneTransition，让一个场景通过自定义效果平滑地过渡到另一个场景
         * @param sceneTransition
         */
        static startSceneTransition<T extends SceneTransition>(sceneTransition: T): T;
        /**
         * 当屏幕大小发生改变时调用
         */
        protected onGraphicsDeviceReset(): void;
        protected initialize(): void;
        protected update(currentTime?: number): Promise<void>;
        protected draw(): void;
    }
}
declare module es {
    /**
     * 这里存放专门处理平台用的事件
     */
    class PlatformEvent {
        static initialize(): void;
        private static addDefaultRenderer;
        private static clearGraphics;
        private static createRenderTarget;
        private static disposeRenderTarget;
        private static setRenderTarget;
        private static setResolutionOffset;
        private static setResuolutionScale;
    }
}
declare module es {
    /**
     * 用于管理egret的资源管理器
     * egret因为有分组加载 所以在加载资源前要保证资源组先被加载完成
     */
    class AssetManager extends GlobalManager {
        /**
         * 加载资源
         * @param name
         * @param group
         * @param assetTask
         */
        load(name: string, group?: string, assetTask?: AssetTaskProgress): Promise<any>;
    }
    class AssetTaskReport implements RES.PromiseTaskReporter {
        private assetUserTask;
        constructor(assetTask?: AssetTaskProgress);
        onProgress(current: number, total: number, resItem: RES.ResourceInfo | undefined): void;
    }
    type AssetTaskProgress = (current: number, total: number, resItem: RES.ResourceInfo | undefined) => void;
    type AssetComplete = (res: any) => void;
}
declare module es {
    class SpriteAnimation {
        readonly sprites: Sprite[];
        readonly frameRate: number;
        constructor(sprites: Sprite[], frameRate?: number);
    }
}
declare module es {
    interface CameraInset {
        left: number;
        right: number;
        top: number;
        bottom: number;
    }
    class Camera extends Component implements ICamera {
        private _inset;
        private _bounds;
        private _transformMatrix;
        private _inverseTransformMatrix;
        private _projectionMatrix;
        private _origin;
        private _minimumZoom;
        private _zoom;
        private _maximumZoom;
        private _areMatrixedDirty;
        private _areBoundsDirty;
        private _isProjectionMatrixDirty;
        constructor();
        /**
         * 对entity.transform.position的快速访问
         */
        /**
        * 对entity.transform.position的快速访问
        * @param value
        */
        position: Vector2;
        /**
         * 对entity.transform.rotation的快速访问
         */
        /**
        * 对entity.transform.rotation的快速访问
        * @param value
        */
        rotation: number;
        /**
         * 原始的缩放值。这就是用于比例矩阵的精确值。默认值为1。
         */
        /**
        * 原始的缩放值。这就是用于比例矩阵的精确值。默认值为1。
        * @param value
        */
        rawZoom: number;
        /**
         * 缩放值应该在-1和1之间、然后将该值从minimumZoom转换为maximumZoom。
         * 允许你设置适当的最小/最大值，然后使用更直观的-1到1的映射来更改缩放
         */
        /**
        * 缩放值应该在-1和1之间、然后将该值从minimumZoom转换为maximumZoom。
        * 允许你设置适当的最小/最大值，然后使用更直观的-1到1的映射来更改缩放
        * @param value
        */
        zoom: number;
        /**
         * 相机变焦可以达到的最小非缩放值（0-number.max）。默认为0.3
         */
        /**
        * 相机变焦可以达到的最小非缩放值（0-number.max）。默认为0.3
        * @param value
        */
        minimumZoom: number;
        /**
         * 相机变焦可以达到的最大非缩放值（0-number.max）。默认为3
         */
        /**
        * 相机变焦可以达到的最大非缩放值（0-number.max）。默认为3
        * @param value
        */
        maximumZoom: number;
        /**
         * 摄像机的世界空间界限，对裁剪有用。
         */
        readonly bounds: Rectangle;
        /**
         * 用于从世界坐标转换到屏幕
         */
        readonly transformMatrix: Matrix2D;
        /**
         * 用于从屏幕坐标到世界的转换
         */
        readonly inverseTransformMatrix: Matrix2D;
        /**
         * 二维摄像机的投影矩阵
         */
        readonly projectionMatrix: Matrix;
        /**
         * 获取视图-投影矩阵，即变换矩阵*投影矩阵
         */
        readonly viewprojectionMatrix: Matrix;
        origin: Vector2;
        /**
         * 设置用于从视口边缘插入摄像机边界的量
         * @param left
         * @param right
         * @param top
         * @param bottom
         */
        setInset(left: number, right: number, top: number, bottom: number): Camera;
        /**
         * 对entity.transform.setPosition快速访问
         * @param position
         */
        setPosition(position: Vector2): this;
        /**
         * 对entity.transform.setRotation的快速访问
         * @param rotation
         */
        setRotation(rotation: number): Camera;
        /**
         * 设置缩放值，缩放值应该在-1到1之间。然后将该值从minimumZoom转换为maximumZoom
         * 允许您设置适当的最小/最大值。使用更直观的-1到1的映射来更改缩放
         * @param zoom
         */
        setZoom(zoom: number): Camera;
        /**
         * 相机变焦可以达到的最小非缩放值（0-number.max） 默认为0.3
         * @param minZoom
         */
        setMinimumZoom(minZoom: number): Camera;
        /**
         * 相机变焦可以达到的最大非缩放值（0-number.max） 默认为3
         * @param maxZoom
         */
        setMaximumZoom(maxZoom: number): Camera;
        /**
         * 这将迫使矩阵和边界变脏
         */
        forceMatrixUpdate(): void;
        onEntityTransformChanged(comp: transform.Component): void;
        zoomIn(deltaZoom: number): void;
        zoomOut(deltaZoom: number): void;
        /**
         * 将一个点从世界坐标转换到屏幕
         * @param worldPosition
         */
        worldToScreenPoint(worldPosition: Vector2): Vector2;
        /**
         * 将点从屏幕坐标转换为世界坐标
         * @param screenPosition
         */
        screenToWorldPoint(screenPosition: Vector2): Vector2;
        /**
         * 当场景渲染目标尺寸发生变化时，我们会更新摄像机的原点，并调整位置，使其保持在原来的位置
         * @param newWidth
         * @param newHeight
         */
        onSceneRenderTargetSizeChanged(newWidth: number, newHeight: number): void;
        protected updateMatrixes(): void;
    }
}
declare module es {
    class CameraShake extends Component implements IUpdatable {
        _shakeDirection: Vector2;
        _shakeOffset: Vector2;
        _shakeIntensity: number;
        _shakeDegredation: number;
        /**
         * 如果震动已经在运行，只有震动强度>当前shakeIntensity, 将覆盖当前值
         * 如果shake当前不是活动的，它将被启动。
         * @param shakeIntensify 震动强度
         * @param shakeDegredation 较高的值会导致更快的停止震动
         * @param shakeDirection 0只会导致x/y轴上的振动。任何其他的值将导致通过在抖动方向*强度是相机移动偏移
         */
        shake(shakeIntensify?: number, shakeDegredation?: number, shakeDirection?: Vector2): void;
        update(): void;
    }
}
declare module es {
    enum CameraStyle {
        lockOn = 0,
        cameraWindow = 1
    }
    class FollowCamera extends Component implements IUpdatable {
        camera: Camera;
        /**
         * 如果相机模式为cameraWindow 则会进行缓动移动
         * 该值为移动速度
         */
        followLerp: number;
        /**
         * 在cameraWindow模式下，宽度/高度被用做边界框，允许在不移动相机的情况下移动
         * 在lockOn模式下，只使用deadZone的x/y值 你可以通过直接setCenteredDeadzone重写它来自定义deadZone
         */
        deadzone: Rectangle;
        /**
         * 相机聚焦于屏幕中心的偏移
         */
        focusOffset: Vector2;
        /**
         * 如果为true 相机位置则不会超出地图矩形（0, 0, mapwidth, mapheight）
         */
        mapLockEnabled: boolean;
        mapSize: Rectangle;
        _targetEntity: Entity;
        _targetCollider: Collider;
        _desiredPositionDelta: Vector2;
        _cameraStyle: CameraStyle;
        _worldSpaceDeadZone: Rectangle;
        constructor(targetEntity?: Entity, camera?: Camera, cameraStyle?: CameraStyle);
        onAddedToEntity(): void;
        onGraphicsDeviceReset(): void;
        update(): void;
        /**
         * 固定相机 永远不会离开地图的可见区域
         * @param position
         */
        clampToMapSize(position: Vector2): Vector2;
        follow(targetEntity: Entity, cameraStyle?: CameraStyle): void;
        updateFollow(): void;
        /**
         * 以给定的尺寸设置当前相机边界中心的死区
         * @param width
         * @param height
         */
        setCenteredDeadzone(width: number, height: number): void;
    }
}
declare module es {
    class SpriteRenderer extends Component {
        constructor(sprite?: Sprite | egret.Texture);
        protected _origin: Vector2;
        /**
         * 精灵的原点。这是在设置精灵时自动设置的
         */
        /**
        * 精灵的原点。这是在设置精灵时自动设置的
        * @param value
        */
        origin: Vector2;
        protected _sprite: Sprite;
        /**
         * 应该由这个精灵显示的精灵
         * 当设置时，精灵的原点也被设置为精灵的origin
         */
        /**
        * 应该由这个精灵显示的精灵
        * 当设置时，精灵的原点也被设置为精灵的origin
        * @param value
        */
        sprite: Sprite;
        /**
         * 设置精灵并更新精灵的原点以匹配sprite.origin
         * @param sprite
         */
        setSprite(sprite: Sprite): SpriteRenderer;
        /**
         * 设置可渲染的原点
         * @param origin
         */
        setOrigin(origin: Vector2): SpriteRenderer;
    }
}
declare module es {
    enum LoopMode {
        /** 在一个循环序列[A][B][C][A][B][C][A][B][C]... */
        loop = 0,
        /** [A][B][C]然后暂停，设置时间为0 [A] */
        once = 1,
        /** [A][B][C]。当它到达终点时，它会继续播放最后一帧，并且不会停止播放 */
        clampForever = 2,
        /** 在乒乓循环中永远播放序列[A][B][C][B][A][B][C][B]...... */
        pingPong = 3,
        /** 向前播放一次序列，然后回到起点[A][B][C][B][A]，然后暂停并将时间设置为0 */
        pingPongOnce = 4
    }
    enum State {
        none = 0,
        running = 1,
        paused = 2,
        completed = 3
    }
    /**
     * SpriteAnimator处理精灵的显示和动画
     */
    class SpriteAnimator extends SpriteRenderer implements IUpdatable {
        /**
         * 在动画完成时触发，包括动画名称
         */
        onAnimationCompletedEvent: (string: any) => void;
        /**
         * 动画播放速度
         */
        speed: number;
        /**
         * 动画的当前状态
         */
        animationState: State;
        /**
         * 当前动画
         */
        currentAnimation: SpriteAnimation;
        /**
         * 当前动画的名称
         */
        currentAnimationName: string;
        /**
         * 当前动画的精灵数组中当前帧的索引
         */
        currentFrame: number;
        _elapsedTime: number;
        _loopMode: LoopMode;
        constructor(sprite?: Sprite);
        /**
         * 检查当前动画是否正在运行
         */
        readonly isRunning: boolean;
        private _animations;
        /** 提供对可用动画列表的访问 */
        readonly animations: Map<string, SpriteAnimation>;
        update(): void;
        /**
         * 添加一个SpriteAnimation
         * @param name
         * @param animation
         */
        addAnimation(name: string, animation: SpriteAnimation): SpriteAnimator;
        /**
         * 以给定的名称放置动画。如果没有指定循环模式，则默认为循环
         * @param name
         * @param loopMode
         */
        play(name: string, loopMode?: LoopMode): void;
        /**
         * 检查动画是否在播放（即动画是否处于活动状态，可能仍处于暂停状态）
         * @param name
         */
        isAnimationActive(name: string): boolean;
        /**
         * 暂停动画
         */
        pause(): void;
        /**
         * 继续动画
         */
        unPause(): void;
        /**
         * 停止当前动画并将其设为null
         */
        stop(): void;
    }
}
declare module es {
    /**
     * 封装类，它拥有Batcher的实例和助手，因此它可以被传来传去，绘制任何东西
     */
    class Graphics {
        static instance: Graphics;
        /**
         * 所有的2D渲染都是通过这个Batcher实例完成的
         */
        batcher: Batcher;
        /**
         *  用于绘制矩形、线条、圆形等的精灵。将在启动时生成，但你可以用你的图集中的精灵代替，以减少纹理交换。应该是一个1x1的白色像素
         */
        pixelTexture: Sprite;
        static gl: WebGLRenderingContext;
        constructor();
        unload(): void;
    }
}
declare module es {
    class GraphicsDevice {
        private _viewport;
        private _isDisposed;
        /**
         * 从唯一的字节流中缓存效果
         */
        effectCache: Map<number, egret.CustomFilter>;
        /**
         * 对全局资源列表使用WeakReference，因为我们不知道资源何时会被处置和收集。
         * 我们不希望通过在该列表中持有强引用来阻止资源被收集
         */
        private readonly _resources;
        constructor(width: number, height: number);
        private setup;
        protected dispose(disposing: boolean): void;
        viewport: Viewport;
        addResourceReference(resourceReference: any): void;
        removeResourceReference(resourceReference: any): void;
        static getTitleSafeArea(x: number, y: number, width: number, height: number): Rectangle;
        private static platformGetTitleSafeArea;
    }
}
declare module es {
    /**
     * 便利的子类，有一个单一的属性，可以投递Effect，使配置更简单
     */
    class Material implements IMaterial {
        /** 默认材料实例 */
        static defaultMaterial: Material;
        /** Batcher为当前RenderableComponent使用的效果 */
        effect: egret.CustomFilter;
        constructor(effect: egret.CustomFilter);
        dispose(): void;
        /**
         * 在Batcher.begin开始前初始化设置材质时调用，以允许任何有参数的Effects在必要时根据Camera Matrix进行设置
         * 例如通过Camera.viewProjectionMatrix模仿Batcher的做法设置MatrixTransform。
         * 只有当有一个非空的Effect时才会被调用
         * @param camera
         */
        onPreRender(camera: Camera): void;
        /**
         * 这里非常基本。我们只检查指针是否相同
         * @param other
         */
        compareTo(other: Material): 0 | 1 | -1;
        /**
         * 克隆材料。
         * 请注意，效果不是克隆的。它与原始材料是同一个实例
         */
        clone(): Material;
    }
}
declare module es {
    /**
     * 定义镜像的精灵可视化选项
     */
    enum SpriteEffects {
        /**
         * 没有指定选项
         */
        none = 0,
        /**
         * 沿X轴反向渲染精灵
         */
        flipHorizontally = 1,
        /**
         * 沿Y轴反向渲染精灵
         */
        flipVertically = 2
    }
}
declare module es {
    /** 描述渲染目标表面的视图边界 */
    class Viewport {
        x: number;
        y: number;
        width: number;
        height: number;
        minDepth: number;
        maxDepth: number;
        /**
         * 该视口的长宽比，即宽度/高度
         */
        readonly aspectRatio: number;
        /**
         * 获取或设置该视口的边界
         */
        bounds: Rectangle;
        /**
         * 返回保证在低质量显示器上可见的视口子集
         */
        readonly titleSafeArea: Rectangle;
        constructor(x: number, y: number, width: number, height: number);
    }
}
declare module es {
    /**
     * 这个类的存在只是为了让我们可以偷偷地把Batcher带过去
     */
    abstract class GraphicsResource extends egret.DisplayObjectContainer {
        graphicsDevice: GraphicsDevice;
        isDisposed: boolean;
        private _graphicsDevice;
        private _selfReference;
        protected dispose(disposing: boolean): void;
        updateResourceReference(shouldAdd: boolean): void;
    }
}
declare module es {
    class Batcher extends GraphicsResource implements IBatcher {
        /**
         * 创建投影矩阵时要使用的矩阵
         */
        readonly transformMatrix: Matrix;
        /**
         * 如果为true，则将在绘制目标位置之前将其四舍五入
         */
        shouldRoundDestinations: boolean;
        private _shouldIgnoreRoundingDestinations;
        private _textureInfo;
        private _spriteEffect;
        private _beginCalled;
        private _disableBatching;
        private _numSprites;
        private _transformMatrix;
        private _projectionMatrix;
        private _matrixTransformMatrix;
        private _customEffect;
        private _displayObject;
        private readonly MAX_SPRITES;
        static readonly _cornerOffsetX: number[];
        static readonly _cornerOffsetY: number[];
        constructor(graphicsDevice: GraphicsDevice);
        disposed(): void;
        protected dispose(disposing: boolean): void;
        begin(effect: egret.CustomFilter, transformationMatrix?: Matrix, disableBatching?: boolean): void;
        end(): void;
        prepRenderState(): void;
        /**
         * 设置是否应忽略位置舍入。在为调试绘制基元时很有用
         * @param shouldIgnore
         */
        setIgnoreRoundingDestinations(shouldIgnore: boolean): void;
        drawHollowRect(rect: Rectangle, color: number, thickness?: number): void;
        drawHollowBounds(x: number, y: number, width: number, height: number, color: number, thickness?: number): void;
        drawLine(start: Vector2, end: Vector2, color: number, thickness: any): void;
        drawLineAngle(start: Vector2, radians: number, length: number, color: number, thickness: number): void;
        drawPixel(position: Vector2, color: number, size?: number): void;
        drawPolygon(position: Vector2, points: Vector2[], color: number, closePoly?: boolean, thickness?: number): void;
        drawCircle(position: Vector2, radius: number, color: number, thickness?: number, resolution?: number): void;
        draw(texture: egret.Texture, position: Vector2, color?: number, rotation?: number, origin?: Vector2, scale?: Vector2, effects?: SpriteEffects): void;
        private checkBegin;
        private pushSprite;
        flushBatch(): void;
        drawPrimitives(texture: egret.Texture, baseSprite: number, batchSize: number): void;
    }
}
declare module es {
    class SpriteEffect extends egret.CustomFilter {
        static readonly defaultVert: string;
        static readonly primitive_frag: string;
        constructor();
        setMatrixTransform(matrixTransform: Matrix): void;
    }
}
declare module es {
    /**
     * 渲染器被添加到一个场景中，并处理所有对RenderableComponent.render和Entity.debugRender的实际调用。
     * 一个简单的渲染器可以直接启动Batcher.instanceGraphics.batcher，也可以创建自己的本地Batcher实例
     */
    abstract class Renderer implements IComparer<Renderer>, IRenderer {
        /** Batcher使用的材料。任何RenderableComponent都可以覆盖它 */
        material: Material;
        /**
         * 渲染器用于渲染的Camera(实际上是它的transformMatrix和culling的边界)。
         * 这是一个方便的字段，不是必需的。
         * 渲染器子类可以在调用beginRender时选择使用的摄像机
         */
        camera: Camera;
        /**
         * 指定场景调用渲染器的顺序
         */
        renderOrder: number;
        /**
         * 如果renderTarget不是空的，这个渲染器将渲染到RenderTarget中，而不是渲染到屏幕上
         */
        renderTexture: egret.Texture;
        /**
         * 标志，决定是否要调试渲染。
         * 渲染方法接收一个bool(debugRenderEnabled)让渲染器知道全局调试渲染是否开启/关闭。
         * 然后渲染器使用本地的bool来决定是否应该调试渲染
         */
        shouldDebugRender: boolean;
        /**
         * 如果为true，场景将使用场景RenderTarget调用SetRenderTarget。
         * 如果Renderer有一个renderTexture，默认的实现会返回true
         */
        readonly wantsToRenderToSceneRenderTarget: boolean;
        /**
         * 如果为true，场景将在所有后处理器完成后调用渲染方法。
         * 这必须在调用Scene.addRenderer生效之前设置为true，并且Renderer不应该有renderTexture。
         * 使用这种类型的渲染器的主要原因是为了让你可以在不进行后期处理的情况下，在Scene的其余部分上渲染你的UI。
         * ScreenSpaceRenderer是一个将此设置为真的Renderer例子
         */
        wantsToRenderAfterPostProcessors: boolean;
        /**
         * 持有最后渲染的Renderable的当前材质（如果没有更改，则为Renderer.material）
         */
        protected _currentMaterial: Material;
        constructor(renderOrder: number, camera?: Camera);
        /**
         * 当Renderer被添加到场景中时被调用
         * @param scene
         */
        onAddedToScene(scene: Scene): void;
        /**
         * 当场景结束或该渲染器从场景中移除时，调用该函数，用于清理
         */
        unload(): void;
        /**
         * 如果使用了RenderTarget，这将会对其进行设置。
         * Batcher也会被启动。传
         * 递进来的Camera将被用来设置ViewPort（如果有ViewportAdapter）和Batcher变换矩阵
         * @param cam
         */
        protected beginRender(cam: Camera): void;
        abstract render(scene: Scene): any;
        /**
         * 渲染RenderableComponent冲洗Batcher，并在必要时重置当前材料
         * @param renderable
         * @param cam
         */
        protected renderAfterStateCheck(renderable: IRenderable, cam: Camera): void;
        /**
         * 通过呼叫结束然后开始，强行刷新Batcher
         * @param cam
         */
        private flushBatch;
        /**
         * 结束Batcher并清除RenderTarget（如果有RenderTarget）
         */
        protected endRender(): void;
        /**
         * 默认的debugRender方法只是循环浏览所有实体并调用entity.debugRender。
         * 请注意，此时你正处于一个批次的中间，所以你可能需要调用Batcher.End和Batcher.begin来清除任何等待渲染的材料和项目
         * @param scene
         * @param cam
         */
        protected debugRender(scene: Scene, cam: Camera): void;
        /**
         * 当默认的场景RenderTarget被调整大小时，以及在场景已经开始的情况下添加一个Renderer时，会被调用。
         * @param newWidth
         * @param newHeight
         */
        onSceneBackBufferSizeChanged(newWidth: number, newHeight: number): void;
        compare(other: Renderer): number;
    }
}
declare module es {
    class DefaultRenderer extends Renderer {
        constructor(renderOrder?: number, camera?: Camera);
        render(scene: Scene): void;
    }
}
declare module es {
    /**
     * 代表纹理图谱中的单个元素，由纹理和帧的源矩形组成
     */
    class Sprite {
        /** 实际的Texture2D */
        texture2D: egret.Texture;
        /** 该元素的Texture2D中的矩形 */
        readonly sourceRect: Rectangle;
        /** 纹理区域的UVs */
        readonly uvs: Rectangle;
        /** 如果它的原点是0,0，那么它就是sourceRect的中心 */
        readonly center: Vector2;
        /** RenderableComponent在使用该Sprite时应该使用的原点。默认为中心 */
        origin: Vector2;
        constructor(texture: egret.Texture, sourceRect?: Rectangle, origin?: Vector2);
        clone(): Sprite;
        /**
         * 提供一个Sprites列表，给定一个等行/等列的Sprites图集
         * @param texture
         * @param cellWidth
         * @param cellHeight
         * @param cellOffset 处理时要包含的第一个单元格。基于0的索引
         * @param maxCellsToInclude 包含的最大单元
         */
        static spritesFromAtlas(texture: egret.Texture, cellWidth: number, cellHeight: number, cellOffset?: number, maxCellsToInclude?: number): Sprite[];
    }
}
declare module es {
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
    abstract class SceneTransition {
        /**
         * 包含上一个场景的最后渲染。可以用来在加载新场景时遮挡屏幕
         */
        previousSceneRender: egret.RenderTexture;
        /**
         * 如果为真，框架将把前一个场景渲染到 previousSceneRender 中，这样你就可以用它来做过渡。
         */
        wantsPreviousSceneRender: boolean;
        /**
         * 如果为true，下一个场景将在后台线程上加载
         */
        loadSceneOnBackgroundThread: boolean;
        /**
         * 应该返回新加载的场景的函数
         */
        protected sceneLoadAction: () => Scene;
        /**
         * 在内部用于决定前一个场景是否应该渲染到 previousSceneRender 中。
         * 做双重任务，确保渲染只发生一次。
         */
        readonly hasPreviousSceneRender: boolean;
        /**
         * 在执行loadNextScene时被调用。
         * 这在进行场景间转换时非常有用，这样你就可以知道何时可以增加相机或重置任何实体
         */
        onScreenObscured: Function;
        /**
         * 当Transition完成执行后被调用，这样就可以调用其他工作，如启动另一个过渡
         */
        onTransitionCompleted: Function;
        /** 标志，表示这个过渡是否会加载新的场景 */
        _loadsNewScene: boolean;
        private _hasPreviousSceneRender;
        /**
         * 用来做两部分过渡。
         * 例如，淡入会先淡入黑色，然后当 _isNewSceneLoaded 变为 true 时，它会淡入。
         * 对于场景内的转场，_isNewSceneLoaded应该在中间点设置为true，就像加载了一个新的场景一样
         */
        _isNewSceneLoaded: boolean;
        constructor(sceneLoadAction?: () => Scene, wantsPreviousSceneRender?: boolean);
        protected loadNextScene(): IterableIterator<string>;
        /**
         * 这时你可以在产生一帧后加载你的新场景（所以第一次渲染调用发生在场景加载之前）
         */
        onBeginTransition(): any;
        /**
         * 在渲染场景之前被调用
         * @param batcher
         */
        preRener(batcher: Batcher): void;
        /**
         * 在这里做所有的渲染.static 这是一个基本的实现。任何特殊的渲染都应该覆盖这个方法。
         * @param batcher
         */
        render(batcher: Batcher): void;
        /**
         * 当你的转换完成并且新的场景被设置后，这个函数将被调用。
         */
        protected transitionComplete(): void;
        /**
         * 最常见的过渡类型似乎是将进度从0-1，如果你的过渡需要在场景加载后有一个_progress属性，这个方法就能帮你解决这个问题
         * @param effect
         * @param duration
         * @param easeType
         * @param reverseDirection
         */
        tickEffectProgressProperty(effect: egret.CustomFilter, duration: number, easeType?: EaseType, reverseDirection?: boolean): IterableIterator<any>;
    }
}
declare module es {
    /**
     * 使用图像来遮蔽部分场景，从最大到最小，然后通过旋转从最小到最大。
     * 过渡将为你卸载它。
     * Texture应该在应该遮蔽的地方是透明的，在应该遮蔽的地方是白色的
     */
    class ImageMaskTransition extends SceneTransition {
        /**
         * 出入时间
         */
        duration: number;
        /**
         * 遮罩后，在标记开始前的延迟时间
         */
        delayBeforeMaskOut: number;
        /**
         * 遮罩的最小比例
         */
        minScale: number;
        /**
         * 遮罩的最大比例
         */
        maxScale: number;
        /**
         * 用来制作比例动画的简易公式
         */
        scaleEaseType: EaseType;
        /**
         * 遮罩动画的最小旋转次数
         */
        minRotation: number;
        /**
         * 遮罩动画的最大旋转次数
         */
        maxRotation: number;
        /**
         * 用于旋转动画的简易方程
         */
        rotationEaseType: EaseType;
        private _renderScale;
        private _renderRotation;
        /**
         * 用作遮罩的纹理。在遮罩显示底层场景的地方应该是白色的，其他地方应该是透明的
         */
        private _maskTexture;
        /**
         * 遮罩的位置，屏幕的中心
         */
        private _maskPosition;
        /**
         * 遮罩的原点，纹理的中心
         */
        private _maskOrigin;
        /**
         * 遮罩首先被渲染成一个RenderTarget
         */
        private _maskRenderTarget;
        constructor(sceneLoadAction: () => Scene, maskTexture: egret.Texture);
        onBeginTransition(): any;
        preRender(batcher: Batcher): void;
        protected transitionComplete(): void;
        render(batcher: Batcher): void;
    }
}
