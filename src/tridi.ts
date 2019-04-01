/*
  Tridi - JavaScript 3D Image Viewer
  Author: Łukasz Wójcik
  License: MIT
  Homepage: https://tridi.lukem.net
  GitHub: http://github.com/lukemnet/tridi
*/

type ImageArray = ReadonlyArray<string>;
type NumberedImages = 'numbered';

interface TridiOptions {
  element: string,
  images: ImageArray | NumberedImages,
  imageFormat?: string,
  imageformat?: string,
  imageCount?: number,
  imagecount?: number,
  imageLocation?: string,
  count?: number,
  showHintOnStartup?: boolean,
  lazy?: boolean,
  hintText?: string | null,
  draggable?: boolean,
  autoplay?: boolean,
  autoPlay?: boolean,
  autoplaySpeed?: number,
  autoplayspeed?: number,
  stopAutoplayOnClick?: boolean,
  stopAutoplayOnMouseenter?: boolean,
  resumeAutoplayOnMouseleave?: boolean,
  resumeAutoplayDelay: number,
  buttons?: boolean,
  scroll?: boolean,
  spinner? :boolean,
  mousewheel?: boolean,
  wheelInverse?: boolean,
  dragInterval?: number,
  draginterval?: number,
  touchDragInterval?: number,
  mouseleaveDetect?: boolean,
  touch?: boolean,
  inverse?: boolean,
  playable?: boolean,
  verbose?: boolean,
  debug?: boolean,
}

class Tridi {
  element: string;
  images?: ImageArray | NumberedImages;
  imageFormat?: string;
  imageLocation?: string;
  imageCount?: number;
  draggable?: boolean;
  showHintOnStartup?: boolean;
  hintText?: string | null;
  lazy?: boolean;
  autoplay?: boolean;
  autoplaySpeed?: number;
  stopAutoplayOnClick?: boolean;
  stopAutoplayOnMouseenter?: boolean;
  resumeAutoplayOnMouseleave?: boolean;
  resumeAutoplayDelay: number;
  buttons?: boolean;
  scroll?: boolean;
  spinner?: boolean;
  dragInterval?: number;
  touchDragInterval?: number;
  mouseleaveDetect?: boolean;
  touch?: boolean;
  mousewheel?: boolean;
  wheelInverse?: boolean;
  inverse?: boolean;
  verbose: boolean;
  private imageIndex: number;
  private moveBuffer: number[];
  private moveState: number;
  private dragActive: boolean;
  private intervals: any[];
  private timeouts: any[];
  // private loaded: boolean;

  constructor(options: TridiOptions) {
    this.validateOptions(options);
    
    this.element = options.element;
    this.images = options.images  || 'numbered';
    this.imageFormat = options.imageFormat || undefined;
    this.imageLocation = options.imageLocation || './images';
    this.imageCount = Array.isArray(this.images) ? this.images.length : (options.imageCount)! || options.imagecount || options.count;
    this.draggable = typeof options.draggable !== 'undefined' ? options.draggable : true;
    this.showHintOnStartup = options.showHintOnStartup || false;
    this.hintText = options.hintText || null;
    this.lazy = options.lazy || false;
    this.autoplay = options.autoplay || false;
    this.autoplaySpeed = typeof options.autoplaySpeed !== 'undefined' ? options.autoplaySpeed || options.autoplayspeed : 50;
    this.stopAutoplayOnClick = options.stopAutoplayOnClick || false;
    this.stopAutoplayOnMouseenter = options.stopAutoplayOnMouseenter || false;
    this.resumeAutoplayOnMouseleave = options.resumeAutoplayOnMouseleave || false;
    this.resumeAutoplayDelay = options.resumeAutoplayDelay || 0;
    this.buttons = options.buttons || false;
    this.scroll = options.scroll || false;
    this.spinner = typeof options.spinner !== 'undefined' ? options.spinner : false;
    this.touch = typeof options.touch !== 'undefined' ? options.touch : true;
    this.mousewheel = options.mousewheel || false;
    this.wheelInverse = options.wheelInverse || false;
    this.inverse = options.inverse || false;
    this.dragInterval = options.dragInterval || 1;
    this.touchDragInterval = options.touchDragInterval || 1;
    this.mouseleaveDetect = typeof options.mouseleaveDetect !== 'undefined' ? options.mouseleaveDetect : false;
    this.verbose = options.verbose || options.debug || false;
    this.imageIndex = 1;
    this.moveBuffer = [];
    this.moveState = 0;
    this.dragActive = false;
    this.intervals = [];
    this.timeouts = [];
    // this.loaded = false;

    if (this.verbose) console.log(Tridi.header(this.element), 'Class intialized');
  }

