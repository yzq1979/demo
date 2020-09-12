import { IG6GraphEvent } from '../../types';
import Base, { IPluginBaseConfig } from '../base';
interface TooltipConfig extends IPluginBaseConfig {
    getContent?: (evt?: IG6GraphEvent) => HTMLDivElement | string;
    offsetX?: number;
    offsetY?: number;
    shouldBegin?: (evt?: IG6GraphEvent) => boolean;
    itemTypes?: string[];
}
export default class Tooltip extends Base {
    private currentTarget;
    constructor(cfg?: TooltipConfig);
    getDefaultCfgs(): TooltipConfig;
    getEvents(): {
        'node:mouseenter': string;
        'node:mouseleave': string;
        'node:mousemove': string;
        'edge:mouseenter': string;
        'edge:mouseleave': string;
        'edge:mousemove': string;
        afterremoveitem: string;
    };
    init(): void;
    onMouseEnter(e: IG6GraphEvent): void;
    onMouseMove(e: IG6GraphEvent): void;
    onMouseLeave(): void;
    showTooltip(e: IG6GraphEvent): void;
    hideTooltip(): void;
    updatePosition(e: IG6GraphEvent): void;
    destroy(): void;
}
export {};
