
import {
  AmbientLight,
  BufferGeometry,
  CanvasTexture,
  LinearFilter,
  Mesh,
  MeshPhongMaterial,
  NearestFilter,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  WebGLRenderer
} from 'three';
import {ARENA_CEILING, ARENA_SIZE, CAMERA_HEIGHT} from "./game.config";
import floorCanvas from "./canvas/FloorCanvas";
import tailCanvas from "./canvas/TailCanvas";
// @ts-ignore // Apparently, the @types/three.js is outdated and does not contain mergeGeometries()
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils';
import MovingPointLight from "./entities/MovingPointLight";
import time from './util/Time';
import game from "./Game";

const scene = new Scene();

const FIELD_OF_VIEW = 45;
const ASPECT_RATIO = innerWidth / innerHeight;
const MIN_RENDER_DISTANCE = 0.1;
const MAX_RENDER_DISTANCE = 100;

/**
 * Manages the three.js scene creation, arena building and configuration of the renderer.
 * Also contains the topmost game loop (render()).
 */
class SceneManager {
  canvas: HTMLCanvasElement;
  renderer: WebGLRenderer;
  camera: PerspectiveCamera;
  tailsTexture: CanvasTexture;
  floorTexture: CanvasTexture;
  pointLight: MovingPointLight;

  /**
   * Creates the renderer, builds- and initializes all components of the scene.
   */
  public init() {
    this.canvas = document.querySelector('canvas');
    this.renderer = new WebGLRenderer({antialias: true, canvas: this.canvas});
    this.camera = new PerspectiveCamera(FIELD_OF_VIEW, ASPECT_RATIO, MIN_RENDER_DISTANCE, MAX_RENDER_DISTANCE);
    this.tailsTexture = new CanvasTexture(tailCanvas.getCanvas());
    this.floorTexture = new CanvasTexture(floorCanvas.getCanvas());
    this.pointLight = new MovingPointLight();

    // ORBIT CONTROLS (drag mouse to move camera)
    // const controls = new OrbitControls(this.camera, this.canvas);
    // controls.target.set(0, 5, 0);
    // controls.update();

    window.addEventListener('resize', this.resize);
    this.resize();

    this.camera.position.set(0, CAMERA_HEIGHT, 0);
    this.camera.lookAt(0, 0, 0);
    this.renderer.shadowMap.enabled = true;

    this.initTailsSurface();
    this.initFloorSurface();
    this.initSkybox();
    this.initAmbientLight();

    requestAnimationFrame(this.render.bind(this));
  }

  /**
   * Resizes the canvas to which the game is rendered, to fit the size of the browser window.
   * @private
   */
  private resize() {
    this.canvas.width = innerWidth;
    this.canvas.height = innerHeight;
    this.renderer.setSize(innerWidth, innerHeight);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Creates the surface which displays the player tails and adds it to the scene.
   * @private
   */
  private initTailsSurface() {
    const planeGeo = new PlaneGeometry(ARENA_SIZE.x, ARENA_SIZE.y);
    const phongMaterial = new MeshPhongMaterial({map: this.tailsTexture, transparent: true});
    const mesh = new Mesh(planeGeo, phongMaterial);

    this.tailsTexture.minFilter = LinearFilter;
    this.tailsTexture.magFilter = NearestFilter;

    // Could remove without major visual impact to improve performance
    mesh.receiveShadow = true;

    mesh.position.set(0, 0.001, 0);
    mesh.rotation.x = Math.PI * -.5;
    scene.add(mesh);
  }

  /**
   * Creates the surface which displays game messages and adds it to the scene.
   * @private
   */
  private initFloorSurface() {
    const planeGeo = new PlaneGeometry(ARENA_SIZE.x, ARENA_SIZE.y);
    const basicMaterial = new MeshPhongMaterial({map: this.floorTexture});
    const mesh = new Mesh(planeGeo, basicMaterial);

    this.floorTexture.minFilter = LinearFilter;
    this.floorTexture.magFilter = NearestFilter;

    mesh.receiveShadow = true;
    mesh.rotation.x = Math.PI * -.5;
    mesh.renderOrder = 1;
    scene.add(mesh);
  }

  /**
   * Creates the walls that enclose the arena from the top/left/bottom/right and adds them to the scene.
   * @private
   */
  private initSkybox() {
    const material = new MeshPhongMaterial({color: '#ccc'});

    const top = new PlaneGeometry(ARENA_SIZE.x, ARENA_CEILING)
      .translate(0, ARENA_CEILING / 2, -ARENA_SIZE.y / 2);

    const bottom = top.clone()
      .rotateY(Math.PI);

    const left = new PlaneGeometry(ARENA_SIZE.y, ARENA_CEILING)
      .rotateY(Math.PI / 2)
      .translate(-ARENA_SIZE.x / 2, ARENA_CEILING / 2, 0);

    const right = left.clone()
      .rotateY(Math.PI)

    const skyboxGeometry: BufferGeometry = mergeGeometries([top, bottom, left, right]);
    const mesh = new Mesh(skyboxGeometry, material);

    mesh.receiveShadow = true;
    scene.add(mesh);
  }

  /**
   * Creates an ambient light and adds it to the scene.
   * @private
   */
  private initAmbientLight() {
    const color = 0xFFFFFF;
    const intensity = 0.4;
    const ambientLight = new AmbientLight(color, intensity);

    scene.add(ambientLight);
  }

  /**
   * The topmost game loop. Renders the scene and updates the game.
   * This method is called roughly 60 times per second.
   */
  private render() {
    time.updateMillis();
    game.update();

    if (this.pointLight.update) this.pointLight.update();

    requestAnimationFrame(tailCanvas.draw.bind(tailCanvas));
    requestAnimationFrame(floorCanvas.draw.bind(floorCanvas));

    this.tailsTexture.needsUpdate = true;
    this.floorTexture.needsUpdate = true;

    this.renderer.render(scene, this.camera);

    requestAnimationFrame(this.render.bind(this));
  }
}

export default scene;
export const sceneManager = new SceneManager();