  static header(element?: string) {
    return `Tridi${element ? ` [${element}]` : ''}:`;
  }

  private validateOptions = (options: TridiOptions) => {
    if (!options.element) {
      console.error(
        Tridi.header(),
        `'element' property is missing or invalid. Container element must be specified.`
      );
    }

    if (typeof options.images === 'undefined' && typeof options.imageFormat === 'undefined') {
      console.error(
        Tridi.header(),
        `'imageFormat' property is missing or invalid. Image format must be provided for 'numbered' property.`
      );
    }

    if (options.images === 'numbered' && !options.imageLocation) {
      console.error(
        Tridi.header(),
        `'imageLocation' property is missing or invalid. Image location must be provided for 'numbered' property.`
      );
    }

    if (Array.isArray(options.images) && options.imageFormat) {
      console.warn(
        Tridi.header(),
        `Got array of images as initalizing parameter. 'imageFormat' property will be ignored.`
      );
    }

    if (Array.isArray(options.images) && options.imageLocation) {
      console.warn(
        Tridi.header(),
        `Got array of images as initalizing parameter. 'imageLocation' property will be ignored.`
      );
    }

    if (Array.isArray(options.images) && options.imageCount) {
      console.warn(
        Tridi.header(),
        `Got array of images as initalizing parameter. 'imageCount' property will be ignored.`
      );
    }

    if (!options.showHintOnStartup && options.hintText) {
      console.warn(
        Tridi.header(),
        `'showHintOnStartup is set to 'false'. 'hintText' parameter will be ignored.`
      );
    }

    if (!options.draggable && options.mouseleaveDetect) {
      console.warn(
        Tridi.header(),
        `'draggable is set to 'false'. 'mouseleaveDetect' parameter will be ignored.`
      );
    }

    if (!options.autoplay && options.autoplaySpeed) {
      console.warn(
        Tridi.header(),
        `'autoplay is set to 'false'. 'autoplaySpeed' parameter will be ignored.`
      );
    }

    if (!options.autoplay && options.stopAutoplayOnMouseenter) {
      console.warn(
        Tridi.header(),
        `'autoplay is set to 'false'. 'stopAutoplayOnMouseenter' parameter will be ignored.`
      );
    }

    if (!options.autoplay && options.resumeAutoplayOnMouseleave) {
      console.warn(
        Tridi.header(),
        `'autoplay is set to 'false'. 'resumeAutoplayOnMouseleave' parameter will be ignored.`
      );
    }

    if (!options.autoplay && options.resumeAutoplayDelay) {
      console.warn(
        Tridi.header(),
        `'autoplay is set to 'false'. 'resumeAutoplayDelay' parameter will be ignored.`
      );
    }
  }

  private appendClass(element: Element, className:string) {
    element.className += element.className.length === 0 ? className : ` ${className}`;
  }

  private addClassName(element: Element, className:string | ReadonlyArray<string>) {
    if (typeof className === 'string') {
      if (!element.classList.contains(className)) {
        this.appendClass(element, className);
      }
    } else if (Array.isArray(className)) {
      className.forEach(clname => {
        if (!element.classList.contains(clname)) {
          this.appendClass(element, clname);
        }
      });
    }
  }

  private removeClassName(element: Element, className:string | ReadonlyArray<string>) {
    if (typeof className === 'string') {
      if (element.classList.contains(className)) {
        element.classList.remove(className);
      }
    } else if (Array.isArray(className)) {
      className.forEach(clname => {
        if (element.classList.contains(clname)) {
          element.classList.remove(clname);
        }
      })
    }
  }

