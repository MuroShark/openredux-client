import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { invoke } from '@tauri-apps/api/core';

interface ConfigState {
  // Visuals
  skyBrightness: number;
  bloomIntensity: number;
  volumetricFog: boolean;
  
  // Gameplay
  recoilShake: number;
  bulletTracers: boolean;
  ragdollPhysics: boolean;
  isApplying: boolean;

  // GTA V Settings
  resolution: string;
  refreshRate: string;
  screenType: string;
  vsync: string;
  
  textureQuality: string;
  shaderQuality: string;
  shadowQualityGame: string;
  reflectionQuality: string;
  reflectionMsaa: string; // New
  ssao: string; // New
  waterQuality: string;
  particlesQuality: string;
  grassQuality: string;
  postFX: string;
  tessellation: string;
  
  softShadows: string;
  shadowDistance: number;
  highResShadows: boolean;
  ultraShadows: boolean; // New
  longShadows: boolean;
  particleShadows: boolean;
  disableShadowSizeCheck: boolean;
  shadowSplitZStart: number; // New (Hidden)
  shadowSplitZEnd: number; // New (Hidden)
  shadowAircraftExpWeight: number; // New (Hidden)
  
  pedVarietyMultiplier: number;
  vehicleVarietyMultiplier: number;
  lodScale: number;
  maxLodScale: number;
  motionBlurStrength: number;
  cityDensity: number;
  pedLodBias: number; // New
  vehicleLodBias: number; // New
  reflectionMipBlur: boolean;
  fogVolumes: boolean;
  highDetailStreaming: boolean;
  dof: boolean; // New
  
  fxaa: string;
  msaa: string;
  txaa: string;
  anisotropicFiltering: string;
  dxVersion: string; // New
  
  distanceScaling: number;
  extendedDistanceScaling: number;
  populationDensity: number;
  populationVariety: number;

  // System/Audio/Video Misc
  audio3d: boolean; // New
  pauseOnFocusLoss: string; // New
  aspectRatio: string; // New

  // Hardware Info
  gpuName: string;
  vramTotal: number; // MB
  vramUsage: number; // MB (Calculated)

  gamePath: string | null;

  // Actions
  setSkyBrightness: (val: number) => void;
  setBloomIntensity: (val: number) => void;
  setRecoilShake: (val: number) => void;
  toggleVolumetricFog: () => void;
  toggleBulletTracers: () => void;
  toggleRagdollPhysics: () => void;
  resetDefaults: () => void;
  setGtaValue: (key: keyof ConfigState, value: any) => void;
  autoDetectResolution: () => Promise<void>;
  setGamePath: (path: string) => void;
  loadSettings: () => Promise<void>;
  applyConfig: () => Promise<void>;
  importGtaConfig: (path: string) => Promise<void>;
  saveGtaSettings: () => Promise<void>;
}

