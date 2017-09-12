//////////////////////////////////////////////////////////////////
/// Mvdom Types 

// --------- Type Helpers --------- //
type Append = "first" | "last" | "empty" | "before" | "after";
type HookStage = "willCreate" | "didCreate" | "willInit" | "didInit" | "willDisplay" | "didDisplay" | "willPostDisplay" | "didPostDisplay" | "willRemove" | "didRemove";
type EventTargetOrMoreOrNull = EventTarget | NodeList | [HTMLElement] | null;
type HTMLElementOrNull = HTMLElement | null | undefined;
// --------- /Type Helpers --------- //

declare interface Config {
	append: Append;
}

// --------- Hub --------- //
declare interface EventOptions {
	/** The context with which the call back will be called (i.e. this context) */
	ctx?: object,
	/** The namespace used to bind this event, which will allow to remove all of the binding done with this namespace with .off */
	ns?: string
}

type NsObject = { ns: string };

declare interface EventInfo {
	cancelable: true | false;
	detail: any;
}

declare interface HubEventInfo {
	topic: string;
	label: string;
}

type HubSubHandler = (data: any, info: any) => void;

declare interface Hub {

	/** Subscribe a new hanlder to one or more topics ("," separated) */
	sub(topics: string, handler: HubSubHandler, opts?: EventOptions): void;
	/** Subscribe a new hanlder to one or more topics ("," separated) and one or more labels */
	sub(topics: string, labels: string, handler: HubSubHandler, opts?: EventOptions): void;

	/** Publish a message to a hub for a given topic  */
	pub(topic: string, message: any): void;
	/** Publish a message to a hub for a given topic and label  */
	pub(topic: string, label: string, message: any): void;

	/** Unsubscribe all subscription for a given namespace */
	unsub(nsObj: NsObject): void;

}
// --------- /Hub --------- //

// --------- View Interfaces --------- //
type eventBindings = { [name: string]: (this: AnyView, evt: Event) => void };
type hubBindings = { [selector: string]: (this: AnyView, data: any, info: HubEventInfo) => void } |
	{ [hubName: string]: { [selector: string]: (this: AnyView, data: any, info: HubEventInfo) => void } }

export declare interface ViewController {
	create?(data?: any, config?: Config): string | HTMLElement | DocumentFragment;
	init?(data?: any, config?: Config): any;
	postDisplay?(data?: any, config?: Config): any;
	destroy?(): any;

	events?: eventBindings | eventBindings[];

	docEvents?: eventBindings | eventBindings[];

	winEvents?: eventBindings | eventBindings[];

	hubEvents?: hubBindings | hubBindings[];

}

// for now, the View extends the ViewContoller (single object)
export declare interface View extends ViewController {
	/** Unique id of the view. Used in namespace binding and such.  */
	id: string;

	/** The view name or "class name". */
	name: string;

	/** The htmlElement created */
	el?: HTMLElement;
}

export declare interface AnyView extends View {
	[name: string]: any;
}
// --------- /View Interfaces --------- //



//////////////////////////////////////////////////////////////////
/// mvdom API

// --------- View --------- //
/** Register a new view controller with a name (used in mvdom.display(name, ...)) 
 *  @param name the name of the view controller type. Usually camel case (e.g., "MyView")
 *  @param viewController the controller object that will be used to instanatiate the view
*/
export function register(name: string, viewController: ViewController, config?: Config): void;

export function register<T extends ViewController>(viewControllerClass: { new(): T; }): void;

/** Create a new view instanced for this given name and append it to the parentEl
 * 
 *  @param viewName The view type name to be instantiated 
 *  @param parentEl Either a document element or a query selector that will be the parent
 *  @param data An optional data object to be passed to the view instance. Need to be null if config is present.
 *  @param config An optional config telling more information or append type
*/
export function display(viewName: string, parentEl: string | HTMLElementOrNull, data?: any | null, config?: Config | Append): Promise<View>;

export function display<C extends View>(viewController: { new(): C; }, parentEl: string | HTMLElementOrNull, data?: any | null, config?: Config | Append): Promise<C>;

/** Register a HookCallback function that will be called when any view reach this lifecycle stage */
export function hook(hookStage: HookStage, cb: (view: View) => void): void;

export function empty(el: HTMLElementOrNull): void;
export function remove(el: HTMLElementOrNull): void;
// --------- /View --------- //

// --------- DOM Event Helpers --------- //

/** Direct event binding to one of more HTML Element */
export function on(els: EventTargetOrMoreOrNull, types: string, listener: (evt: DocumentEvent) => void, opts?: EventOptions): void;
/** Selector based binding to one or more HTML ELement. Only one binding per els, but will use selector string to decide if the listener should be called (similar to jQuery.on) */
export function on(els: EventTargetOrMoreOrNull, types: string, selector: string, listener: (evt: any) => void, opts?: EventOptions): void;

export function off(els: EventTargetOrMoreOrNull, types: string, selector?: string, listener?: (evt: any) => void, nsObj?: NsObject): void;
export function off(els: EventTargetOrMoreOrNull, nsObj: { ns: string }): void;

export function trigger(els: EventTargetOrMoreOrNull, eventName: string, info?: EventInfo): void;
// --------- /DOM Event Helpers --------- //

// --------- DOM Query Helpers --------- //
export function all(el: HTMLElementOrNull, selector: string): NodeListOf<HTMLElement>;
export function all(selector: string): NodeListOf<HTMLElement>;

/** Shortchut to el.querySelector, but allow el to be null (in which case will return null) */
export function first(el: HTMLElementOrNull, selector: string): HTMLElementOrNull;
/** Shortcut for document.querySelector */
export function first(selector: string): HTMLElementOrNull;
/** find the firstElementChild (even from fragment for borwsers that do not support it) */
export function first(el: HTMLElementOrNull): HTMLElementOrNull;

/** Returns the next sibling element matching an optional selector (returns null if none)*/
export function next(el: HTMLElementOrNull, selector?: string): HTMLElementOrNull;
/** Returns the previous sibling element matching an optional selector (return null if none)*/
export function prev(el: HTMLElementOrNull, selector?: string): HTMLElementOrNull;

/** Find the closest HTMLElement from this element given a selector (including el if match). */
export function closest(el: HTMLElementOrNull, selector: string): HTMLElementOrNull;
// --------- /DOM Query Helpers --------- //

// --------- DOM Helpers --------- //
/** standard refEl.appendChild(newEl) (just here for symmetry) 
 * @returns the newEl
*/
export function append(refEl: HTMLElement, newEl: HTMLElement | DocumentFragment, append?: Append): HTMLElement;

/** Create a DocumentFragment from a string. (Use template.content with fallback on older browser) */
export function frag(html: string): DocumentFragment;
// --------- /DOM Helpers --------- //

// --------- push/pull --------- //
/** Push a data object into a DOM Element subtree (given the dx naming convention). */
export function push(el: HTMLElement, data: any): void;
export function push(el: HTMLElement, selector: string, data: any): void;

/** Extract a data object from a DOM Element subtree (given the dx naming convention). */
export function pull(el: HTMLElement, selector?: string, data?: any): any;

/** register pusher function set a value to a matching element */
export function pusher(selector: string, pusherFn: (value: any) => void): void;

/** register puller function returns the value from a matching element.
 * The pullerFn `this` context will be the domElement that we extract from and it should return the value. 
 */
export function puller(selector: string, pullerFn: () => any): void;
// --------- /push/pull --------- //

// --------- Hub (pub/sub) --------- //
export function hub(name: string): Hub;
// --------- /Hub (pub/sub) --------- //

