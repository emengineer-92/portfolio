/**
 * Exact Fluid Engine from https://www.aaabadcode.com/
 * High-definition (1440 DYE), silky 60/120fps WebGL fluid dynamics,
 * natural fluid dissipation, 3D specular liquid shading,
 * and seamless window-wide cursor tracking.
 */

(function () {
  function initAaabadcodeFluid() {
    let canvas = document.getElementById("fluid") || document.getElementById("particle-canvas");
    if (!canvas) return;

    let dyeBuffer, velocityBuffer, divergenceBuffer, curlBuffer, pressureBuffer;

    function resizeCanvas() {
      let width = scaleByPixelRatio(canvas.clientWidth);
      let height = scaleByPixelRatio(canvas.clientHeight);
      if (canvas.width != width || canvas.height != height) {
        canvas.width = width;
        canvas.height = height;
        return true;
      }
      return false;
    }

    resizeCanvas();

    let config = {
      SIM_RESOLUTION: 128,
      DYE_RESOLUTION: 1024,
      DENSITY_DISSIPATION: 0.85, // Smooth, gentle dissipation so color stays subtle and light
      VELOCITY_DISSIPATION: 2.5,  // Velvety drifting motion
      PRESSURE: 0.15,
      PRESSURE_ITERATIONS: 20,
      CURL: 2.2,                 // Soft, natural ambient curling
      SPLAT_RADIUS: 0.25,        // Soft wider dispersion
      SPLAT_FORCE: 5200,
      SHADING: true,
      COLOR_UPDATE_SPEED: 8
    };

    let pointers = [];
    function Pointer() {
      this.id = -1;
      this.texcoordX = 0;
      this.texcoordY = 0;
      this.prevTexcoordX = 0;
      this.prevTexcoordY = 0;
      this.deltaX = 0;
      this.deltaY = 0;
      this.down = false;
      this.moved = false;
      this.color = [0, 0, 0];
    }
    pointers.push(new Pointer());

    let { gl, ext } = (function (c) {
      let halfFloat, linear;
      let rgba, rg, r;
      let attrs = {
        alpha: true,
        depth: false,
        stencil: false,
        antialias: false,
        preserveDrawingBuffer: false
      };
      let glCtx = c.getContext("webgl2", attrs);
      let isWebGL2 = !!glCtx;
      if (!isWebGL2) {
        glCtx = c.getContext("webgl", attrs) || c.getContext("experimental-webgl", attrs);
      }
      if (isWebGL2) {
        glCtx.getExtension("EXT_color_buffer_float");
        linear = glCtx.getExtension("OES_texture_float_linear");
      } else {
        halfFloat = glCtx.getExtension("OES_texture_half_float");
        linear = glCtx.getExtension("OES_texture_half_float_linear");
      }
      glCtx.clearColor(0, 0, 0, 1);
      let halfFloatTexType = isWebGL2 ? glCtx.HALF_FLOAT : halfFloat.HALF_FLOAT_OES;
      if (isWebGL2) {
        rgba = getSupportedFormat(glCtx, glCtx.RGBA16F, glCtx.RGBA, halfFloatTexType);
        rg = getSupportedFormat(glCtx, glCtx.RG16F, glCtx.RG, halfFloatTexType);
        r = getSupportedFormat(glCtx, glCtx.R16F, glCtx.RED, halfFloatTexType);
      } else {
        rgba = getSupportedFormat(glCtx, glCtx.RGBA, glCtx.RGBA, halfFloatTexType);
        rg = getSupportedFormat(glCtx, glCtx.RGBA, glCtx.RGBA, halfFloatTexType);
        r = getSupportedFormat(glCtx, glCtx.RGBA, glCtx.RGBA, halfFloatTexType);
      }
      return {
        gl: glCtx,
        ext: {
          formatRGBA: rgba,
          formatRG: rg,
          formatR: r,
          halfFloatTexType: halfFloatTexType,
          supportLinearFiltering: linear
        }
      };
    })(canvas);

    function getSupportedFormat(gl, internalFormat, format, type) {
      if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
        switch (internalFormat) {
          case gl.R16F:
            return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
          case gl.RG16F:
            return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
          default:
            return null;
        }
      }
      return { internalFormat, format };
    }

    function supportRenderTextureFormat(gl, internalFormat, format, type) {
      let texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
      let fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      return gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE;
    }

    if (!ext.supportLinearFiltering) {
      config.DYE_RESOLUTION = 256;
      config.SHADING = false;
    }

    class Material {
      constructor(vertexShader, fragmentShaderSource) {
        this.vertexShader = vertexShader;
        this.fragmentShaderSource = fragmentShaderSource;
        this.programs = [];
        this.activeProgram = null;
        this.uniforms = [];
      }
      setKeywords(keywords) {
        let hash = 0;
        for (let i = 0; i < keywords.length; i++) {
          hash += hashCode(keywords[i]);
        }
        let program = this.programs[hash];
        if (program == null) {
          let fragmentShader = createShader(gl.FRAGMENT_SHADER, this.fragmentShaderSource, keywords);
          program = createProgram(this.vertexShader, fragmentShader);
          this.programs[hash] = program;
        }
        if (program != this.activeProgram) {
          this.uniforms = getUniforms(program);
          this.activeProgram = program;
        }
      }
      bind() {
        gl.useProgram(this.activeProgram);
      }
    }

    class Program {
      constructor(vertexShader, fragmentShader) {
        this.uniforms = {};
        this.program = createProgram(vertexShader, fragmentShader);
        this.uniforms = getUniforms(this.program);
      }
      bind() {
        gl.useProgram(this.program);
      }
    }

    function createProgram(vertexShader, fragmentShader) {
      let program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.trace(gl.getProgramInfoLog(program));
      }
      return program;
    }

    function getUniforms(program) {
      let uniforms = [];
      let count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < count; i++) {
        let uniformName = gl.getActiveUniform(program, i).name;
        uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
      }
      return uniforms;
    }

    function createShader(type, source, keywords) {
      source = addKeywords(source, keywords);
      let shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.trace(gl.getShaderInfoLog(shader));
      }
      return shader;
    }

    function addKeywords(source, keywords) {
      if (keywords == null) return source;
      let output = "";
      keywords.forEach(k => { output += "#define " + k + "\n"; });
      return output + source;
    }

    function hashCode(s) {
      if (s.length == 0) return 0;
      let hash = 0;
      for (let i = 0; i < s.length; i++) {
        hash = (hash << 5) - hash + s.charCodeAt(i) | 0;
      }
      return hash;
    }

    let baseVertexShader = createShader(gl.VERTEX_SHADER, `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 texelSize;
      void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `);

    let copyShader = createShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;
      void main () {
        gl_FragColor = texture2D(uTexture, vUv);
      }
    `);

    let clearShader = createShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;
      void main () {
        gl_FragColor = value * texture2D(uTexture, vUv);
      }
    `);

    let splatShader = createShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;
      void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
      }
    `);

    let advectionShader = createShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform vec2 dyeTexelSize;
      uniform float dt;
      uniform float dissipation;

      vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
        vec2 st = uv / tsize - 0.5;
        vec2 iuv = floor(st);
        vec2 fuv = fract(st);
        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
      }

      void main () {
      #ifdef MANUAL_FILTERING
        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
        vec4 result = bilerp(uSource, coord, dyeTexelSize);
      #else
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        vec4 result = texture2D(uSource, coord);
      #endif
        float decay = 1.0 + dissipation * dt;
        gl_FragColor = result / decay;
      }
    `, ext.supportLinearFiltering ? null : ["MANUAL_FILTERING"]);

    let divergenceShader = createShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) { L = -C.x; }
        if (vR.x > 1.0) { R = -C.x; }
        if (vT.y > 1.0) { T = -C.y; }
        if (vB.y < 0.0) { B = -C.y; }
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
      }
    `);

    let curlShader = createShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
      }
    `);

    let vorticityShader = createShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      uniform sampler2D uCurl;
      uniform float curl;
      uniform float dt;
      void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity += force * dt;
        velocity = min(max(velocity, -1000.0), 1000.0);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `);

    let pressureShader = createShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float C = texture2D(uPressure, vUv).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
      }
    `);

    let gradientSubtractShader = createShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    let blit = function (destination, clear = false) {
      if (destination == null) {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        gl.viewport(0, 0, destination.width, destination.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, destination.fbo);
      }
      if (clear) {
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };

    let copyProgram = new Program(baseVertexShader, copyShader);
    let clearProgram = new Program(baseVertexShader, clearShader);
    let splatProgram = new Program(baseVertexShader, splatShader);
    let advectionProgram = new Program(baseVertexShader, advectionShader);
    let divergenceProgram = new Program(baseVertexShader, divergenceShader);
    let curlProgram = new Program(baseVertexShader, curlShader);
    let vorticityProgram = new Program(baseVertexShader, vorticityShader);
    let pressureProgram = new Program(baseVertexShader, pressureShader);
    let gradSubtractProgram = new Program(baseVertexShader, gradientSubtractShader);

    let displayMaterial = new Material(baseVertexShader, `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uTexture;
      uniform vec2 texelSize;

      void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
      #ifdef SHADING
        vec3 lc = texture2D(uTexture, vL).rgb;
        vec3 rc = texture2D(uTexture, vR).rgb;
        vec3 tc = texture2D(uTexture, vT).rgb;
        vec3 bc = texture2D(uTexture, vB).rgb;
        float dx = length(rc) - length(lc);
        float dy = length(tc) - length(bc);
        vec3 n = normalize(vec3(dx, dy, length(texelSize)));
        vec3 l = vec3(0.0, 0.0, 1.0);
        float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
        c *= diffuse;
      #endif
        float a = max(c.r, max(c.g, c.b));
        gl_FragColor = vec4(c, a);
      }
    `);

    function initFramebuffers() {
      let simRes = getResolution(config.SIM_RESOLUTION);
      let dyeRes = getResolution(config.DYE_RESOLUTION);
      let type = ext.halfFloatTexType;
      let rgba = ext.formatRGBA;
      let rg = ext.formatRG;
      let r = ext.formatR;
      let filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

      gl.disable(gl.BLEND);
      dyeBuffer = dyeBuffer == null
        ? createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, type, filtering)
        : resizeDoubleFBO(dyeBuffer, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, type, filtering);

      velocityBuffer = velocityBuffer == null
        ? createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, type, filtering)
        : resizeDoubleFBO(velocityBuffer, simRes.width, simRes.height, rg.internalFormat, rg.format, type, filtering);

      divergenceBuffer = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, type, gl.NEAREST);
      curlBuffer = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, type, gl.NEAREST);
      pressureBuffer = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, type, gl.NEAREST);
    }

    function createFBO(w, h, internalFormat, format, type, param) {
      gl.activeTexture(gl.TEXTURE0);
      let texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

      let fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT);

      return {
        texture,
        fbo,
        width: w,
        height: h,
        texelSizeX: 1 / w,
        texelSizeY: 1 / h,
        attach: function (id) {
          gl.activeTexture(gl.TEXTURE0 + id);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          return id;
        }
      };
    }

    function createDoubleFBO(w, h, internalFormat, format, type, param) {
      let fbo1 = createFBO(w, h, internalFormat, format, type, param);
      let fbo2 = createFBO(w, h, internalFormat, format, type, param);
      return {
        width: w,
        height: h,
        texelSizeX: fbo1.texelSizeX,
        texelSizeY: fbo1.texelSizeY,
        get read() { return fbo1; },
        set read(val) { fbo1 = val; },
        get write() { return fbo2; },
        set write(val) { fbo2 = val; },
        swap() {
          let temp = fbo1;
          fbo1 = fbo2;
          fbo2 = temp;
        }
      };
    }

    function resizeFBO(target, w, h, internalFormat, format, type, param) {
      let newFBO = createFBO(w, h, internalFormat, format, type, param);
      copyProgram.bind();
      gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
      blit(newFBO);
      return newFBO;
    }

    function resizeDoubleFBO(target, w, h, internalFormat, format, type, param) {
      if (target.width == w && target.height == h) return target;
      target.read = resizeFBO(target.read, w, h, internalFormat, format, type, param);
      target.write = createFBO(w, h, internalFormat, format, type, param);
      target.width = w;
      target.height = h;
      target.texelSizeX = 1 / w;
      target.texelSizeY = 1 / h;
      return target;
    }

    let keywords = [];
    if (config.SHADING) keywords.push("SHADING");
    displayMaterial.setKeywords(keywords);

    initFramebuffers();

    let lastUpdateTime = Date.now();
    let colorUpdateTimer = 0;

    function step(dt) {
      gl.disable(gl.BLEND);

      // 1. Curl
      curlProgram.bind();
      gl.uniform2f(curlProgram.uniforms.texelSize, velocityBuffer.texelSizeX, velocityBuffer.texelSizeY);
      gl.uniform1i(curlProgram.uniforms.uVelocity, velocityBuffer.read.attach(0));
      blit(curlBuffer);

      // 2. Vorticity confinement
      vorticityProgram.bind();
      gl.uniform2f(vorticityProgram.uniforms.texelSize, velocityBuffer.texelSizeX, velocityBuffer.texelSizeY);
      gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocityBuffer.read.attach(0));
      gl.uniform1i(vorticityProgram.uniforms.uCurl, curlBuffer.attach(1));
      gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
      gl.uniform1f(vorticityProgram.uniforms.dt, dt);
      blit(velocityBuffer.write);
      velocityBuffer.swap();

      // 3. Divergence
      divergenceProgram.bind();
      gl.uniform2f(divergenceProgram.uniforms.texelSize, velocityBuffer.texelSizeX, velocityBuffer.texelSizeY);
      gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocityBuffer.read.attach(0));
      blit(divergenceBuffer);

      // 4. Pressure clear
      clearProgram.bind();
      gl.uniform1i(clearProgram.uniforms.uTexture, pressureBuffer.read.attach(0));
      gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
      blit(pressureBuffer.write);
      pressureBuffer.swap();

      // 5. Pressure Poisson solve
      pressureProgram.bind();
      gl.uniform2f(pressureProgram.uniforms.texelSize, velocityBuffer.texelSizeX, velocityBuffer.texelSizeY);
      gl.uniform1i(pressureProgram.uniforms.uDivergence, divergenceBuffer.attach(0));
      for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
        gl.uniform1i(pressureProgram.uniforms.uPressure, pressureBuffer.read.attach(1));
        blit(pressureBuffer.write);
        pressureBuffer.swap();
      }

      // 6. Gradient subtract
      gradSubtractProgram.bind();
      gl.uniform2f(gradSubtractProgram.uniforms.texelSize, velocityBuffer.texelSizeX, velocityBuffer.texelSizeY);
      gl.uniform1i(gradSubtractProgram.uniforms.uPressure, pressureBuffer.read.attach(0));
      gl.uniform1i(gradSubtractProgram.uniforms.uVelocity, velocityBuffer.read.attach(1));
      blit(velocityBuffer.write);
      velocityBuffer.swap();

      // 7. Advect velocity
      advectionProgram.bind();
      gl.uniform2f(advectionProgram.uniforms.texelSize, velocityBuffer.texelSizeX, velocityBuffer.texelSizeY);
      if (!ext.supportLinearFiltering) {
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocityBuffer.texelSizeX, velocityBuffer.texelSizeY);
      }
      let velTexture = velocityBuffer.read.attach(0);
      gl.uniform1i(advectionProgram.uniforms.uVelocity, velTexture);
      gl.uniform1i(advectionProgram.uniforms.uSource, velTexture);
      gl.uniform1f(advectionProgram.uniforms.dt, dt);
      gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
      blit(velocityBuffer.write);
      velocityBuffer.swap();

      // 8. Advect dye
      if (!ext.supportLinearFiltering) {
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, dyeBuffer.texelSizeX, dyeBuffer.texelSizeY);
      }
      gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityBuffer.read.attach(0));
      gl.uniform1i(advectionProgram.uniforms.uSource, dyeBuffer.read.attach(1));
      gl.uniform1f(advectionProgram.uniforms.dt, dt);
      gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
      blit(dyeBuffer.write);
      dyeBuffer.swap();
    }

    function update() {
      let now = Date.now();
      let dt = Math.min((now - lastUpdateTime) / 1000, 0.016666);
      lastUpdateTime = now;

      if (resizeCanvas()) initFramebuffers();

      colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED;
      if (colorUpdateTimer >= 1) {
        colorUpdateTimer = (colorUpdateTimer - 0) % 1;
        pointers.forEach(p => { p.color = generateColor(); });
      }

      pointers.forEach(p => {
        if (p.moved) {
          p.moved = false;
          let forceX = p.deltaX * config.SPLAT_FORCE;
          let forceY = p.deltaY * config.SPLAT_FORCE;
          splat(p.texcoordX, p.texcoordY, forceX, forceY, p.color);
        }
      });

      step(dt);

      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.BLEND);
      displayMaterial.bind();
      if (config.SHADING) {
        gl.uniform2f(displayMaterial.uniforms.texelSize, 1 / gl.drawingBufferWidth, 1 / gl.drawingBufferHeight);
      }
      gl.uniform1i(displayMaterial.uniforms.uTexture, dyeBuffer.read.attach(0));
      blit(null);

      requestAnimationFrame(update);
    }

    function splat(x, y, dx, dy, color) {
      splatProgram.bind();
      gl.uniform1i(splatProgram.uniforms.uTarget, velocityBuffer.read.attach(0));
      gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
      gl.uniform2f(splatProgram.uniforms.point, x, y);
      gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0);

      let rad = config.SPLAT_RADIUS / 100;
      let aspect = canvas.width / canvas.height;
      if (aspect > 1) rad *= aspect;
      gl.uniform1f(splatProgram.uniforms.radius, rad);

      blit(velocityBuffer.write);
      velocityBuffer.swap();

      gl.uniform1i(splatProgram.uniforms.uTarget, dyeBuffer.read.attach(0));
      gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
      blit(dyeBuffer.write);
      dyeBuffer.swap();
    }

    function updatePointerDownData(p, id, x, y) {
      p.id = id;
      p.down = true;
      p.moved = false;
      p.texcoordX = x / canvas.width;
      p.texcoordY = 1 - y / canvas.height;
      p.prevTexcoordX = p.texcoordX;
      p.prevTexcoordY = p.texcoordY;
      p.deltaX = 0;
      p.deltaY = 0;
      p.color = generateColor();
    }

    function updatePointerMoveData(p, x, y, color) {
      p.prevTexcoordX = p.texcoordX;
      p.prevTexcoordY = p.texcoordY;
      p.texcoordX = x / canvas.width;
      p.texcoordY = 1 - y / canvas.height;

      let dx = p.texcoordX - p.prevTexcoordX;
      let dy = p.texcoordY - p.prevTexcoordY;
      let aspect = canvas.width / canvas.height;
      if (aspect < 1) dx *= aspect;
      if (aspect > 1) dy /= aspect;

      p.deltaX = dx;
      p.deltaY = dy;
      p.moved = Math.abs(p.deltaX) > 0 || Math.abs(p.deltaY) > 0;
      p.color = color;
    }

    // Palette harmonized directly with the website's dark cyber space-navy & ambient neon gradients
    const THEME_BG_PALETTE = [
      { r: 0.22, g: 0.74, b: 0.98 }, // Cyan / Sky Blue (#38bdf8)
      { r: 0.38, g: 0.48, b: 0.98 }, // Deep Sapphire / Indigo (#6366f1)
      { r: 0.72, g: 0.50, b: 0.98 }, // Soft Lilac / Violet (#c084fc)
      { r: 0.18, g: 0.82, b: 0.76 }, // Soft Aqua / Marine Teal (#2dd4bf)
      { r: 0.55, g: 0.38, b: 0.92 }, // Cyber Purple (#8b5cf6)
      { r: 0.20, g: 0.45, b: 0.88 }  // Space Navy Blue (#3b82f6)
    ];
    let themePalIdx = 0, themePalProg = 0;

    function generateColor() {
      themePalProg += 0.035;
      if (themePalProg >= 1) {
        themePalProg = 0;
        themePalIdx = (themePalIdx + 1) % THEME_BG_PALETTE.length;
      }
      let c1 = THEME_BG_PALETTE[themePalIdx];
      let c2 = THEME_BG_PALETTE[(themePalIdx + 1) % THEME_BG_PALETTE.length];
      let smooth = (1 - Math.cos(themePalProg * Math.PI)) * 0.5;
      let r = c1.r + (c2.r - c1.r) * smooth;
      let g = c1.g + (c2.g - c1.g) * smooth;
      let b = c1.b + (c2.b - c1.b) * smooth;

      // Soft, light intensity matching the user's request ("halka, blur sa, thora thora mahsoos ho")
      const SUBTLE_INTENSITY = 0.048;
      return {
        r: r * SUBTLE_INTENSITY,
        g: g * SUBTLE_INTENSITY,
        b: b * SUBTLE_INTENSITY
      };
    }

    function getResolution(resolution) {
      let aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
      if (aspect < 1) aspect = 1 / aspect;
      let min = Math.round(resolution);
      let max = Math.round(resolution * aspect);
      return gl.drawingBufferWidth > gl.drawingBufferHeight
        ? { width: max, height: min }
        : { width: min, height: max };
    }

    function scaleByPixelRatio(input) {
      let ratio = window.devicePixelRatio || 1;
      return Math.floor(input * ratio);
    }

    // Window event listeners - exactly like aaabadcode.com
    window.addEventListener("mousedown", e => {
      let p = pointers[0];
      updatePointerDownData(p, -1, scaleByPixelRatio(e.clientX), scaleByPixelRatio(e.clientY));
      (function (pointer) {
        let c = generateColor();
        c.r *= 2.0;
        c.g *= 2.0;
        c.b *= 2.0;
        let rx = 10 * (Math.random() - 0.5);
        let ry = 30 * (Math.random() - 0.5);
        splat(pointer.texcoordX, pointer.texcoordY, rx, ry, c);
      })(p);
    });

    document.body.addEventListener("mousemove", function onFirstMove(e) {
      let p = pointers[0];
      let x = scaleByPixelRatio(e.clientX);
      let y = scaleByPixelRatio(e.clientY);
      let color = generateColor();
      update();
      updatePointerMoveData(p, x, y, color);
      document.body.removeEventListener("mousemove", onFirstMove);
    });

    window.addEventListener("mousemove", e => {
      let p = pointers[0];
      let x = scaleByPixelRatio(e.clientX);
      let y = scaleByPixelRatio(e.clientY);
      let color = p.color;
      updatePointerMoveData(p, x, y, color);
    });

    document.body.addEventListener("touchstart", function onFirstTouch(e) {
      let touches = e.targetTouches;
      let p = pointers[0];
      for (let i = 0; i < touches.length; i++) {
        let x = scaleByPixelRatio(touches[i].clientX);
        let y = scaleByPixelRatio(touches[i].clientY);
        update();
        updatePointerDownData(p, touches[i].identifier, x, y);
      }
      document.body.removeEventListener("touchstart", onFirstTouch);
    });

    window.addEventListener("touchstart", e => {
      let touches = e.targetTouches;
      let p = pointers[0];
      for (let i = 0; i < touches.length; i++) {
        let x = scaleByPixelRatio(touches[i].clientX);
        let y = scaleByPixelRatio(touches[i].clientY);
        updatePointerDownData(p, touches[i].identifier, x, y);
      }
    });

    window.addEventListener("touchmove", e => {
      let touches = e.targetTouches;
      let p = pointers[0];
      for (let i = 0; i < touches.length; i++) {
        updatePointerMoveData(p, scaleByPixelRatio(touches[i].clientX), scaleByPixelRatio(touches[i].clientY), p.color);
      }
    }, false);

    window.addEventListener("touchend", () => {
      let p = pointers[0];
      p.down = false;
    });

    // Start rendering loop immediately
    update();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAaabadcodeFluid);
  } else {
    initAaabadcodeFluid();
  }
})();