// Эвристика расчета VRAM (приближено к GTA V)
const calculateVram = (s: ConfigState): number => {
  // Базовое потребление (Windows + Движок игры + UI)
  // Обычно около 900-1100 МБ даже на минималках
  let mb = 1000; 

  // 1. Разрешение (Frame Buffer & G-Buffer)
  const [w, h] = s.resolution.split('x').map(Number);
  if (w && h) {
    const pixels = w * h;
    // 1080p ~ +150MB, 4K ~ +600MB (грубая оценка буферов отложенного рендеринга)
    mb += (pixels / 14000); 
  }

  // 2. MSAA (Мультисэмплинг сильно ест память)
  const msaa = parseInt(s.msaa) || 0;
  if (msaa > 0) {
    // MSAA умножает размер буферов глубины и цвета
    // X2 ~ +200MB, X4 ~ +400MB, X8 ~ +700MB (зависит от разрешения, здесь усреднено для FHD)
    const factor = msaa === 2 ? 1.5 : (msaa === 4 ? 2.5 : 4.0);
    mb += 150 * factor;
  }

  // 3. Качество текстур (Самый большой вклад)
  // 0=Normal, 1=High, 2=Very High
  const tex = parseInt(s.textureQuality) || 0;
  if (tex === 0) mb += 300;
  if (tex === 1) mb += 1100; // High загружает текстуры высокого разрешения
  if (tex >= 2) mb += 2400;  // Very High загружает несжатые/4K текстуры

  // 4. Тени
  const shadow = parseInt(s.shadowQualityGame) || 0;
  mb += shadow * 100; // Увеличение разрешения карт теней
  if (s.highResShadows) mb += 250; // Каскадные тени высокого разрешения
  
  // Мягкие тени (NVIDIA PCSS/CHS требуют больших временных буферов)
  const soft = parseInt(s.softShadows) || 0;
  if (soft >= 3) mb += 150;

  // 5. Отражения
  const refl = parseInt(s.reflectionQuality) || 0;
  mb += refl * 70;
  const reflMsaa = parseInt(s.reflectionMsaa) || 0;
  if (reflMsaa > 0) mb += 40 * (reflMsaa / 2); // Reflection MSAA

  if (parseInt(s.msaa) > 0) mb += 100; // Отражения тоже сглаживаются

  // 6. Трава и Частицы
  const grass = parseInt(s.grassQuality) || 0;
  mb += grass * 110; // Геометрия травы
  
  const part = parseInt(s.particlesQuality) || 0;
  mb += part * 40;

  // 7. PostFX (Bloom, HDR buffers)
  const post = parseInt(s.postFX) || 0;
  mb += post * 60;
  if (s.motionBlurStrength > 0) mb += 50;

  // 8. Разнообразие населения (Variety) - Загрузка уникальных моделей в память
  // Положительные значения сильно увеличивают потребление
  if (s.vehicleVarietyMultiplier > 0) mb += s.vehicleVarietyMultiplier * 120; 
  if (s.pedVarietyMultiplier > 0) mb += s.pedVarietyMultiplier * 40;
  // Отрицательные значения (оптимизация) немного освобождают память
  if (s.vehicleVarietyMultiplier < 0) mb -= Math.abs(s.vehicleVarietyMultiplier) * 30;

  // 9. Дальность прорисовки
  mb += (s.distanceScaling / 100) * 100;
  // Extended Distance Scaling очень прожорлив, так как грузит HD модели далеко
  mb += (s.extendedDistanceScaling / 100) * 350; 

  // 10. Прочее
  const shader = parseInt(s.shaderQuality) || 0;
  mb += shader * 50;
  
  const water = parseInt(s.waterQuality) || 0;
  mb += water * 40;
  
  const tess = parseInt(s.tessellation) || 0;
  mb += tess * 30;

  const ssao = parseInt(s.ssao) || 0;
  mb += ssao * 40;

  // Не даем уйти в минус или нереально низкие значения
  return Math.max(800, Math.round(mb));
};