  private getContainer() {
    return <HTMLElement>document.querySelector(this.element);
  }

  private getViewer() {
    return <HTMLElement>document.querySelector(`${this.element}.tridi-viewer`)!;
  }

  private getStash() {
    return <HTMLElement>document.querySelector(`${this.element} .tridi-stash`);
  }

  private getLeftButton() {
    return <HTMLElement>document.querySelector(`${this.element} .tridi-btn-left`);
  }

  private getRightButton() {
    return <HTMLElement>document.querySelector(`${this.element} .tridi-btn-right`);
  }

  private getHintOverlay() {
    return <HTMLElement>document.querySelector(`${this.element} .tridi-hint-overlay`);
  }

  private getLoadingScreen() {
    return <HTMLElement>document.querySelector(`${this.element} .tridi-loading`)
  }

  private getImage(whichImage: number) {
    return this.getImages()![whichImage -1];
  }

  private getFirstImage() {
    return this.getImage(1);
  }

  private getViewerImage() {
    return <HTMLImageElement>document.querySelector(`${this.element}.tridi-viewer .tridi-viewer-image`)!;
  }

  private lazyLoad(callback: Function, skip?: Boolean) {
    if (this.lazy && !skip) {
      const viewerImage = this.getViewerImage();

      viewerImage.addEventListener('click', () => {
        callback();
      });
    } else {
      callback();
    }
  }

  private getImages() {
    if (this.images === 'numbered') {
      const count = this.imageCount;
      const location = this.imageLocation;
      const format = this.imageFormat;
      return Array.from(new Array(count),({},index) => `${location}/${index + 1}.${format}`);
    } else if (Array.isArray(this.images)) {
      return this.images as ReadonlyArray<string>;
    } else {
      console.error(Tridi.header(this.element), 'Error getting images from source.');
      return null;
    }
  }

  private generateViewer() {
    const container = this.getContainer();
    if (!container) {
      console.error(this.element, `Viewer element not found`);
    } else {
      if (this.verbose) console.log(Tridi.header(this.element), 'Appending Tridi CSS classes');
      this.addClassName(container,
        [
          // 'tridi-loading',
          'tridi-viewer',
          `tridi-viewer-${this.element.substr(1)}`,
          `tridi-draggable-${this.draggable}`,
          `tridi-touch-${this.touch}`,
          `tridi-mousewheel-${this.mousewheel}`,
          `tridi-wheelInverse-${this.wheelInverse}`,
          `tridi-showHintOnStartup-${this.showHintOnStartup}`,
          `tridi-lazy-${this.lazy}`,
          `tridi-buttons-${this.buttons}`,
        ]);
    }
  }

  private generateLoadingScreen() {
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'tridi-loading';
    loadingScreen.style.display = 'none';

    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'tridi-spinner';
    loadingScreen.appendChild(loadingSpinner);

    this.getViewer().appendChild(loadingScreen);
  }

  private setLoadingState(enable: boolean) {
    this.getLoadingScreen().style.display = enable ? 'block' : 'none';
  }

  private generateStash() {
    const stash = this.getStash();
    if (!stash) {
      if (this.verbose) console.log(Tridi.header(this.element), 'Generating image stash');
      const stashElement = document.createElement('div');
      stashElement.className = 'tridi-stash';
      stashElement.style.display = 'none';
      this.getViewer().appendChild(stashElement);
    }
  }

