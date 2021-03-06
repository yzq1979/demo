import Group from '@antv/g-canvas/lib/group';
import { IItemBase, IItemBaseConfig } from '../interface/item';
import { IBBox, IShapeBase, ModelConfig, ShapeStyle, NodeConfig, EdgeConfig, ComboConfig, ITEM_TYPE } from '../types';
export default class ItemBase implements IItemBase {
    _cfg: IItemBaseConfig & {
        [key: string]: unknown;
    };
    destroyed: boolean;
    constructor(cfg: IItemBaseConfig);
    /**
     * 根据 keyshape 计算包围盒
     */
    private calculateBBox;
    /**
     * 根据 keyshape 计算包围盒
     */
    calculateCanvasBBox(): IBBox;
    /**
     * draw shape
     */
    private drawInner;
    /**
     * 设置图元素原始样式
     * @param keyShape 图元素 keyShape
     * @param group Group 容器
     */
    private setOriginStyle;
    /**
     * restore shape states
     * @param shapeFactory
     * @param shapeType
     */
    private restoreStates;
    protected init(): void;
    /**
     * 获取属性
     * @internal 仅内部类使用
     * @param  {String} key 属性名
     * @return {object | string | number} 属性值
     */
    get<T = any>(key: string): T;
    /**
     * 设置属性
     * @internal 仅内部类使用
     * @param {String|Object} key 属性名，也可以是对象
     * @param {object | string | number} val 属性值
     */
    set(key: string | object, val?: unknown): void;
    protected getDefaultCfg(): {};
    /**
     * 更新/刷新等操作后，清除 cache
     */
    protected clearCache(): void;
    /**
     * 渲染前的逻辑，提供给子类复写
     */
    protected beforeDraw(): void;
    /**
     * 渲染后的逻辑，提供给子类复写
     */
    protected afterDraw(): void;
    /**
     * 更新后做一些工作
     */
    protected afterUpdate(): void;
    /**
     * draw shape
     */
    draw(): void;
    getShapeStyleByName(name?: string): ShapeStyle | void;
    getShapeCfg(model: ModelConfig): ModelConfig;
    /**
     * 获取指定状态的样式，去除了全局样式
     * @param state 状态名称
     */
    getStateStyle(state: string): any;
    /**
     * get keyshape style
     */
    getOriginStyle(): ShapeStyle;
    getCurrentStatesStyle(): ShapeStyle;
    /**
     * 更改元素状态， visible 不属于这个范畴
     * @internal 仅提供内部类 graph 使用
     * @param {String} state 状态名
     * @param {Boolean} value 节点状态值
     */
    setState(state: string, value: string | boolean): void;
    /**
     * 清除指定的状态，如果参数为空，则不做任务处理
     * @param states 状态名称
     */
    clearStates(states?: string | string[]): void;
    /**
     * 节点的图形容器
     * @return {G.Group} 图形容器
     */
    getContainer(): Group;
    /**
     * 节点的关键形状，用于计算节点大小，连线截距等
     * @return {IShapeBase} 关键形状
     */
    getKeyShape(): IShapeBase;
    /**
     * 节点数据模型
     * @return {Object} 数据模型
     */
    getModel(): NodeConfig | EdgeConfig | ComboConfig;
    /**
     * 节点类型
     * @return {string} 节点的类型
     */
    getType(): ITEM_TYPE;
    /**
     * 获取 Item 的ID
     */
    getID(): string;
    /**
     * 是否是 Item 对象，悬空边情况下进行判定
     */
    isItem(): boolean;
    /**
     * 获取当前元素的所有状态
     * @return {Array} 元素的所有状态
     */
    getStates(): string[];
    /**
     * 当前元素是否处于某状态
     * @param {String} state 状态名
     * @return {Boolean} 是否处于某状态
     */
    hasState(state: string): boolean;
    /**
     * 刷新一般用于处理几种情况
     * 1. item model 在外部被改变
     * 2. 边的节点位置发生改变，需要重新计算边
     *
     * 因为数据从外部被修改无法判断一些属性是否被修改，直接走位置和 shape 的更新
     */
    refresh(): void;
    isOnlyMove(cfg?: ModelConfig): boolean;
    /**
     * 将更新应用到 model 上，刷新属性
     * @internal 仅提供给 Graph 使用，外部直接调用 graph.update 接口
     * @param  {Object} cfg       配置项，可以是增量信息
     */
    update(cfg: ModelConfig): void;
    /**
     * 更新元素内容，样式
     */
    updateShape(): void;
    /**
     * 更新位置，避免整体重绘
     * @param {object} cfg 待更新数据
     */
    updatePosition(cfg: ModelConfig): void;
    /**
     * 获取 item 的包围盒，这个包围盒是相对于 item 自己，不会将 matrix 计算在内
     * @return {Object} 包含 x,y,width,height, centerX, centerY
     */
    getBBox(): IBBox;
    /**
     * 获取 item 相对于画布的包围盒，会将从顶层到当前元素的 matrix 都计算在内
     * @return {Object} 包含 x,y,width,height, centerX, centerY
     */
    getCanvasBBox(): IBBox;
    /**
     * 将元素放到最前面
     */
    toFront(): void;
    /**
     * 将元素放到最后面
     */
    toBack(): void;
    /**
     * 显示元素
     */
    show(): void;
    /**
     * 隐藏元素
     */
    hide(): void;
    /**
     * 更改是否显示
     * @param  {Boolean} visible 是否显示
     */
    changeVisibility(visible: boolean): void;
    /**
     * 元素是否可见
     * @return {Boolean} 返回该元素是否可见
     */
    isVisible(): boolean;
    /**
     * 是否拾取及出发该元素的交互事件
     * @param {Boolean} enable 标识位
     */
    enableCapture(enable: boolean): void;
    destroy(): void;
}