// Helper: Parse GTA V XML Settings
const parseGtaXml = (xmlContent: string): Partial<ConfigState> => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlContent, "text/xml");
  const getVal = (tag: string) => xml.getElementsByTagName(tag)[0]?.getAttribute('value');
  const getBool = (tag: string) => getVal(tag) === 'true';
  const getFloat = (tag: string) => {
     const v = getVal(tag);
     return v ? parseFloat(v) : undefined;
  };

  const updates: Partial<ConfigState> = {};

  // 1. Display
  const w = getVal('ScreenWidth');
  const h = getVal('ScreenHeight');
  if (w && h) updates.resolution = `${w}x${h}`;

  const ref = getVal('RefreshRate');
  if (ref) updates.refreshRate = `${ref} Hz`;
  const vsync = getVal('VSync');
  if (vsync) updates.vsync = vsync;
  const win = getVal('Windowed');
  if (win) updates.screenType = win;

  // 2. Graphics Quality
  const tex = getVal('TextureQuality'); if (tex) updates.textureQuality = tex;
  const shad = getVal('ShaderQuality'); if (shad) updates.shaderQuality = shad;
  const shadow = getVal('ShadowQuality'); if (shadow) updates.shadowQualityGame = shadow;
  const refl = getVal('ReflectionQuality'); if (refl) updates.reflectionQuality = refl;
  const reflMsaa = getVal('ReflectionMSAA'); if (reflMsaa) updates.reflectionMsaa = reflMsaa;
  const ssao = getVal('SSAO'); if (ssao) updates.ssao = ssao;
  const water = getVal('WaterQuality'); if (water) updates.waterQuality = water;
  const part = getVal('ParticleQuality'); if (part) updates.particlesQuality = part;
  const grass = getVal('GrassQuality'); if (grass) updates.grassQuality = grass;
  const post = getVal('PostFX'); if (post) updates.postFX = post;
  const tess = getVal('Tessellation'); if (tess) updates.tessellation = tess;
  const dx = getVal('DX_Version'); if (dx) updates.dxVersion = dx;

  // 3. Shadows & Lighting
  const soft = getVal('Shadow_SoftShadows'); if (soft) updates.softShadows = soft;
  
  const sDist = getFloat('Shadow_Distance'); if (sDist !== undefined) updates.shadowDistance = sDist;
  updates.longShadows = getBool('Shadow_LongShadows');
  updates.ultraShadows = getBool('UltraShadows_Enabled');
  updates.particleShadows = getBool('Shadow_ParticleShadows');
  updates.disableShadowSizeCheck = getBool('Shadow_DisableScreenSizeCheck');
  
  const zStart = getFloat('Shadow_SplitZStart'); if (zStart !== undefined) updates.shadowSplitZStart = zStart;
  const zEnd = getFloat('Shadow_SplitZEnd'); if (zEnd !== undefined) updates.shadowSplitZEnd = zEnd;
  const airW = getFloat('Shadow_aircraftExpWeight'); if (airW !== undefined) updates.shadowAircraftExpWeight = airW;

  // 4. Deep Engine Tuning
  const pedVar = getFloat('PedVarietyMultiplier'); 
  if (pedVar !== undefined) {
    updates.pedVarietyMultiplier = pedVar;
    updates.populationVariety = Math.min(100, Math.round(pedVar * 100));
  }
  
  const vehVar = getFloat('VehicleVarietyMultiplier'); 
  if (vehVar !== undefined) updates.vehicleVarietyMultiplier = vehVar;
  
  const lod = getFloat('LodScale'); if (lod !== undefined) updates.lodScale = lod;
  const maxLod = getFloat('MaxLodScale'); if (maxLod !== undefined) updates.maxLodScale = maxLod;
  const mBlur = getFloat('MotionBlurStrength'); if (mBlur !== undefined) updates.motionBlurStrength = mBlur;
  
  const cityDens = getFloat('CityDensity'); 
  if (cityDens !== undefined) {
    updates.cityDensity = cityDens;
    updates.populationDensity = Math.min(100, Math.round(cityDens * 100));
  }
  
  const pedLod = getFloat('PedLodBias'); if (pedLod !== undefined) updates.pedLodBias = pedLod;
  const vehLod = getFloat('VehicleLodBias'); if (vehLod !== undefined) updates.vehicleLodBias = vehLod;

  updates.reflectionMipBlur = getBool('Reflection_MipBlur');
  updates.fogVolumes = getBool('Lighting_FogVolumes');
  updates.highDetailStreaming = getBool('HdStreamingInFlight');
  updates.dof = getBool('DoF');

  // 5. Anti-Aliasing
  updates.fxaa = getBool('FXAA_Enabled') ? "1" : "0";
  updates.txaa = getBool('TXAA_Enabled') ? "1" : "0";
  const msaa = getVal('MSAA'); if (msaa) updates.msaa = msaa;
  const af = getVal('AnisotropicFiltering'); if (af) updates.anisotropicFiltering = af;

  // 6. Distance Scaling
  const distScale = getFloat('DistanceScaling'); if (distScale !== undefined) updates.distanceScaling = Math.round(distScale * 100);
  const extDist = getFloat('ExtendedDistanceScaling'); if (extDist !== undefined) updates.extendedDistanceScaling = Math.round(extDist * 100);

  // 7. Misc
  updates.audio3d = getBool('Audio3d');
  const pause = getVal('PauseOnFocusLoss'); if (pause) updates.pauseOnFocusLoss = pause;
  const aspect = getVal('AspectRatio'); if (aspect) updates.aspectRatio = aspect;

  return updates;
};

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      // Initial Values
      skyBrightness: 75,
      bloomIntensity: 40,
      volumetricFog: true,
      recoilShake: 20,
      bulletTracers: false,
      ragdollPhysics: true,
      isApplying: false,
      
      // GTA Defaults
      resolution: "1920x1080",
      refreshRate: "179 Hz",
      screenType: "0",
      vsync: "0",
      
      textureQuality: "1",
      shaderQuality: "2",
      shadowQualityGame: "3",
      reflectionQuality: "3",
      reflectionMsaa: "0",
      ssao: "2",
      waterQuality: "1",
      particlesQuality: "2",
      grassQuality: "3",
      postFX: "2",
      tessellation: "3",
      dxVersion: "2",
      
      softShadows: "3",
      shadowDistance: 1.0,
      highResShadows: true,
      longShadows: true,
      particleShadows: false,
      disableShadowSizeCheck: true,
      ultraShadows: false,
      shadowSplitZStart: 0.93,
      shadowSplitZEnd: 0.89,
      shadowAircraftExpWeight: 0.99,
      
      pedVarietyMultiplier: 1.0,
      vehicleVarietyMultiplier: -4.7,
      lodScale: 1.0,
      maxLodScale: 0.0,
      motionBlurStrength: 0.0,
      cityDensity: 1.0,
      pedLodBias: 0.2,
      vehicleLodBias: 0.0,
      reflectionMipBlur: false,
      fogVolumes: true,
      highDetailStreaming: false,
      dof: false,
      
      fxaa: "1",
      msaa: "0",
      txaa: "0",
      anisotropicFiltering: "16",
      
      distanceScaling: 100,
      extendedDistanceScaling: 20,
      populationDensity: 30,
      populationVariety: 50,

      audio3d: false,
      pauseOnFocusLoss: "1",
      aspectRatio: "0",

      // Hardware Defaults (Fallback)
      gpuName: "Unknown GPU",
      vramTotal: 4096,
      vramUsage: 1200,

      gamePath: null,

      // Setters
      setSkyBrightness: (val) => set({ skyBrightness: val }),
      setBloomIntensity: (val) => set({ bloomIntensity: val }),
      setRecoilShake: (val) => set({ recoilShake: val }),
      
      // Toggles
      toggleVolumetricFog: () => set((state) => ({ volumetricFog: !state.volumetricFog })),
      toggleBulletTracers: () => set((state) => ({ bulletTracers: !state.bulletTracers })),
      toggleRagdollPhysics: () => set((state) => ({ ragdollPhysics: !state.ragdollPhysics })),
      
      setGtaValue: (key, value) => set((state) => {
        const newState = { ...state, [key]: value };
        return { ...newState, vramUsage: calculateVram(newState) };
      }),

      autoDetectResolution: async () => {
        try {
          const res = await invoke<string>('get_screen_resolution');
          set((state) => {
            const newState = { ...state, resolution: res };
            return { ...newState, vramUsage: calculateVram(newState) };
          });
        } catch (e) {
          console.error("Failed to detect resolution", e);
        }
      },

      setGamePath: (path) => {
        set({ gamePath: path });
        // Автоматически загружаем настройки при выборе папки
        get().loadSettings();
      },

      loadSettings: async () => {
        const { gamePath } = get();
        set({ isApplying: true });

        // 0. Автоопределение видеокарты
        try {
          const gpuInfo = await invoke<any>('get_gpu_info');
          if (gpuInfo) {
            const name = gpuInfo.Name || "Unknown GPU";
            // AdapterRAM приходит в байтах. Конвертируем в MB.
            // Если AdapterRAM null (бывает на виртуалках), ставим дефолт 4GB
            const vramBytes = gpuInfo.AdapterRAM || (4 * 1024 * 1024 * 1024);
            const vramMb = Math.round(vramBytes / 1024 / 1024);
            
            set({ gpuName: name, vramTotal: vramMb });
          }
        } catch (e) {
          console.warn("GPU Detection failed:", e);
        }

        // 1. Загрузка settings.xml (GTA V Settings) из Документов
        try {
          const xmlPath = await invoke<string>('get_gta_settings_path');
          const xmlContent = await invoke<string>('read_file_content', { path: xmlPath });
          
          const updates = parseGtaXml(xmlContent);

          // Пересчитываем VRAM usage после загрузки всех значений
          const finalState = { ...get(), ...updates };
          updates.vramUsage = calculateVram(finalState);

          set(updates);
          console.log("Loaded GTA V settings from XML");
        } catch (e) {
          console.warn("Could not load settings.xml:", e);
        }

        // 2. Загрузка settings.yml (Mod Config) из папки игры
        if (gamePath) {
          try {
            const ymlContent = await invoke<string>('read_file_content', { path: `${gamePath}\\settings.yml` });
            
            const updates: Partial<ConfigState> = {};
            
            // Простой парсер YAML (key: value)
            const parseKey = (key: string, type: 'int'|'bool' = 'int') => {
                const regex = new RegExp(`${key}:\\s*(\\w+)`);
                const match = ymlContent.match(regex);
                if (match) {
                    if (type === 'int') return parseInt(match[1]);
                    if (type === 'bool') return match[1] === 'true';
                }
                return undefined;
            };

            const sky = parseKey('skyBrightness');
            if (sky !== undefined) updates.skyBrightness = sky as number;
            
            const bloom = parseKey('bloomIntensity');
            if (bloom !== undefined) updates.bloomIntensity = bloom as number;

            const fog = parseKey('volumetricFog', 'bool');
            if (fog !== undefined) updates.volumetricFog = fog as boolean;

            const recoil = parseKey('recoilShake');
            if (recoil !== undefined) updates.recoilShake = recoil as number;

            const tracers = parseKey('bulletTracers', 'bool');
            if (tracers !== undefined) updates.bulletTracers = tracers as boolean;

            const ragdoll = parseKey('ragdollPhysics', 'bool');
            if (ragdoll !== undefined) updates.ragdollPhysics = ragdoll as boolean;

            // Пересчитываем VRAM usage (хотя настройки мода обычно не влияют на VRAM игры напрямую, но для консистентности)
            const finalState = { ...get(), ...updates };
            updates.vramUsage = calculateVram(finalState);

            set(updates);
            console.log("Loaded Mod settings from YAML");
          } catch (e) {
            console.warn("Could not load settings.yml from game folder:", e);
          }
        }
        set({ isApplying: false });
      },

      // Reset
      resetDefaults: () => set({
        skyBrightness: 75,
        bloomIntensity: 40,
        volumetricFog: true,
        recoilShake: 20,
        bulletTracers: false,
        ragdollPhysics: true,
        // Не сбрасываем настройки игры, так как это опасно для UX
      }),

      // Apply (Commit changes to disk/backend)
      applyConfig: async () => {
        set({ isApplying: true });
        try {
          const state = get();
          
          // 1. Сохранение settings.yml (Mod Config)
          if (state.gamePath) {
            const yamlContent = [
              `skyBrightness: ${state.skyBrightness}`,
              `bloomIntensity: ${state.bloomIntensity}`,
              `volumetricFog: ${state.volumetricFog}`,
              `recoilShake: ${state.recoilShake}`,
              `bulletTracers: ${state.bulletTracers}`,
              `ragdollPhysics: ${state.ragdollPhysics}`
            ].join('\n');

            await invoke('write_file_content', { 
              path: `${state.gamePath}\\settings.yml`, 
              content: yamlContent 
            });
            console.log("Saved settings.yml");
          }

          console.log("Config applied to game files");
        } catch (e) {
          console.error("Failed to apply config", e);
        } finally {
          set({ isApplying: false });
        }
      },

      // Import external config (XML/YML)
      importGtaConfig: async (path: string) => {
        set({ isApplying: true });
        try {
          const content = await invoke<string>('read_file_content', { path });
          const updates = parseGtaXml(content);
          
          // Apply updates but recalculate VRAM
          const finalState = { ...get(), ...updates };
          updates.vramUsage = calculateVram(finalState);
          
          set(updates);
          console.log("Imported GTA V settings from", path);
        } catch (e) {
          console.error("Failed to import config:", e);
          throw e;
        } finally {
          set({ isApplying: false });
        }
      },

      // Save to settings.xml (using user's GPU name)
      saveGtaSettings: async () => {
        set({ isApplying: true });
        try {
          const s = get();
          const [width, height] = s.resolution.split('x');
          const refresh = s.refreshRate.replace(' Hz', '');

          // Construct XML manually to ensure clean output and correct GPU substitution
          const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Settings>
  <version value="27" />
  <configSource>SMC_AUTO</configSource>
  <graphics>
    <Tessellation value="${s.tessellation}" />
    <LodScale value="${s.lodScale.toFixed(6)}" />
    <PedLodBias value="${s.pedLodBias.toFixed(6)}" />
    <VehicleLodBias value="${s.vehicleLodBias.toFixed(6)}" />
    <ShadowQuality value="${s.shadowQualityGame}" />
    <ReflectionQuality value="${s.reflectionQuality}" />
    <ReflectionMSAA value="${s.reflectionMsaa}" />
    <SSAO value="${s.ssao}" />
    <AnisotropicFiltering value="${s.anisotropicFiltering}" />
    <MSAA value="${s.msaa}" />
    <MSAAFragments value="0" />
    <MSAAQuality value="0" />
    <SamplingMode value="0" />
    <TextureQuality value="${s.textureQuality}" />
    <ParticleQuality value="${s.particlesQuality}" />
    <WaterQuality value="${s.waterQuality}" />
    <GrassQuality value="${s.grassQuality}" />
    <ShaderQuality value="${s.shaderQuality}" />
    <Shadow_SoftShadows value="${s.softShadows}" />
    <UltraShadows_Enabled value="${s.ultraShadows}" />
    <Shadow_ParticleShadows value="${s.particleShadows}" />
    <Shadow_Distance value="${s.shadowDistance.toFixed(6)}" />
    <Shadow_LongShadows value="${s.longShadows}" />
    <Shadow_SplitZStart value="${s.shadowSplitZStart.toFixed(6)}" />
    <Shadow_SplitZEnd value="${s.shadowSplitZEnd.toFixed(6)}" />
    <Shadow_aircraftExpWeight value="${s.shadowAircraftExpWeight.toFixed(6)}" />
    <Shadow_DisableScreenSizeCheck value="${s.disableShadowSizeCheck}" />
    <Reflection_MipBlur value="${s.reflectionMipBlur}" />
    <FXAA_Enabled value="${s.fxaa === '1'}" />
    <TXAA_Enabled value="${s.txaa === '1'}" />
    <Lighting_FogVolumes value="${s.fogVolumes}" />
    <Shader_SSA value="true" />
    <DX_Version value="${s.dxVersion}" />
    <CityDensity value="${s.cityDensity.toFixed(6)}" />
    <PedVarietyMultiplier value="${s.pedVarietyMultiplier.toFixed(6)}" />
    <VehicleVarietyMultiplier value="${s.vehicleVarietyMultiplier.toFixed(6)}" />
    <PostFX value="${s.postFX}" />
    <DoF value="${s.dof}" />
    <HdStreamingInFlight value="${s.highDetailStreaming}" />
    <MaxLodScale value="${s.maxLodScale.toFixed(6)}" />
    <MotionBlurStrength value="${s.motionBlurStrength.toFixed(6)}" />
    <DistanceScaling value="${(s.distanceScaling / 100).toFixed(6)}" />
    <ExtendedDistanceScaling value="${(s.extendedDistanceScaling / 100).toFixed(6)}" />
  </graphics>
  <system>
    <numBytesPerReplayBlock value="9000000" />
    <numReplayBlocks value="30" />
    <maxSizeOfStreamingReplay value="1024" />
    <maxFileStoreSize value="65536" />
  </system>
  <audio>
    <Audio3d value="${s.audio3d}" />
  </audio>
  <video>
    <AdapterIndex value="0" />
    <OutputIndex value="0" />
    <ScreenWidth value="${width}" />
    <ScreenHeight value="${height}" />
    <RefreshRate value="${refresh}" />
    <Windowed value="${s.screenType}" />
    <VSync value="${s.vsync}" />
    <Stereo value="0" />
    <Convergence value="0.100000" />
    <Separation value="1.000000" />
    <PauseOnFocusLoss value="${s.pauseOnFocusLoss}" />
    <AspectRatio value="${s.aspectRatio}" />
  </video>
  <VideoCardDescription>${s.gpuName}</VideoCardDescription>
</Settings>`;

          const path = await invoke<string>('get_gta_settings_path');
          await invoke('write_file_content', { path, content: xml });
          console.log("Saved settings.xml to", path);
        } catch (e) {
          console.error("Failed to save settings.xml:", e);
          throw e;
        } finally {
          set({ isApplying: false });
        }
      },
    }),
    {
      name: 'redux-config-storage', // уникальное имя в localStorage
      storage: createJSONStorage(() => localStorage), // можно заменить на адаптер для Tauri fs
    }
  )
);