  private displayHintOnStartup(callback: Function) {
    if (this.showHintOnStartup) {
      if (this.verbose) console.log(Tridi.header(this.element), 'Generating hint on startup');
      
      const element = this.element.substr(1);
      const hintOverlay = document.createElement('div');
      hintOverlay.className = `tridi-hint-overlay tridi-${element}-hint-overlay`;
      hintOverlay.tabIndex = 0;

      const hint = document.createElement('div');
      hint.className = 'tridi-hint';

      if (this.hintText) hint.innerHTML = `<span class="tridi-hint-text tridi-${element}-hint-text">${this.hintText}</span>`;

      hintOverlay.appendChild(hint);
      
      this.getViewer().appendChild(hintOverlay);

      const hintClickHandler = (e: Event) => {
        const isItHintOverlay = (e.target as HTMLElement).classList.contains(`tridi-${element}-hint-overlay`);
        const isItHintText = (e.target as HTMLElement).classList.contains(`tridi-${element}-hint-text`);
        
        if (isItHintOverlay || isItHintText) {
          this.getHintOverlay().style.display = 'none';
          callback();
        }
      }

      document.addEventListener('click', hintClickHandler);

      document.addEventListener('keydown', (e) => {
        if (e.which === 13) hintClickHandler(e);
      });
    } else {
      callback();
    }
  }

  private populateStash() {
      const stash = this.getStash();
      const images = this.getImages();
      
      if (stash && images) {
        images.forEach((image, index) => {
          stash.innerHTML += `<img src="${image}" class="tridi-image-${index+1}" alt="" />`;
        });
      } else {
        console.error(this.element, 'Error populating stash!');
      }
  }



  private generateViewerImage() {
    if (this.verbose) console.log(Tridi.header(this.element), 'Generating first image');
    const element = this.element.substr(1);
    const viewer = this.getViewer();
    const image = this.getFirstImage();

    viewer.innerHTML = `<img src="${image}" alt="" class="tridi-viewer-image tridi-viewer-${element}-image" draggable="false" />` + viewer!.innerHTML ;
  }

  private nextFrame() {
    const viewerImage = this.getViewerImage();
    
    this.imageIndex = this.imageIndex <= 1
      ? this.imageCount!
      : this.imageIndex - 1;

    viewerImage.src = this.getImage(this.imageIndex);
  }

  private previousFrame() {
    const viewerImage = this.getViewerImage();

    this.imageIndex = this.imageIndex >= this.imageCount!
      ? 1
      : this.imageIndex + 1

      viewerImage.src = this.getImage(this.imageIndex);
  }

  private rotateViewerImage(e: MouseEvent | TouchEvent) {
    const touch = (e as TouchEvent).touches;
    const interval = touch ? this.touchDragInterval : this.dragInterval;

    this.moveState += 1;

    const eventX = (e as TouchEvent).touches
      ? (e as TouchEvent).touches[0].clientX
      : (e as MouseEvent).clientX;

    const coord = (eventX - this.getViewerImage().offsetLeft);
    this.moveBuffer.push(coord);
    
    const moveLength = this.moveBuffer.length;
    const oldMove = this.moveBuffer[moveLength - 2];
    const newMove = this.moveBuffer[moveLength - 1];
    const threshold = !(this.moveState % interval!);

    const nextMove = () => this.inverse ? this.previousFrame() : this.nextFrame();
    const previousMove = () => this.inverse ? this.nextFrame() : this.previousFrame();

    if (threshold) {
      if (newMove < oldMove) {
        nextMove();
      } else if (newMove > oldMove) {
        previousMove();
      }
    }
  }

  private startDragging() {
    const viewer = this.getViewer();
    this.addClassName(viewer, 'tridi-dragging');
    this.dragActive = true;
  }

  private stopDragging() {
    const viewer = this.getViewer();
    this.removeClassName(viewer, 'tridi-dragging');
    this.dragActive = false;
  }

  private resetMoveBuffer() {
    this.moveBuffer = [];
  }

  private attachCosmeticEvents() {
    if (this.verbose) console.log(Tridi.header(this.element), 'Attaching common events');

    const viewer = this.getViewer();

    viewer.addEventListener('mouseenter', () => {
      if (this.verbose) console.log(Tridi.header(this.element), 'Mouseenter event triggered');
      this.addClassName(viewer, 'tridi-viewer-hovered');
    });

    viewer.addEventListener('mouseleave', () => {
      if (this.verbose) console.log(Tridi.header(this.element), 'Mouseenter event triggered');
      this.removeClassName(viewer, 'tridi-viewer-hovered');
    });
  }

