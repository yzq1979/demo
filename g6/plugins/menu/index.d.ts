import { IG6GraphEvent, Item } from '../../types';
import Base, { IPluginBaseConfig } from '../base';
import { IGraph } from '../../interface/graph';
interface MenuConfig extends IPluginBaseConfig {
    handleMenuClick?: (target: HTMLElement, item: Item) => void;
    getContent?: (graph?: IGraph) => HTMLDivElement | string;
    offsetX?: number;
    offsetY?: number;
    shouldBegin?: (evt?: IG6GraphEvent) => boolean;
    itemTypes?: string[];
}
export default class Menu extends Base {
    constructor(cfg?: MenuConfig);
    getDefaultCfgs(): MenuConfig;
    getEvents(): {
        contextmenu: string;
    };
    init(): void;
    protected onMenuShow(e: IG6GraphEvent): void;
    private onMenuHide;
    destroy(): void;
}
export {};
