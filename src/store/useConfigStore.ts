import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  waterQuality: string;
  particlesQuality: string;
  grassQuality: string;
  postFX: string;
  tessellation: string;
  
  softShadows: string;
  shadowDistance: number;
  highResShadows: boolean;
  longShadows: boolean;
  particleShadows: boolean;
  disableShadowSizeCheck: boolean;
  
  pedVarietyMultiplier: number;
  vehicleVarietyMultiplier: number;
  lodScale: number;
  maxLodScale: number;
  motionBlurStrength: number;
  cityDensity: number;
  reflectionMipBlur: boolean;
  fogVolumes: boolean;
  highDetailStreaming: boolean;
  
  fxaa: string;
  msaa: string;
  txaa: string;
  anisotropicFiltering: string;
  
  distanceScaling: number;
  extendedDistanceScaling: number;
  populationDensity: number;
  populationVariety: number;

  // Actions
  setSkyBrightness: (val: number) => void;
  setBloomIntensity: (val: number) => void;
  setRecoilShake: (val: number) => void;
  toggleVolumetricFog: () => void;
  toggleBulletTracers: () => void;
  toggleRagdollPhysics: () => void;
  resetDefaults: () => void;
  setGtaValue: (key: keyof ConfigState, value: any) => void;
  applyConfig: () => Promise<void>;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
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
      waterQuality: "1",
      particlesQuality: "2",
      grassQuality: "3",
      postFX: "2",
      tessellation: "3",
      
      softShadows: "3",
      shadowDistance: 1.0,
      highResShadows: true,
      longShadows: true,
      particleShadows: false,
      disableShadowSizeCheck: true,
      
      pedVarietyMultiplier: 1.0,
      vehicleVarietyMultiplier: -4.7,
      lodScale: 1.0,
      maxLodScale: 0.0,
      motionBlurStrength: 0.0,
      cityDensity: 1.0,
      reflectionMipBlur: false,
      fogVolumes: true,
      highDetailStreaming: false,
      
      fxaa: "1",
      msaa: "0",
      txaa: "0",
      anisotropicFiltering: "16",
      
      distanceScaling: 100,
      extendedDistanceScaling: 20,
      populationDensity: 30,
      populationVariety: 50,

      // Setters
      setSkyBrightness: (val) => set({ skyBrightness: val }),
      setBloomIntensity: (val) => set({ bloomIntensity: val }),
      setRecoilShake: (val) => set({ recoilShake: val }),
      
      // Toggles
      toggleVolumetricFog: () => set((state) => ({ volumetricFog: !state.volumetricFog })),
      toggleBulletTracers: () => set((state) => ({ bulletTracers: !state.bulletTracers })),
      toggleRagdollPhysics: () => set((state) => ({ ragdollPhysics: !state.ragdollPhysics })),
      
      setGtaValue: (key, value) => set((state) => ({ ...state, [key]: value })),

      // Reset
      resetDefaults: () => set({
        skyBrightness: 75,
        bloomIntensity: 40,
        volumetricFog: true,
        recoilShake: 20,
        bulletTracers: false,
        ragdollPhysics: true,
      }),

      // Apply (Commit changes to disk/backend)
      applyConfig: async () => {
        set({ isApplying: true });
        try {
          // Здесь будет вызов API или Tauri Command для записи файла
          // await invoke('save_redux_config', { config: get() });
          await new Promise(resolve => setTimeout(resolve, 1000)); // Эмуляция
          console.log("Config applied to game files");
        } catch (e) {
          console.error("Failed to apply config", e);
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