  private attachDragEvents() {
    if (this.draggable) {
      const viewerImage = this.getViewerImage();

      if (this.verbose) console.log(Tridi.header(this.element), 'Attaching drag events');

      viewerImage.addEventListener('mouseup', (e) => {
        if (e.preventDefault) e.preventDefault();
        if (this.verbose) console.log(Tridi.header(this.element), 'Mouseup triggered');
        this.stopDragging();
        this.resetMoveBuffer();
      });

      viewerImage.addEventListener('mousedown', (e) => {
        if (e.preventDefault) e.preventDefault();
        if (this.verbose) console.log(Tridi.header(this.element), 'Mousedown triggered');
        this.startDragging();
        this.rotateViewerImage(e);
      });

      viewerImage.addEventListener('mousemove', (e) => {
        if (this.dragActive) {
          if (e.preventDefault) e.preventDefault();
          if (this.verbose) console.log(Tridi.header(this.element), 'Mousemove triggered');
          this.rotateViewerImage(e);
        }
      });

      viewerImage.addEventListener('mouseleave', () => {
        if (this.verbose) console.log(Tridi.header(this.element), 'Mouseleave triggered');
        this.resetMoveBuffer();
      });
    }
  }

  private attachMouseLeaveDetection() {
    if (this.mouseleaveDetect) {
      if (this.verbose) console.log(Tridi.header(this.element), 'Attaching mouseleave detection');
      
      const viewer = this.getViewer();

      viewer.addEventListener('mouseleave', () => {
        if (this.verbose) console.log(Tridi.header(this.element), 'Viewer mouseleave triggered');
        this.stopDragging();
        this.resetMoveBuffer();
      });
    }
  }

  private attachTouchEvents() {
    if (this.touch) {
      if (this.verbose) console.log(Tridi.header(this.element), 'Attaching touch events');

      const viewerImage = this.getViewerImage();

      viewerImage.addEventListener('touchstart', (e) => {
        if (e.preventDefault) e.preventDefault();
        if (this.verbose) console.log(Tridi.header(this.element), 'Touchstart triggered');
        this.startDragging();
        this.rotateViewerImage(e);
      });

      viewerImage.addEventListener('touchmove', (e) => {
        if (e.preventDefault) e.preventDefault();
        if (this.verbose) console.log(Tridi.header(this.element), 'Touchmove triggered');
        this.rotateViewerImage(e);
      });

      viewerImage.addEventListener('touchend', (e) => {
        if (e.preventDefault) e.preventDefault();
        if (this.verbose) console.log(Tridi.header(this.element), 'Touchend triggered');
        this.stopDragging();
        this.resetMoveBuffer();
      });
    }
  }

  private attachMousewheelEvents() {
    if (this.mousewheel) {
      if (this.verbose) console.log(Tridi.header(this.element), 'Attaching mousewheel events');
      
      const viewerImage = this.getViewerImage();
      const nextMove = () => this.wheelInverse ? this.previousFrame() : this.nextFrame();
      const previousMove = () => this.wheelInverse ? this.nextFrame() : this.previousFrame();
      
      viewerImage.addEventListener('wheel', (e) => {
        if (e.preventDefault) e.preventDefault();
        (e.deltaY / 120 > 0) ? nextMove() : previousMove();
      });
    }
  }

  private generateButtons() {
    if (this.buttons) {
      if (!this.getLeftButton() && !this.getRightButton()) {
        if (this.verbose) console.log(Tridi.header(this.element), 'Generating buttons');

        const leftBtn = document.createElement('div');
        const rightBtn = document.createElement('div');
        leftBtn.className += 'tridi-btn tridi-btn-left';
        leftBtn.setAttribute('tabindex', '0');
        rightBtn.className += 'tridi-btn tridi-btn-right';
        rightBtn.setAttribute('tabindex', '0');

        this.getViewer().appendChild(leftBtn);
        this.getViewer().appendChild(rightBtn);
      }
    }
  }

