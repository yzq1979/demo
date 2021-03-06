import GCanvas from '@antv/g-canvas/lib/canvas';
import Base, { IPluginBaseConfig } from '../base';
import { ShapeStyle } from '../../types';
interface MiniMapConfig extends IPluginBaseConfig {
    viewportClassName?: string;
    type?: 'default' | 'keyShape' | 'delegate';
    width?: number | undefined;
    height?: number | undefined;
    delegateStyle?: ShapeStyle;
    refresh?: boolean;
    graphImg?: string;
}
export default class ImageMiniMap extends Base {
    constructor(cfg?: MiniMapConfig);
    getDefaultCfgs(): MiniMapConfig;
    getEvents(): {
        beforepaint: string;
        beforeanimate: string;
        afteranimate: string;
        viewportchange: string;
    };
    protected disableRefresh(): void;
    protected enableRefresh(): void;
    protected disableOneRefresh(): void;
    private initViewport;
    /**
     * 更新 viewport 视图
     */
    private updateViewport;
    init(): void;
    /**
     * 初始化 Minimap 的容器
     */
    initContainer(): void;
    private updateImgSize;
    updateCanvas(): void;
    /**
     * 获取minimap的画布
     * @return {GCanvas} G的canvas实例
     */
    getCanvas(): GCanvas;
    /**
     * 获取minimap的窗口
     * @return {HTMLElement} 窗口的dom实例
     */
    getViewport(): HTMLElement;
    /**
     * 获取minimap的容器dom
     * @return {HTMLElement} dom
     */
    getContainer(): HTMLElement;
    updateGraphImg(img: string): void;
    destroy(): void;
}
export {};