  private attachButtonEvents() {
    if (this.buttons) {
      const leftBtn = this.getLeftButton();
      const rightBtn = this.getRightButton();

      if (leftBtn) {
        if (this.verbose) console.log(Tridi.header(this.element), 'Attaching left button click event');

        leftBtn.addEventListener('click', () => {
          if (this.verbose) console.log(Tridi.header(this.element), 'Left button click triggered');
          this.inverse ? this.previousFrame() : this.nextFrame();
        });

        leftBtn.addEventListener('keydown', (e) => {
          if (e.which === 13) {
            if (this.verbose) console.log(Tridi.header(this.element), 'Left button Enter keydown triggered');
            this.inverse ? this.previousFrame() : this.nextFrame();
          }
        });
      }

      if (rightBtn) {
        if (this.verbose) console.log(Tridi.header(this.element), 'Attaching right button click event');

        rightBtn.addEventListener('click', () => {
          if (this.verbose) console.log(Tridi.header(this.element), 'Right button click triggered');
          this.inverse ? this.nextFrame() : this.previousFrame();
        });

        rightBtn.addEventListener('keydown', (e) => {
          if (e.which === 13) {
            if (this.verbose) console.log(Tridi.header(this.element), 'Right button Enter keydown triggered');
          this.inverse ? this.nextFrame() : this.previousFrame();
          }
        });
      }
    }
  }

  private toggleAutoplay(state:boolean, skipDelay?: boolean) {
    const delay = this.resumeAutoplayDelay;
    const speed = this.autoplaySpeed;

    if (state === false) {
      this.intervals.forEach(clearInterval);
      this.intervals = [];
    } else {
      const self = this;
      this.timeouts.forEach(clearTimeout);
      this.timeouts = [];

      if (skipDelay) {
        const autoplayInterval = setInterval(() => {
          self.nextFrame();
        }, speed);
        self.intervals.push(autoplayInterval);
      } else {
        const autoplayTimeout = setTimeout(() => {
          const autoplayInterval = setInterval(() => {
            self.nextFrame();
          }, speed);
          self.intervals.push(autoplayInterval);
        }, delay);
        self.timeouts.push(autoplayTimeout);
      }
    }
  }

  private startAutoplay() {
    if (this.autoplay) {
      if (this.verbose) console.log(Tridi.header(this.element), 'Starting autoplay');

      this.toggleAutoplay(true, true);

      if (this.stopAutoplayOnClick) {
        if (this.verbose) console.log(Tridi.header(this.element), 'Enable stop autoplay on click event');

        const viewerImage = this.getViewerImage();
        
        viewerImage.addEventListener('mousedown', () => {
          this.toggleAutoplay(false);
        });
      }
      if (this.stopAutoplayOnMouseenter) {
        if (this.verbose) console.log(Tridi.header(this.element), 'Enable stop autoplay on hover event');

        const viewerImage = this.getViewerImage();
        
        viewerImage.addEventListener('mouseenter', () => {
          if (this.verbose) console.log(Tridi.header(this.element), 'Stopping autoplay on mouseenter');
          this.toggleAutoplay(false);
        });
      }

      if(this.resumeAutoplayOnMouseleave) {
        const viewerImage = this.getViewerImage();

        viewerImage.addEventListener('mouseleave', (e) => {
          if (this.verbose) console.log(Tridi.header(this.element), 'Resuming autoplay on mouseleave');

          if (!(e.target as HTMLElement).classList.contains('tridi-btn')) {
            this.toggleAutoplay(true);
          }
        });
      }
    }
  }

  private start() {
    this.generateViewer();
    this.generateLoadingScreen();
    this.setLoadingState(true);
    this.generateViewerImage();
    this.setLoadingState(false);
    this.displayHintOnStartup(()=> {
      this.lazyLoad(() => {
        this.setLoadingState(true);
          this.generateStash();
          this.populateStash();
          this.attachCosmeticEvents();
          this.attachDragEvents();
          this.attachMouseLeaveDetection();
          this.attachTouchEvents();
          this.attachMousewheelEvents();
          this.generateButtons();
          this.attachButtonEvents();
          this.startAutoplay();
          this.setLoadingState(false);
      });
    });
  }

  load() {
    this.start();
  }
}